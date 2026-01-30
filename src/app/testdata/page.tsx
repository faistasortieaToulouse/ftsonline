'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Ta base fixe de 216 (Saints, Prénoms, Célébrations, Discord, etc.)
  const NB_BASE_MANUEL = 216;

  useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await fetch('/api/data');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Erreur de récupération:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCounts();
  }, []);

  // Calcul du total final
  const totalGlobal = NB_BASE_MANUEL + 
    (data?.agenda || 0) + 
    (data?.meetup || 0) + 
    (data?.cinema || 0) + 
    (data?.jeux || 0);

  return (
    <main className="p-4">
      {/* SECTION COMPTEUR DÉTAILLÉ */}
      <div className="max-w-2xl mx-auto mb-10 p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="text-center mb-4 font-medium text-slate-500 italic">
          Nombre total de ressources : 
          <span className="font-bold text-purple-600 ml-2 text-2xl">
            {loading ? "..." : totalGlobal}
          </span> articles
        </div>

        {/* DÉTAIL DU CALCUL */}
        {!loading && data && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            <div className="flex flex-col items-center p-2 bg-slate-50 rounded">
              <span>📚 Manuel</span>
              <span className="text-slate-900 text-sm">{NB_BASE_MANUEL}</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-blue-50 rounded">
              <span>📅 Agenda</span>
              <span className="text-blue-600 text-sm">{data.agenda}</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-orange-50 rounded">
              <span>🤝 Meetup</span>
              <span className="text-orange-600 text-sm">{data.meetup}</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-red-50 rounded">
              <span>🎬 Cinéma</span>
              <span className="text-red-600 text-sm">{data.cinema}</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-yellow-50 rounded">
              <span>🎲 Jeux</span>
              <span className="text-yellow-600 text-sm">{data.jeux}</span>
            </div>
          </div>
        )}
      </div>

      {/* Reste de ta page... */}
    </main>
  );
}
