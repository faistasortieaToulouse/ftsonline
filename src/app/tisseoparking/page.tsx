"use client";
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Imports dynamiques pour Leaflet
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

export default function ParkingPage() {
  const [parkings, setParkings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    // Import de Leaflet pour l'icône personnalisée
    import('leaflet').then((leaflet) => {
      setL(leaflet);
    });

    fetch('/api/tisseoparking')
      .then(res => res.json())
      .then(data => {
        setParkings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center text-white bg-gray-900 min-h-screen">Chargement des parkings...</div>;

  // Configuration de l'icône par défaut (correction bug Next.js/Leaflet)
  const parkingIcon = L ? new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2892/2892914.png', // Icône "P"
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [1, -34],
  }) : null;

  return (
    <main className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 text-blue-400 italic text-center">Parkings Relais Tisséo</h1>

      <div className="h-[600px] w-full rounded-2xl mb-8 shadow-2xl border-2 border-gray-700 overflow-hidden">
        <MapContainer center={[43.6047, 1.4442]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          
          {parkings.map((p, idx) => {
            const pos: [number, number] = [p.geo_point_2d.lat, p.geo_point_2d.lon];
            
            return (
              <Marker key={idx} position={pos} icon={parkingIcon || undefined}>
                <Popup>
                  <div className="text-gray-900">
                    <h3 className="font-bold text-lg border-b mb-2">{p.nom}</h3>
                    <p><b>📍 Adresse :</b> {p.adresse}</p>
                    <p className="text-blue-600"><b>🚗 Places totales :</b> {p.nb_places}</p>
                    <p className="text-green-600"><b>🚲 Places vélos :</b> {p.nb_velo}</p>
                    <p className="mt-2 text-xs italic text-gray-500">{p.info}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {parkings.map((p, idx) => (
          <div key={idx} className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-blue-500 transition-colors">
            <h2 className="text-xl font-bold text-blue-400">{p.nom}</h2>
            <p className="text-sm text-gray-400 mb-2">{p.commune}</p>
            <div className="flex justify-between text-sm">
              <span>🚗 {p.nb_places} places</span>
              <span>🚲 {p.nb_velo} vélos</span>
              <span className="text-green-400">{p.gratuit === "T" ? "Gratuit" : "Payant"}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
