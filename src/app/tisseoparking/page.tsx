"use client";
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Imports dynamiques sans le composant ChangeView complexe
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

interface TisseoParking {
  nom: string;
  adresse: string;
  nb_places: number;
  nb_velo: number;
  nb_pmr: number;
  commune: string;
  gratuit: string;
  geo_point_2d: { lon: number; lat: number };
}

export default function ParkingRelaisPage() {
  const [parkings, setParkings] = useState<TisseoParking[]>([]);
  const [loading, setLoading] = useState(true);
  const [leafletLib, setLeafletLib] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const L = (await import('leaflet')).default;
      setLeafletLib(L);

      try {
        const res = await fetch('/api/tisseoparking');
        const data = await res.json();
        const sorted = data.sort((a: any, b: any) => a.nom.localeCompare(b.nom));
        setParkings(sorted);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    init();
  }, []);

  const createNumIcon = (index: number) => {
    if (!leafletLib) return null;
    return leafletLib.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color:#2563eb; color:white; border-radius:50%; width:28px; height:28px; display:flex; justify-content:center; align-items:center; font-weight:bold; border:2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${index + 1}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  };

  if (loading) return <div className="p-10 text-center bg-white min-h-screen font-sans">Chargement des parkings...</div>;

  return (
    <main className="p-8 bg-white min-h-screen text-black font-sans">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <h1 className="text-3xl font-bold mb-6 border-b pb-2 italic text-blue-600">Parkings Relais</h1>

      {/* Carte stable sans recentrage automatique */}
      <div className="h-[450px] w-full rounded-2xl mb-8 border border-gray-200 overflow-hidden relative shadow-md" style={{ zIndex: 1 }}>
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
                    <div className="text-xs text-gray-600">{p.adresse}</div>
                    <div className="mt-1 font-bold text-[10px]">{p.nb_places} PLACES</div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>

      {/* Grille d'information simplifiée */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {parkings.map((item, index) => (
          <div 
            key={index} 
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-blue-600 text-white font-black h-8 w-8 flex items-center justify-center rounded-full text-sm shadow-sm">
                {index + 1}
              </span>
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.commune}</div>
                <div className="text-sm font-bold text-gray-900 leading-tight uppercase">{item.nom}</div>
              </div>
            </div>

            <div className="text-xs space-y-3">
              <p className="text-gray-500 flex items-start gap-2">
                <span>📍</span> {item.adresse}
              </p>
              <div className="flex gap-2">
                <span className="bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg flex-1 text-center">
                  <b className="text-blue-600 text-sm block">{item.nb_places}</b> places
                </span>
                <span className="bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg flex-1 text-center">
                  <b className="text-blue-600 text-sm block">{item.nb_velo}</b> vélos
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
