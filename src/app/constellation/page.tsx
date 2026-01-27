'use client';

import { useEffect, useState } from 'react';

export default function ConstellationPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const res = await fetch(`/api/constellation?lat=${pos.coords.latitude}&month=${new Date().getMonth()}`);
      const json = await res.json();
      setData(json);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-10 text-center">Calcul des étoiles en cours...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 font-display">
        Constellations du mois - Hémisphère {data.hemisphere}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.constellations.map((c: any) => (
          <div key={c.name} className="p-4 rounded-xl border bg-slate-900 text-white shadow-lg">
            <h2 className="text-xl font-bold text-blue-300">{c.name}</h2>
            <p className="text-sm opacity-80">Visible actuellement à Toulouse et alentours.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
