"use client";
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// 1. Imports dynamiques pour éviter les erreurs SSR (Server Side Rendering)
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false });

// 2. Composant pour recentrer la carte (utilise require pour éviter les bugs d'import dynamique)
function ChangeView({ bounds }: { bounds: [number, number][] }) {
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
        // Gestion de la structure Tisséo (soit un tableau, soit un objet avec .records)
        let items = Array.isArray(data) ? data : (data.records || []);
        
        // Extraction profonde : On fusionne tout pour ne rien rater
        items = items.map((item: any) => ({
          ...(item.fields || {}),
          ...item,
          // Priorité à la géométrie
          geometry: item.geometry || item.fields?.geo_shape || item.geo_shape
        }));

        // Tri naturel (L1, L2, 10...)
        items.sort((a: any, b: any) => {
          const nameA = String(a.nom_court || a.shortname || a.ligne || a.line_short_name || "");
          const nameB = String(b.nom_court || b.shortname || b.ligne || b.line_short_name || "");
          return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
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
      // Tisséo renvoie souvent du MultiLineString (plusieurs segments)
      let coords = geo.coordinates;
      if (geo.type === "MultiLineString") {
        coords = geo.coordinates.flat(1);
      }

      // Crucial : Inversion [Lon, Lat] (Tisséo) -> [Lat, Lon] (Leaflet)
      return coords.map((c: any) => [c[1], c[0]]);
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
        <MapContainer center={[43.6047, 1.4442]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          
          {selectedLigne && activePositions.length > 0 && (
            <>
              <Polyline 
                positions={activePositions} 
                pathOptions={{ 
                  color: selectedLigne.couleur_ligne || selectedLigne.color || '#ff6600', 
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
          // On teste toutes les clés possibles pour le nom
          const displayName = ligne.nom_court || ligne.shortname || ligne.ligne || ligne.line_short_name || "Ligne";
          const color = ligne.couleur_ligne || ligne.color || "#555";
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
