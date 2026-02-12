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
      // On utilise timeout pour laisser le temps à la Polyline de s'ajouter
      setTimeout(() => {
        map.fitBounds(bounds, { padding: [50, 50], animate: true });
      }, 100);
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
        // Gestion flexible de la source des données
        const rawItems = data.records || data.results || (Array.isArray(data) ? data : []);
        
        const items = rawItems.map((item: any) => {
          const fields = item.fields || item;
          // On cherche la géométrie de façon très large
          const geo = item.geometry || fields.geo_shape || fields.geometry;
          
          return {
            ...fields,
            displayGeometry: geo // On stocke la géométrie nettoyée ici
          };
        });

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
    // On regarde dans l'objet que nous avons construit au-dessus
    const geo = ligne.displayGeometry;
    if (!geo || !geo.coordinates) return [];
    
    try {
      // Cas 1 : MultiLineString (très fréquent chez Tisséo)
      if (geo.type === "MultiLineString") {
        // On aplatit les segments
        return geo.coordinates.flat(1).map((c: any) => [c[1], c[0]]);
      } 
      // Cas 2 : LineString simple
      if (geo.type === "LineString") {
        return geo.coordinates.map((c: any) => [c[1], c[0]]);
      }
      return [];
    } catch (e) {
      console.error("Erreur de coordonnées pour la ligne:", ligne.nom_court, e);
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
          const displayName = ligne.nom_court || ligne.shortname || ligne.line_short_name || "Ligne";
          const color = ligne.couleur_ligne || (ligne.couleur_html ? `#${ligne.couleur_html}` : "#555");
          const isSelected = selectedLigne === ligne;

          return (
            <button
              key={index}
              onClick={() => {
                console.log("Ligne sélectionnée:", ligne); // Vérifie ici si displayGeometry existe
                setSelectedLigne(ligne);
              }}
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
