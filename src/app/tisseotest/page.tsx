"use client";
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react'; // Importation de l'icône
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';

export default function TisseoPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const polylineLayerRef = useRef<any>(null); // Pour pouvoir effacer/remplacer le tracé
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fonction pour afficher un tracé spécifique sur la carte
  const showLineOnMap = async (lineData: any) => {
    if (!mapInstance.current) return;
    const L = (await import('leaflet')).default;

    // Supprimer l'ancien tracé s'il existe
    if (polylineLayerRef.current) {
      mapInstance.current.removeLayer(polylineLayerRef.current);
    }

    const rawCoords = lineData?.geo_shape?.geometry?.coordinates;
    
    // Gestion MULTILINESTRING (ton JSON actuel) ou LINESTRING
    if (rawCoords) {
      // On aplatit les coordonnées si c'est un MultiLineString pour faire un seul tracé
      const isMulti = lineData.geo_shape.geometry.type === "MultiLineString";
      const coordsToProcess = isMulti ? rawCoords[0] : rawCoords;

      const path = coordsToProcess.map((c: any) => [c[1], c[0]]);
      
      polylineLayerRef.current = L.polyline(path, {
        color: '#ef4444', // Rouge vif
        weight: 6,
        opacity: 0.9,
        lineJoin: 'round'
      }).addTo(mapInstance.current);

      mapInstance.current.fitBounds(polylineLayerRef.current.getBounds(), { padding: [50, 50] });
    }
  };

  useEffect(() => {
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      try {
        const res = await fetch('/api/tisseotest');
        const jsonData = await res.json();
        const lines = Array.isArray(jsonData) ? jsonData : [jsonData];
        setData(lines);

        if (!mapRef.current || mapInstance.current) return;

        mapInstance.current = L.map(mapRef.current).setView([43.6047, 1.4442], 12);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(mapInstance.current);

        // Afficher le premier tracé par défaut
        if (lines.length > 0) showLineOnMap(lines[0]);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    initMap();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      
      {/* HEADER AVEC BOUTON RETOUR */}
      <div className="flex items-center justify-between mb-6">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          Retour à l'Accueil
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Tracés du Réseau Tisséo</h1>
      </div>

      {/* CARTE - z-index réduit pour laisser passer Translate */}
      <div className="bg-white p-2 rounded-xl shadow-md mb-8 relative z-10">
        <div 
          ref={mapRef} 
          className="w-full h-[400px] md:h-[500px] rounded-lg border border-slate-200"
        />
      </div>

      {/* TABLEAU DE DONNÉES */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
        <div className="p-4 bg-slate-100 border-b border-slate-200">
          <h2 className="font-semibold text-slate-700">Sélectionnez une ligne pour voir le tracé</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 border-b">Ligne</th>
                <th className="px-6 py-3 border-b">Point Central</th>
                <th className="px-6 py-3 border-b">Géométrie</th>
                <th className="px-6 py-3 border-b">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item, idx) => (
                <tr 
                  key={idx} 
                  onClick={() => showLineOnMap(item)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full font-bold text-sm shadow-sm group-hover:bg-blue-700">
                      Ligne {item.nom || idx + 1} 
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {item.geo_point_2d.lat.toFixed(4)}, {item.geo_point_2d.lon.toFixed(4)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-600">
                      {item.geo_shape.geometry.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {item.geo_shape.geometry.coordinates[0].length} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSS Injection pour Google Translate et Z-Index */}
      <style jsx global>{`
        /* Assure que la barre Google Translate reste au-dessus de tout */
        .skiptranslate, #google_translate_element {
          z-index: 9999 !important;
        }
        /* Ajuste la carte pour ne pas masquer les menus */
        .leaflet-container {
          z-index: 1 !important;
        }
      `}</style>
    </div>
  );
}
