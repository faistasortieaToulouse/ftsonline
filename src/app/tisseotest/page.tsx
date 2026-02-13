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

  const showLineOnMap = async (lineData: any) => {
    if (!mapInstance.current) return;
    const L = (await import('leaflet')).default;

    if (polylineLayerRef.current) {
      mapInstance.current.removeLayer(polylineLayerRef.current);
    }

    const geom = lineData?.geo_shape?.geometry;
    const rawCoords = geom?.coordinates;
    
    if (rawCoords) {
      const isMulti = geom.type === "MultiLineString";
      const coordsToProcess = isMulti ? rawCoords[0] : rawCoords;
      const path = coordsToProcess.map((c: any) => [c[1], c[0]]);
      
      // Utilisation de la couleur RGB dynamique du JSON pour le tracé
      const lineColor = `rgb(${lineData.r}, ${lineData.v}, ${lineData.b})`;

      polylineLayerRef.current = L.polyline(path, {
        color: lineColor, 
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
        let lines = Array.isArray(jsonData) ? jsonData : [jsonData];
        
        // TRI PAR ID_LIGNE (Ordre croissant)
        lines.sort((a, b) => a.id_ligne.localeCompare(b.id_ligne, undefined, {numeric: true}));

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
      
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium">
          <ArrowLeft size={20} />
          Retour à l'Accueil
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Réseau Tisséo</h1>
      </div>

      <div className="bg-white p-2 rounded-xl shadow-md mb-8 relative z-10">
        <div ref={mapRef} className="w-full h-[400px] md:h-[500px] rounded-lg border border-slate-200" />
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
        <div className="p-4 bg-slate-100 border-b border-slate-200">
          <h2 className="font-semibold text-slate-700">Sélectionnez une ligne</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 border-b">id_ligne</th>
                <th className="px-6 py-3 border-b">ligne</th>
                <th className="px-6 py-3 border-b">nom_ligne</th>
                <th className="px-6 py-3 border-b">couleur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item, idx) => (
                <tr 
                  key={idx} 
                  onClick={() => showLineOnMap(item)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4 font-mono text-sm text-slate-500">
                    {item.id_ligne}
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      style={{ backgroundColor: `rgb(${item.r}, ${item.v}, ${item.b})` }}
                      className="text-white px-3 py-1 rounded font-bold text-sm shadow-sm"
                    >
                      {item.ligne}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                    {item.nom_ligne}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: `rgb(${item.r}, ${item.v}, ${item.b})` }}
                      />
                      {item.couleur}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx global>{`
        body { top: 0 !important; }
        .skiptranslate, #google_translate_element {
          z-index: 9999 !important;
        }
        .leaflet-container {
          z-index: 1 !important;
        }
      `}</style>
    </div>
  );
}
