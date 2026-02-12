"use client";
import { useEffect, useState } from 'react';

interface TisseoItineraire {
  id_ligne: string;
  ligne: string;
  nom_iti: string;
  mode: string;
  dist_spa: number;
  geo_point_2d: { lon: number; lat: number };
}

export default function TisseoPage() {
  const [itineraires, setItineraires] = useState<TisseoItineraire[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tisseoitineraire')
      .then((res) => res.json())
      .then((data) => {
        setItineraires(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center">Chargement des itinéraires...</div>;

  return (
    <main className="p-8 bg-gray-50 min-h-screen text-black">
      <h1 className="text-3xl font-bold mb-6 border-b pb-2 italic text-orange-600">
        Réseau Tisséo - Itinéraires
      </h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {itineraires.map((item, index) => (
          <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-orange-500 text-white font-bold px-3 py-1 rounded text-lg">
                {item.ligne}
              </span>
              <h2 className="font-semibold text-gray-800 uppercase tracking-tight">
                {item.nom_iti}
              </h2>
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              <p>📍 <strong>Position :</strong> {item.geo_point_2d.lat}, {item.geo_point_2d.lon}</p>
              <p>🚌 <strong>Mode :</strong> {item.mode}</p>
              <p>📏 <strong>Distance :</strong> {(item.dist_spa / 1000).toFixed(2)} km</p>
            </div>

            <button className="mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
              Voir le tracé détaillé
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
