"use client";
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';

export default function TisseoPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const polylineLayerRef = useRef<any>(null);
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fonction pour afficher un tracé spécifique sur la carte
  const showLineOnMap = async (lineData: any) => {
    if (!mapInstance.current) return;
    const L = (await import('leaflet')).default;

    if (polylineLayerRef.current) {
      mapInstance.current.removeLayer(polylineLayerRef.current);
    }

    const geom = lineData?.geo_shape?.geometry;
    const rawCoords = geom?.coordinates;
    
    if (rawCoords) {
      // Gestion robuste MultiLineString vs LineString
      // Si MultiLineString, on fusionne ou on prend le premier segment
      const coordsToProcess = geom.type === "MultiLineString" ? rawCoords[0] : rawCoords;

      const path = coordsToProcess.map((c: any) => [c[1], c[0]]);
      
      polylineLayerRef.current = L.polyline(path, {
        color: '#ef4444',
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
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium bg-white px-4 py-2 rounded-lg shadow-sm"
        >
          <ArrowLeft size={20} />
          Retour à l'Accueil
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-slate-800">Tracés du Réseau Tisséo</h1>
      </div>

      {/* CARTE */}
      <div className="bg-white p-2 rounded-xl shadow-md mb-8 relative z-10">
        <div 
          ref={mapRef} 
          className="w-full h-[400px] md:h-[500px] rounded-lg border border-slate-200"
        />
      </div>

      {/* TABLEAU */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
        <div className="p-4 bg-slate-100 border-b border-slate-200">
          <h2 className="font-semibold text-slate-700">Lignes disponibles ({data.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 border-b">Numéro de Ligne</th>
                <th className="px-6 py-3 border-b">Position (Lat, Lon)</th>
                <th className="px-6 py-3 border-b">Type</th>
                <th className="px-6 py-3 border-b">Complexité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item, idx) => {
                // TENTATIVE DE RÉCUPÉRATION DU NOM RÉEL
                const lineName = item.fields?.line_short_name || 
                                 item.properties?.short_name || 
                                 item.route_short_name ||
                                 `Ligne ${idx + 1}`;

                return (
                  <tr 
                    key={idx} 
                    onClick={() => showLineOnMap(item)}
                    className="hover:bg-blue-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <span className="bg-blue-600 text-white px-4 py-1.5 rounded-md font-black text-sm shadow-sm group-hover:bg-blue-700">
                        {lineName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">
                      {item.geo_point_2d.lat.toFixed(5)}, {item.geo_point_2d.lon.toFixed(5)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold bg-slate-200 px-2 py-1 rounded text-slate-700">
                        {item.geo_shape.geometry.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {item.geo_shape.geometry.coordinates[0]?.length || 0} points
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FIX Z-INDEX GOOGLE TRANSLATE */}
      <style jsx global>{`
        /* On empêche le body de descendre si la barre translate apparaît */
        body { top: 0 !important; }
        .skiptranslate { z-index: 99999 !important; }
        .leaflet-container { z-index: 1 !important; }
        .leaflet-pane { z-index: 1 !important; }
        .leaflet-top, .leaflet-bottom { z-index: 2 !important; }
      `}</style>
    </div>
  );
}
