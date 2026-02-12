"use client";
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Imports dynamiques
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

// Composant de gestion de vue corrigé
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    // Vérification de sécurité pour s'assurer que map existe et possède setView
    if (map && center && typeof map.setView === 'function') {
      map.setView(center, 16);
    }
  }, [center, map]);
  return null;
}

export default function ParkingRelaisPage() {
  const [parkings, setParkings] = useState<TisseoParking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParking, setSelectedParking] = useState<TisseoParking | null>(null);
  const [leafletLib, setLeafletLib] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      // Import dynamique de Leaflet pour éviter les erreurs SSR
      const L = (await import('leaflet')).default;
      setLeafletLib(L);

      try {
        const res = await fetch('/api/tisseoparking');
        const data = await res.json();
        const sorted = data.sort((a: any, b: any) => a.nom.localeCompare(b.nom));
        setParkings(sorted);
        setLoading(false);
      } catch (err) {
        console.error("Erreur chargement data:", err);
        setLoading(false);
      }
    };
    init();
  }, []);

  // Création de l'icône numérotée
  const createNumIcon = (index: number) => {
    if (!leafletLib) return null;
    return leafletLib.divIcon({
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

      <div className="h-96 w-full rounded-xl mb-8 border border-gray-200 overflow-hidden relative shadow-sm" style={{ zIndex: 1 }}>
        {typeof window !== 'undefined' && (
          <MapContainer center={[43.6047, 1.4442]} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            
            {parkings.map((p, idx) => {
              const icon = createNumIcon(idx);
              return (
                <Marker 
                  key={`${idx}-${p.nom}`} 
                  position={[p.geo_point_2d.lat, p.geo_point_2d.lon]}
                  icon={icon || undefined}
                >
                  <Popup>
                    <div className="font-bold text-blue-600">N°{idx + 1} - {p.nom}</div>
                    <div className="text-xs">{p.adresse}</div>
                  </Popup>
                </Marker>
              );
            })}

            {selectedParking && (
              <ChangeView center={[selectedParking.geo_point_2d.lat, selectedParking.geo_point_2d.lon]} />
            )}
          </MapContainer>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {parkings.map((item, index) => {
          const isSelected = selectedParking?.nom === item.nom;
          return (
            <div 
              key={index} 
              className={`bg-white p-5 rounded-xl border transition-all flex flex-col justify-between ${
                isSelected ? 'border-blue-500 ring-1 ring-blue-400' : 'border-gray-100 shadow-sm'
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
                </div>
                <div className="mb-4 text-sm font-bold uppercase text-gray-800">{item.nom}</div>
                <div className="text-xs space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-100 text-gray-600">
                  <p>📍 {item.adresse}</p>
                  <p>🚗 <b>{item.nb_places}</b> places | 🚲 <b>{item.nb_velo}</b> vélos</p>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </main>
  );
}
