"use client";
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false });
const useMap = dynamic(() => import('react-leaflet').then(m => m.useMap), { ssr: false });

interface TisseoLigne {
  id_ligne: string;
  nom_ligne: string;
  nom_court: string;
  couleur_ligne: string;
  geometry?: {
    type: string;
    coordinates: any;
  };
}

function ChangeView({ bounds }: { bounds: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (map && bounds && bounds.length > 0) {
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
        // On s'assure que data est un tableau et on trie
        const items = Array.isArray(data) ? data : (data.records || []);
        setLignes(items);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  // Transformation sécurisée des coordonnées
  const getPositions = (ligne: TisseoLigne): [number, number][] => {
    if (!ligne.geometry || !ligne.geometry.coordinates) return [];
    
    // Tisséo envoie souvent du MultiLineString ou LineString
    const coords = ligne.geometry.type === "MultiLineString" 
      ? ligne.geometry.coordinates[0] 
      : ligne.geometry.coordinates;

    return coords.map((coord: any) => [coord[1], coord[0]]); // Inversion [lon, lat] -> [lat, lon]
  };

  if (loading) return <div className="p-10 text-center text-white bg-gray-900 min-h-screen">Chargement des tracés...</div>;

  const activePositions = selectedLigne ? getPositions(selectedLigne) : [];

  return (
    <main className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 text-orange-500 italic">Tracés du Réseau Tisséo</h1>

      <div className="h-[500px] w-full rounded-2xl mb-6 shadow-2xl border-2 border-gray-700 overflow-hidden relative">
        {typeof window !== 'undefined' && (
          <MapContainer center={[43.6047, 1.4442]} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            
            {selectedLigne && activePositions.length > 0 && (
              <>
                <Polyline 
                  positions={activePositions} 
                  pathOptions={{ 
                    color: selectedLigne.couleur_ligne || '#ff6600', 
                    weight: 5, 
                    opacity: 0.8 
                  }} 
                />
                <ChangeView bounds={activePositions} />
              </>
            )}
          </MapContainer>
        )}
      </div>

      <p className="text-center text-sm text-gray-400 mb-8 italic">
        Cliquez sur un numéro de ligne pour afficher son tracé complet sur la carte.
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        {lignes.map((ligne, index) => (
          <button
            key={index}
            onClick={() => setSelectedLigne(ligne)}
            style={{ 
              borderColor: ligne.couleur_ligne || '#555',
              backgroundColor: selectedLigne?.id_ligne === ligne.id_ligne ? (ligne.couleur_ligne || '#fff') : 'transparent'
            }}
            className={`px-4 py-2 rounded-xl border-2 transition-all font-bold min-w-[60px] ${
              selectedLigne?.id_ligne === ligne.id_ligne ? 'text-black scale-110 shadow-lg' : 'text-white hover:bg-gray-800'
            }`}
          >
            {ligne.nom_court || ligne.id_ligne || "?"}
          </button>
        ))}
      </div>
    </main>
  );
}
