"use client";
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Imports dynamiques pour Leaflet
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false });
const useMap = dynamic(() => import('react-leaflet').then(m => m.useMap), { ssr: false });

interface TisseoLigne {
  id: string;
  nom: string;
  shortName: string; // ex: "L1"
  color: string;     // ex: "#FF0000"
  geometry: {
    type: string;
    coordinates: [number, number][][]; // Format GeoJSON pour les lignes
  };
}

function ChangeView({ bounds }: { bounds: any }) {
  const map = useMap();
  useEffect(() => {
    if (map && bounds) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [bounds, map]);
  return null;
}

export default function LignesPage() {
  const [lignes, setLignes] = useState<TisseoLigne[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLigne, setSelectedLigne] = useState<TisseoLigne | null>(null);

  useEffect(() => {
    fetch('/api/tisseoligne')
      .then(res => res.json())
      .then(data => {
        setLignes(data);
        setLoading(false);
      });
  }, []);

  // Fonction pour convertir les coordonnées [lon, lat] du JSON en [lat, lon] pour Leaflet
  const getPositions = (ligne: TisseoLigne): [number, number][] => {
    // On aplatit les segments de lignes et on inverse lon/lat
    return ligne.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
  };

  if (loading) return <div className="p-10 text-center">Chargement des lignes...</div>;

  return (
    <main className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 text-orange-500">Tracés du Réseau Tisséo</h1>

      <div className="h-[500px] w-full rounded-2xl mb-6 shadow-2xl border-2 border-gray-700 overflow-hidden relative">
        {typeof window !== 'undefined' && (
          <MapContainer center={[43.6047, 1.4442]} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            
            {selectedLigne && (
              <>
                <Polyline 
                  positions={getPositions(selectedLigne)} 
                  pathOptions={{ color: selectedLigne.color || '#ff6600', weight: 5, opacity: 0.8 }} 
                />
                <ChangeView bounds={getPositions(selectedLigne)} />
              </>
            )}
          </MapContainer>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {lignes.map((ligne, index) => (
          <button
            key={index}
            onClick={() => setSelectedLigne(ligne)}
            style={{ borderColor: ligne.color }}
            className={`px-4 py-2 rounded-full border-2 transition-all font-bold ${
              selectedLigne?.id === ligne.id ? 'bg-white text-black' : 'bg-transparent text-white hover:bg-gray-800'
            }`}
          >
            {ligne.shortName}
          </button>
        ))}
      </div>
    </main>
  );
}
