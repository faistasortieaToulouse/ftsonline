"use client";
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false });

const ChangeView = ({ bounds }: { bounds: any[] }) => {
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
        // On récupère les items peu importe la structure du JSON
        const rawItems = data.records || data.results || (Array.isArray(data) ? data : []);
        
        const items = rawItems.map((item: any) => {
          // On fusionne TOUT (racine + fields) pour ne rater aucune clé
          const merged = { ...item, ...(item.fields || {}) };
          return {
            ...merged,
            // On s'assure que la géométrie est bien au premier niveau
            geometry: item.geometry || merged.geo_shape || merged.geometry
          };
        });

        // Debug : regarde dans ta console F12 pour voir les vrais noms des clés
        console.log("Exemple de ligne reçue :", items[0]);

        items.sort((a: any, b: any) => {
          const nameA = String(a.line_short_name || a.nom_court || a.shortname || a.route_short_name || "");
          const nameB = String(b.line_short_name || b.nom_court || b.shortname || b.route_short_name || "");
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
      // Tisséo renvoie du [Lon, Lat], Leaflet veut [Lat, Lon]
      if (geo.type === "MultiLineString") {
        return geo.coordinates.flat(1).map((c: any) => [c[1], c[0]]);
      }
      return geo.coordinates.map((c: any) => [c[1], c[0]]);
    } catch (e) { return []; }
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
                  color: selectedLigne.couleur_ligne || (selectedLigne.couleur_html ? `#${selectedLigne.couleur_html}` : '#ff6600'), 
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
          // On teste TOUTES les clés possibles utilisées par l'Open Data Tisséo
          const displayName = ligne.line_short_name || 
                              ligne.nom_court || 
                              ligne.shortname || 
                              ligne.route_short_name || 
                              "ID:" + (ligne.id || index);

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
