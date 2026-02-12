"use client";
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// 1. Imports dynamiques
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false });
const useMap = dynamic(() => import('react-leaflet').then(m => m.useMap), { ssr: false });

// 2. Composant pour recentrer et ajuster la vue sur le tracé
function ChangeView({ bounds }: { bounds: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (map && bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [30, 30], animate: true });
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
        
        // Extraction et nettoyage des données
        items = items.map((item: any) => ({
          ...(item.fields || {}),
          ...item,
          geometry: item.geometry || item.fields?.geo_shape || item.geo_shape
        }));

        // Tri naturel (L1, L2, 10...)
        items.sort((a: any, b: any) => {
          const nameA = String(a.nom_court || a.shortname || a.ligne || "");
          const nameB = String(b.nom_court || b.shortname || b.ligne || "");
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
      let coords = geo.coordinates;
      if (geo.type === "MultiLineString") {
        coords = geo.coordinates.flat(1);
      }
      return coords.map((c: any) => [c[1], c[0]]);
    } catch (e) {
      return [];
    }
  };

  if (loading) return <div className="p-10 text-center">Chargement des tracés du réseau...</div>;

  const activePositions = selectedLigne ? getPositions(selectedLigne) : [];

  return (
    <main className="p-8 bg-gray-50 min-h-screen text-black">
      <h1 className="text-3xl font-bold mb-6 border-b pb-2 italic text-orange-600">
        Réseau Tisséo - Tracés des Lignes
      </h1>

      {/* Carte avec style clair */}
      <div className="h-96 w-full rounded-xl mb-8 shadow-md border-2 border-orange-200 overflow-hidden relative" style={{ zIndex: 1 }}>
        {typeof window !== 'undefined' && (
          <MapContainer center={[43.6047, 1.4442]} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
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

      <p className="text-center text-sm text-gray-500 mb-8 italic">
        Cliquez sur <span className="font-bold text-orange-600">"Afficher le tracé"</span> pour visualiser le parcours complet de la ligne sur la carte.
      </p>

      {/* Grille de cartes pour les lignes */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lignes.map((ligne, index) => {
          const displayName = ligne.nom_court || ligne.shortname || ligne.ligne || "Ligne";
          const longName = ligne.nom_long || ligne.longname || "Itinéraire non défini";
          const color = ligne.couleur_ligne || ligne.color || "#666";
          const isSelected = selectedLigne === ligne;

          return (
            <div key={index} className={`bg-white p-5 rounded-xl shadow-sm border transition-all ${isSelected ? 'border-orange-500 ring-1 ring-orange-500' : 'border-gray-200'} flex flex-col justify-between`}>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span 
                    className="text-white font-bold px-3 py-1 rounded text-lg min-w-[50px] text-center"
                    style={{ backgroundColor: color }}
                  >
                    {displayName}
                  </span>
                  <div className="text-xs font-bold uppercase text-gray-500">
                    {ligne.mode || "Bus"}
                  </div>
                </div>
                
                <div className="mb-4">
                   <div className="text-sm font-bold text-gray-800 leading-tight">
                     {longName}
                   </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedLigne(ligne)}
                className={`mt-4 w-full py-2 rounded-lg text-sm font-bold transition-all ${
                  isSelected 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-orange-50 text-orange-700 hover:bg-orange-600 hover:text-white'
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
