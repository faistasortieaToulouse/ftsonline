"use client";
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Import dynamique pour éviter les erreurs "window is not defined" avec Next.js
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const useMap = dynamic(() => import('react-leaflet').then(m => m.useMap), { ssr: false });

interface TisseoItineraire {
  id_ligne: string;
  ligne: string;
  nom_iti: string;
  mode: string;
  dist_spa: number;
  geo_point_2d: { lon: number; lat: number };
}

// Petit composant interne pour déplacer la vue de la carte
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 15);
  return null;
}

export default function TisseoPage() {
  const [itineraires, setItineraires] = useState<TisseoItineraire[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCoords, setActiveCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    fetch('/api/tisseoitineraire')
      .then((res) => res.json())
      .then((data) => {
        // 1. TRI PAR ORDRE CROISSANT DES LIGNES
        const sorted = data.sort((a: TisseoItineraire, b: TisseoItineraire) => 
          a.ligne.localeCompare(b.ligne, undefined, { numeric: true })
        );
        setItineraires(sorted);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center">Chargement des itinéraires...</div>;

  return (
    <main className="p-8 bg-gray-50 min-h-screen text-black">
      <h1 className="text-3xl font-bold mb-6 border-b pb-2 italic text-orange-600">
        Réalité Réseau Tisséo - Itinéraires
      </h1>

      {/* 2. LA CARTE (S'affiche en haut) */}
      <div className="h-96 w-full rounded-xl mb-8 shadow-md border-2 border-orange-200 overflow-hidden z-0">
        <MapContainer center={[43.6047, 1.4442]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {activeCoords && (
            <>
              <Marker position={activeCoords} />
              <ChangeView center={activeCoords} />
            </>
          )}
        </MapContainer>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {itineraires.map((item, index) => (
          <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-orange-500 text-white font-bold px-3 py-1 rounded text-lg">
                {item.ligne}
              </span>
              <h2 className="font-semibold text-gray-800 uppercase tracking-tight">
                {item.nom_iti}
              </h2>
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              <p>📍 <strong>Position :</strong> {item.geo_point_2d.lat}, {item.geo_point_2d.lon}</p>
              <p>🚌 <strong>Mode :</strong> {item.mode}</p>
              <p>📏 <strong>Distance :</strong> {(item.dist_spa / 1000).toFixed(2)} km</p>
            </div>

            {/* 3. LE BOUTON FONCTIONNEL */}
            <button 
              onClick={() => setActiveCoords([item.geo_point_2d.lat, item.geo_point_2d.lon])}
              className="mt-4 w-full py-2 bg-orange-100 hover:bg-orange-600 hover:text-white text-orange-700 rounded-lg text-sm font-medium transition-all"
            >
              Voir sur la carte
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
