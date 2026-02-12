"use client";
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// 1. On importe les composants lourds dynamiquement
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false });

// 2. IMPORTATION CRUCIALE : Le hook useMap doit être récupéré depuis le module chargé dynamiquement 
// OU on crée un wrapper. La méthode la plus sûre dans ton cas :
const ChangeView = ({ bounds }: { bounds: any[] }) => {
  // On importe le hook au sein d'un composant qui n'est rendu que dans le MapContainer
  const { useMap } = require('react-leaflet'); 
  const map = useMap();
  
  useEffect(() => {
    if (map && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [bounds, map]);
  return null;
};

export default function LignesPage() {
  const [lignes, setLignes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLigne, setSelectedLigne] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/tisseoligne')
      .then(res => res.json())
      .then(data => {
        let items = Array.isArray(data) ? data : (data.records || []);
        
        items = items.map((item: any) => ({
          ...(item.fields || item),
          geometry: item.geometry || item.fields?.geo_shape || item.geo_shape
        }));

        items.sort((a: any, b: any) => {
          const nameA = String(a.nom_court || a.shortname || "");
          const nameB = String(b.nom_court || b.shortname || "");
          return nameA.localeCompare(nameB, undefined, { numeric: true });
        });

        setLignes(items);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur Fetch:", err);
        setLoading(false);
      });
  }, []);

  const getPositions = (ligne: any): [number, number][] => {
    const geo = ligne.geometry;
    if (!geo || !geo.coordinates) return [];
    
    try {
      // Correction Leaflet : On s'assure que c'est bien [lat, lon]
      // Tisséo renvoie souvent du [lon, lat]
      if (geo.type === "MultiLineString") {
        return geo.coordinates.flat(1).map((c: any) => [c[1], c[0]]);
      }
      return geo.coordinates.map((c: any) => [c[1], c[0]]);
    } catch (e) {
      return [];
    }
  };

  if (loading) return <div className="p-10 text-center text-white bg-gray-900 min-h-screen">Chargement du réseau...</div>;

  const activePositions = selectedLigne ? getPositions(selectedLigne) : [];

  return (
    <main className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 text-orange-500 italic text-center">Tracés du Réseau Tisséo</h1>

      <div className="h-[500px] w-full rounded-2xl mb-6 shadow-2xl border-2 border-gray-700 overflow-hidden relative">
        {/* Pas besoin de typeof window ici car les composants sont déjà en ssr:false */}
        <MapContainer center={[43.6047, 1.4442]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          
          {selectedLigne && activePositions.length > 0 && (
            <>
              <Polyline 
                positions={activePositions} 
                pathOptions={{ 
                  color: selectedLigne.couleur_ligne || `#${selectedLigne.couleur_html}` || '#ff6600', 
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
          const color = ligne.couleur_ligne || (ligne.couleur_html ? `#${ligne.couleur_html}` : "#555");
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
