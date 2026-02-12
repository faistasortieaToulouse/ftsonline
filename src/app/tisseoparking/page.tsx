"use client";
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });
const useMap = dynamic(() => import('react-leaflet').then(m => m.useMap), { ssr: false });

interface TisseoParking {
  nom: string;
  adresse: string;
  nb_places: number;
  nb_velo: number;
  nb_pmr: number;
  commune: string;
  gratuit: string;
  info: string;
  geo_point_2d: { lon: number; lat: number };
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (map && typeof map.setView === 'function' && center) {
      map.setView(center, 16, { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function ParkingRelaisPage() {
  const [parkings, setParkings] = useState<TisseoParking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParking, setSelectedParking] = useState<TisseoParking | null>(null);

  useEffect(() => {
    const initLeafletFix = async () => {
      try {
        const L = (await import('leaflet')).default;
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
      } catch (e) { console.error(e); }
    };
    initLeafletFix();

    fetch('/api/tisseoparking')
      .then(res => res.json())
      .then(data => {
        setParkings(data.sort((a: any, b: any) => a.nom.localeCompare(b.nom)));
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center bg-white">Chargement des parkings...</div>;

  return (
    <main className="p-8 bg-white min-h-screen text-black">
      <h1 className="text-3xl font-bold mb-6 border-b pb-2 italic text-blue-600">Parkings Relais</h1>

      <div className="h-96 w-full rounded-xl mb-8 border border-gray-200 overflow-hidden relative" style={{ zIndex: 1 }}>
        <MapContainer center={[43.6047, 1.4442]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          {parkings.map((p, idx) => (
            <Marker key={idx} position={[p.geo_point_2d.lat, p.geo_point_2d.lon]}>
              <Popup>
                <div className="font-bold">{p.nom}</div>
                <div className="text-xs">{p.nb_places} places</div>
              </Popup>
            </Marker>
          ))}
          {selectedParking && <ChangeView center={[selectedParking.geo_point_2d.lat, selectedParking.geo_point_2d.lon]} />}
        </MapContainer>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {parkings.map((item, index) => (
          <div key={index} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-blue-600 text-white font-bold px-2 py-1 rounded text-sm">P+R</span>
                <span className="text-xs font-bold text-gray-400 uppercase">{item.commune}</span>
              </div>
              <div className="mb-4 text-sm font-bold">{item.nom}</div>
              <div className="text-xs space-y-1 bg-gray-50 p-2 rounded">
                <p>🚗 {item.nb_places} places | 🚲 {item.nb_velo} vélos</p>
              </div>
            </div>
            <button onClick={() => setSelectedParking(item)} className="mt-4 w-full py-2 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 rounded-lg text-sm font-bold transition-all">
              Localiser
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
