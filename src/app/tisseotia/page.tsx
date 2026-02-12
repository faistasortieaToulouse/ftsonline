// src/app/tisseotia/page.tsx
'use client';

import { useEffect, useState } from 'react';

interface TisseoItem {
  nom_tia: string;
  conc_mode: string;
  conc_ligne: string;
  dist_spa: number;
  code_tia: string;
}

export default function TisseoPage() {
  const [data, setData] = useState<TisseoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tisseotia')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-8">Chargement des données Tisséo...</p>;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Liaisons Tisséo (TIA)</h1>
      <div className="grid gap-4">
        {data.map((item, index) => (
          <div key={index} className="border p-4 rounded-lg shadow-sm hover:bg-gray-50">
            <h2 className="font-semibold text-blue-600">{item.nom_tia}</h2>
            <p className="text-sm text-gray-600">
              <strong>Mode :</strong> {item.conc_mode} | <strong>Ligne :</strong> {item.conc_ligne}
            </p>
            <p className="text-sm text-gray-500 italic">Distance : {item.dist_spa}m</p>
          </div>
        ))}
      </div>
    </main>
  );
}
