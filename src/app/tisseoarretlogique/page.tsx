"use client";
import { useEffect, useState } from 'react';

interface ArretLogique {
  code_log: string;
  nom_log: string;
  conc_ligne: string;
  conc_mode: string;
  geo_point_2d: { lat: number; lon: number };
}

export default function ArretsTisseoPage() {
  const [arrets, setArrets] = useState<ArretLogique[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tisseoarretlogique')
      .then((res) => res.json())
      .then((data) => {
        setArrets(data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  if (loading) return <div className="p-8 text-center">Chargement des arrêts...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 border-b pb-2">
        Arrêts Logiques Tisséo ({arrets.length})
      </h1>
      
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead className="bg-orange-500 text-white">
            <tr>
              <th className="p-3 border">Code</th>
              <th className="p-3 border">Nom de l'arrêt</th>
              <th className="p-3 border">Lignes</th>
              <th className="p-3 border">Modes</th>
              <th className="p-3 border">Position (Lat, Lon)</th>
            </tr>
          </thead>
          <tbody>
            {arrets.map((arret, index) => (
              <tr key={index} className="hover:bg-gray-100 transition-colors">
                <td className="p-3 border font-mono text-sm">{arret.code_log}</td>
                <td className="p-3 border font-semibold">{arret.nom_log}</td>
                <td className="p-3 border">
                   <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {arret.conc_ligne}
                   </span>
                </td>
                <td className="p-3 border italic text-sm text-gray-600">{arret.conc_mode}</td>
                <td className="p-3 border text-xs">
                  {arret.geo_point_2d.lat.toFixed(4)}, {arret.geo_point_2d.lon.toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
