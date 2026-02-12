"use client";
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// 1. Imports dynamiques classiques pour les composants
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false });

// 2. Le composant ChangeView corrigé
// On n'utilise pas dynamic() pour useMap ici
function ChangeView({ bounds }: { bounds: [number, number][] }) {
  // On récupère le hook directement. Puisque ChangeView est appelé 
  // à l'intérieur de MapContainer, il a accès au contexte de la carte.
  const { useMap } = require('react-leaflet'); 
  const map = useMap();

  useEffect(() => {
    if (map && bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [bounds, map]);

  return null;
}

export default function LignesPage() {
  const [lignes, setLignes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLigne, setSelectedLigne] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/tisseoligne')
      .then(res => res.json())
      .then(data => {
        let items = Array.isArray(data) ? data : (data.records || []);
        
        // Extraction : On s'assure de garder la structure plate
        items = items.map((item: any) => ({
          ...(item.fields || item),
          geometry: item.geometry || item.fields?.geo_shape
        }));

        items.sort((a: any) => a.nom_court || a.shortname || "", undefined, { numeric: true });

        setLignes(items);
        setLoading(false);
      })
      .catch(err => console.error("Erreur Fetch:", err));
  }, []);

  const getPositions = (ligne: any): [number, number][] => {
    const geo = ligne.geometry;
    if (!geo || !geo.coordinates) return [];
    
    try {
      // Gestion MultiLineString (plus robuste)
      let coords = geo.coordinates;
      if (geo.type === "MultiLineString") {
        coords = geo.coordinates.flat(1);
      }

      // Leaflet veut [Lat, Lon], Tisséo donne [Lon, Lat]
      return coords.map((c: any) => [c[1], c[0]]);
    } catch (e) {
      return [];
    }
  };

  if (loading) return <div className="p-10 text-center text-white bg-gray-900 min-h-screen">Chargement...</div>;

  const activePositions = selectedLigne ? getPositions(selectedLigne) : [];

  return (
    <main className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 text-orange-500 italic text-center">Tracés du Réseau Tisséo</h1>

      <div className="h-[500px] w-full rounded-2xl mb-6 shadow-2xl border-2 border-gray-700 overflow-hidden relative">
        <MapContainer center={[43.6047, 1.4442]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          
          {selectedLigne && activePositions.length > 0 && (
            <>
              <Polyline 
                positions={activePositions} 
                pathOptions={{ 
                  // Vérification de la couleur (ajoute # si absent)
                  color: selectedLigne.couleur_ligne?.startsWith('#') 
                    ? selectedLigne.couleur_ligne 
                    : `#${selectedLigne.couleur_ligne || 'ff6600'}`, 
                  weight: 5, 
                  opacity: 0.9 
                }} 
              />
              <ChangeView bounds={activePositions} />
            </>
          )}
        </MapContainer>
      </div>

      <div className="flex flex-wrap gap-2 justify-center max-w-6xl mx-auto">
        {lignes.map((ligne, index) => {
          const displayName = ligne.nom_court || ligne.shortname || "Ligne";
          const color = ligne.couleur_ligne?.startsWith('#') ? ligne.couleur_ligne : `#${ligne.couleur_ligne || '555'}`;
          const isSelected = selectedLigne === ligne;

          return (
            <button
              key={index}
              onClick={() => setSelectedLigne(ligne)}
              style={{ 
                borderColor: color,
                backgroundColor: isSelected ? color : 'transparent',
              }}
              className={`px-3 py-1.5 rounded-lg border-2 transition-all font-bold min-w-[55px] text-xs ${
                isSelected ? 'text-white scale-110 shadow-lg' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              {displayName}
            </button>
          );
        })}
      </div>
    </main>
  );
}
