"use client";
import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

export default function TisseoPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      
      try {
        const res = await fetch('/api/tisseotest');
        const jsonData = await res.json();
        const lines = Array.isArray(jsonData) ? jsonData : [jsonData];
        setData(lines);

        if (!mapRef.current || mapInstance.current) return;

        // Init carte centrée sur le tracé
        mapInstance.current = L.map(mapRef.current).setView([43.546, 1.513], 13);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(mapInstance.current);

        lines.forEach((line) => {
          // Extraction du tracé (on descend dans le triple tableau)
          const rawCoords = line?.geo_shape?.geometry?.coordinates;
          
          // Ton JSON a une structure : [ [ [lon, lat], [lon, lat] ] ]
          if (rawCoords && Array.isArray(rawCoords[0])) {
            const path = rawCoords[0].map((c: any) => [c[1], c[0]]); // Inversion Lat/Lon
            
            const polyline = L.polyline(path, {
              color: '#ff0000', // Rouge pour bien le voir
              weight: 5,
              opacity: 0.7
            }).addTo(mapInstance.current);

            mapInstance.current.fitBounds(polyline.getBounds());
          }
        });
        
        setLoading(false);
      } catch (err) {
        console.error("Erreur:", err);
        setLoading(false);
      }
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Réseau Tisséo - Visualisation</h1>

      {/* CARTE */}
      <div className="bg-white p-4 rounded-xl shadow-lg mb-8">
        <div 
          ref={mapRef} 
          className="w-full h-[500px] rounded-lg border border-gray-200"
        />
      </div>

      {/* TABLEAU DE DONNÉES */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-700">Informations du tracé</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-bold">Point central (Lat/Lon)</th>
                <th className="px-6 py-4 font-bold">Type Géométrie</th>
                <th className="px-6 py-4 font-bold">Nombre de points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((item, idx) => (
                <tr key={idx} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 text-gray-700">
                    {item.geo_point_2d.lat.toFixed(5)} , {item.geo_point_2d.lon.toFixed(5)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm uppercase">
                      {item.geo_shape.geometry.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-mono">
                    {item.geo_shape.geometry.coordinates[0].length} points
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <p className="p-10 text-center text-gray-400 italic">Chargement des données du tableau...</p>}
        </div>
      </div>
    </div>
  );
}
