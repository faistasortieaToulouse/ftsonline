"use client";
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Import dynamique des composants react-leaflet
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
      map.setView(center, 16, { animate: true }); // Zoom plus serré pour un parking
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
      } catch (e) {
        console.error("Leaflet icon fix error", e);
      }
    };
    initLeafletFix();

    fetch('/api/tisseoparking')
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a: TisseoParking, b: TisseoParking) => 
          a.nom.localeCompare(b.nom)
        );
        setParkings(sorted);
        setLoading(false);
      })
      .catch(err => console.error("Erreur de chargement:", err));
  }, []);

  if (loading) return <div className="p-10 text-center">Chargement des parkings relais...</div>;

  return (
    <main className="p-8 bg-gray-50 min-h-screen text-black">
      <h1 className="text-3xl font-bold mb-6 border-b pb-2 italic text-blue-600">
        Réseau Tisséo - Parkings Relais
      </h1>

      <div className="h-96 w-full rounded-xl mb-8 shadow-md border-2 border-blue-200 overflow-hidden relative" style={{ zIndex: 1 }}>
        {typeof window !== 'undefined' && (
          <MapContainer center={[43.6047, 1.4442]} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {/* Affichage de tous les parkings sur la carte */}
            {parkings.map((p, idx) => (
              <Marker key={idx} position={[p.geo_point_2d.lat, p.geo_point_2d.lon]}>
                <Popup>
                  <div className="font-bold text-blue-600">{p.nom}</div>
                  <div className="text-xs font-semibold">{p.adresse}</div>
                  <div className="text-xs mt-1 text-gray-500">🚗 {p.nb_places} places</div>
                </Popup>
              </Marker>
            ))}

            {/* Recalage de la vue si un parking est sélectionné */}
            {selectedParking && (
              <ChangeView center={[selectedParking.geo_point_2d.lat, selectedParking.geo_point_2d.lon]} />
            )}
          </MapContainer>
        )}
      </div>

      <p className="text-center text-sm text-gray-500 mb-8 italic">
        Clique sur <span className="font-bold text-blue-600">"Localiser le parking"</span> pour zoomer sur son emplacement et voir les détails.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {parkings.map((item, index) => (
          <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-blue-600 text-white font-bold px-3 py-1 rounded text-lg">
                  P+R
                </span>
                <div className="text-xs font-bold uppercase text-gray-500">{item.commune}</div>
              </div>
              
              <div className="mb-4">
                 <div className="text-sm font-bold text-gray-800 uppercase">🏢 {item.nom}</div>
                 <div className="text-xs text-gray-600 mt-1">📍 {item.adresse}</div>
              </div>

              <div className="text-xs text-gray-600 space-y-2 bg-blue-50 p-3 rounded">
                <p>🚗 <strong>Capacité :</strong> {item.nb_places} places</p>
                <p>🚲 <strong>Vélos :</strong> {item.nb_velo} places</p>
                <p>♿ <strong>PMR :</strong> {item.nb_pmr} places</p>
                <p>💰 <strong>Tarif :</strong> {item.gratuit === "T" ? "Gratuit (sous conditions)" : "Payant"}</p>
              </div>
            </div>

            <button 
              onClick={() => setSelectedParking(item)}
              className="mt-4 w-full py-2 bg-blue-100 hover:bg-blue-600 hover:text-white text-blue-700 rounded-lg text-sm font-bold transition-all"
            >
              Localiser le parking
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
