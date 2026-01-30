'use client';

import { useEffect, useState } from 'react';

export default function TestDataPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // On appelle l'API locale
    fetch('/api/data')
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors de la récupération");
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-6 text-blue-600">Test de l'API Centrale</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          ❌ Erreur : {error}
        </div>
      )}

      {!data && !error && <p className="animate-pulse">Calcul des données en cours...</p>}

      {data && (
        <div className="space-y-6">
          {/* Résumé global */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-100 border-2 border-purple-300 rounded-lg">
              <p className="text-sm text-purple-700 uppercase font-bold">Total Ressources</p>
              <p className="text-3xl font-black">{data.totalRessources}</p>
            </div>
            <div className="p-4 bg-green-100 border-2 border-green-300 rounded-lg">
              <p className="text-sm text-green-700 uppercase font-bold">Agenda Toulouse</p>
              <p className="text-3xl font-black">{data.agenda}</p>
            </div>
            <div className="p-4 bg-blue-100 border-2 border-blue-300 rounded-lg">
              <p className="text-sm text-blue-700 uppercase font-bold">Films Cinéma</p>
              <p className="text-3xl font-black">{data.cinema}</p>
            </div>
          </div>

          {/* Affichage brut du JSON pour vérification technique */}
          <div className="mt-10">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">Données brutes (JSON) :</h2>
            <pre className="bg-gray-900 text-green-400 p-6 rounded-xl overflow-auto text-sm shadow-inner">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
