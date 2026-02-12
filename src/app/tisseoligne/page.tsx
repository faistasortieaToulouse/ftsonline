"use client";
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// 1. Imports dynamiques
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false });
const useMap = dynamic(() => import('react-leaflet').then(m => m.useMap), { ssr: false });

// 2. Composant pour recentrer la vue
function ChangeView({ bounds }: { bounds: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (map && bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], animate: true });
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
        items = items.map((item: any) => ({
          ...(item.fields || {}),
          ...item,
          geometry: item.geometry || item.fields?.geo_shape || item.geo_shape
        }));

        items.sort((a: any, b: any) => {
          const nameA = String(a.nom_court || a.shortname || a.ligne || "");
          const nameB = String(b.nom_court || b.shortname || b.ligne || "");
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
      let coords = geo.coordinates;
      if (geo.type === "MultiLineString") {
        coords = geo.coordinates.flat(1);
      }
      return coords.map((c: any) => [c[1], c[0]]);
    } catch (e) { return []; }
  };

  if (loading) return <div className="p-10 text-center bg-white min-h-screen">Chargement du réseau...</div>;

  const activePositions = selectedLigne ? getPositions(selectedLigne) : [];

  return (
    <main className="p-8 bg-white min-h-screen text-black">
      <h1 className="text-3xl font-bold mb-6 border-b pb-2 italic text-orange-600">
        Réseau Tisséo - Tracés des Lignes
      </h1>

      {/* Carte avec Fond BLANC (CartoDB Positron) */}
      <div className="h-96 w-full rounded-xl mb-8 shadow-sm border border-gray-200 overflow-hidden relative" style={{ zIndex: 1 }}>
        {typeof window !== 'undefined' && (
          <MapContainer center={[43.6047, 1.4442]} zoom={12} style={{ height: '100%', width: '100%', background: '#f8f9fa' }}>
            {/* TileLayer en mode Fond Blanc / Light */}
            <TileLayer 
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            />
            
            {selectedLigne && activePositions.length > 0 && (
              <>
                <Polyline 
                  positions={activePositions} 
                  pathOptions={{ 
                    color: selectedLigne.couleur_ligne || selectedLigne.color || '#ea580c', 
                    weight: 6, 
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
        Cliquez sur un bouton pour afficher son tracé sur le plan.
      </p>

      {/* Grille de cartes */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {lignes.map((ligne, index) => {
          const displayName = ligne.nom_court || ligne.shortname || ligne.ligne || "Ligne";
          const color = ligne.couleur_ligne || ligne.color || "#666";
          const isSelected = selectedLigne === ligne;

          return (
            <div key={index} className={`bg-white p-4 rounded-xl border transition-all ${isSelected ? 'border-orange-500 shadow-md scale-[1.02]' : 'border-gray-100 shadow-sm'} flex flex-col`}>
              <div className="flex items-center gap-3 mb-3">
                <span 
                  className="text-white font-bold px-3 py-1 rounded text-md min-w-[45px] text-center"
                  style={{ backgroundColor: color }}
                >
                  {displayName}
                </span>
                <span className="text-[10px] font-bold uppercase text-gray-400">
                  {ligne.mode || "Bus"}
                </span>
              </div>
              
              <div className="text-xs font-semibold text-gray-700 mb-4 line-clamp-2 h-8">
                {ligne.nom_long || ligne.longname || "Itinéraire Tisséo"}
              </div>

              <button 
                onClick={() => setSelectedLigne(ligne)}
                className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${
                  isSelected 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-50 text-gray-600 hover:bg-orange-600 hover:text-white border border-gray-100'
                }`}
              >
                {isSelected ? 'Tracé affiché' : 'Afficher le tracé'}
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
