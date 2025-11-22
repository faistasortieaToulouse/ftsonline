'use client';

import { useEffect, useState } from 'react';

export default function TestAPIPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    // Nouvelle URL de l'API Toulouse Métropole
    fetch("https://data.toulouse-metropole.fr/api/records/1.0/search/?dataset=agenda-des-manifestations-culturelles-so-toulouse&rows=1000&sort=date_debut")
      .then(res => {
        if (!res.ok) throw new Error("Erreur HTTP " + res.status);
        return res.json();
      })
      .then(json => setData(json))
      .catch(err => setError(err.message));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Test API Toulouse Métropole (Agenda Culturel)</h1>

      {error && <p className="text-red-500">Erreur : {error}</p>}

      {!data && !error && <p>Chargement…</p>}

      {data && (
        <pre className="bg-black text-green-400 p-4 rounded-lg overflow-auto text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}