'use client';

import { useEffect, useState } from 'react';

export default function TestAPIPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    fetch("https://data.haute-garonne.fr/api/explore/v2.1/catalog/datasets/evenements-publics/records?limit=20")
      .then(res => {
        if (!res.ok) throw new Error("Erreur HTTP " + res.status);
        return res.json();
      })
      .then(json => setData(json))
      .catch(err => setError(err.message));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Test API Haute-Garonne</h1>

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
