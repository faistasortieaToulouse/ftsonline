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

// Composant pour forcer le déplacement de la caméra
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (map && center) {
      map.setView(center, 16, { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function ParkingRelaisPage() {
  const [parkings, setParkings] = useState<TisseoParking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParking, setSelectedParking] = useState<TisseoParking | null>(null);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    // Import de Leaflet côté client pour les icônes personnalisées
    import('leaflet').then((leaflet) => {
      setL(leaflet.default);
      fetch('/api/tisseoparking')
        .then(res => res.json())
        .then(data => {
          const sorted = data.sort((a: any, b: any) => a.nom.localeCompare(b.nom));
          setParkings(sorted);
          setLoading(false);
        });
    });
  }, []);

  // Fonction pour créer un marqueur avec le numéro du parking
  const createNumIcon = (index: number) => {
    if (!L) return null;
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color:#2563eb; color:white; border-radius:50%; width:28px; height:28px; display:flex; justify-content:center; align-items:center; font-weight:bold; border:2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${index + 1}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  };

  if (loading) return <div className="p-10 text-center bg-white min-h-screen">Chargement des parkings...</div>;

  return (
    <main className="p-8 bg-white min-h-screen text-black">
      <h1 className="text-3xl font-bold mb-6 border-b pb-2 italic text-blue-600">Parkings Relais</h1>

      {/* Carte Fond Blanc avec marqueurs numérotés */}
      <div className="h-96 w-full rounded-xl mb-8 border border-gray-200 overflow-hidden relative shadow-inner" style={{ zIndex: 1 }}>
        <MapContainer center={[43.6047, 1.4442]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          
          {parkings.map((p, idx) => {
            const icon = createNumIcon(idx);
            return icon ? (
              <Marker 
                key={idx} 
                position={[p.geo_point_2d.lat, p.geo_point_2d.lon]}
                icon={icon}
              >
                <Popup>
                  <div className="font-bold text-blue-600">N°{idx + 1} - {p.nom}</div>
                  <div className="text-xs">{p.adresse}</div>
                  <div className="text-xs font-bold mt-1 text-gray-500">{p.nb_places} places</div>
                </Popup>
              </Marker>
            ) : null;
          })}

          {selectedParking && (
            <ChangeView center={[selectedParking.geo_point_2d.lat, selectedParking.geo_point_2d.lon]} />
          )}
        </MapContainer>
      </div>

      {/* Grille des parkings numérotés */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {parkings.map((item, index) => (
          <div 
            key={index} 
            className={`bg-white p-5 rounded-xl border transition-all flex flex-col justify-between ${
              selectedParking?.nom === item.nom ? 'border-blue-500 ring-1 ring-blue-400' : 'border-gray-100 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="bg-blue-600 text-white font-bold h-7 w-7 flex items-center justify-center rounded-full text-sm">
                    {index + 1}
                  </span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.commune}</span>
                </div>
                {item.gratuit === "T" && (
                  <span className="text-[10px] font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded border border-green-100">GRATUIT</span>
                )}
              </div>
              
              <div className="mb-4 text-sm font-bold uppercase text-gray-800">{item.nom}</div>
              
              <div className="text-xs space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-gray-500 italic">📍 {item.adresse}</p>
                <div className="flex gap-4 font-semibold text-gray-700">
                  <span>🚗 {item.nb_places} places</span>
                  <span>🚲 {item.nb_velo} vélos</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setSelectedParking({...item})} 
              className={`mt-5 w-full py-2.5 rounded-lg text-sm font-bold transition-all ${
                selectedParking?.nom === item.nom 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-100'
              }`}
            >
              {selectedParking?.nom === item.nom ? 'Parking localisé' : 'Localiser le parking'}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
