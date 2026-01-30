'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const NB_BASE_MANUEL = 216;

  useEffect(() => {
    async function fetchCounts() {
      setLoading(true);
      try {
        const res = await fetch('/api/data', { cache: 'no-store' });
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

  const totalGlobal = NB_BASE_MANUEL + 
    (data?.agenda || 0) + 
    (data?.meetup || 0) + 
    (data?.cinema || 0) + 
    (data?.jeux || 0);

  return (
    <main className="p-4 bg-slate-50 min-h-screen">
      <div className="max-w-2xl mx-auto mb-10 p-6 bg-white rounded-2xl shadow-md border border-slate-100">
        
        {/* En-tête avec Total */}
        <div className="text-center mb-6">
          <h2 className="text-slate-500 italic mb-2">Nombre total de ressources</h2>
          <div className="text-4xl font-black text-purple-600">
            {loading ? (
              <span className="animate-pulse opacity-50">Calcul en cours...</span>
            ) : (
              totalGlobal
            )}
            <span className="text-lg ml-2 font-normal text-slate-400">articles</span>
          </div>
        </div>

        {/* Grille des compteurs avec Skeleton loading */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatBox label="📚 Manuel" value={NB_BASE_MANUEL} color="bg-slate-50" textColor="text-slate-900" loading={false} />
          <StatBox label="📅 Agenda" value={data?.agenda} color="bg-blue-50" textColor="text-blue-600" loading={loading} />
          <StatBox label="🤝 Meetup" value={data?.meetup} color="bg-orange-50" textColor="text-orange-600" loading={loading} />
          <StatBox label="🎬 Cinéma" value={data?.cinema} color="bg-red-50" textColor="text-red-600" loading={loading} />
          <StatBox label="🎲 Jeux" value={data?.jeux} color="bg-yellow-50" textColor="text-yellow-600" loading={loading} />
        </div>
        
        {!loading && data?.updatedAt && (
          <p className="text-[9px] text-center mt-6 text-slate-300 italic">
            Dernière mise à jour : {new Date(data.updatedAt).toLocaleTimeString()}
          </p>
        )}
      </div>
    </main>
  );
}

// Petit composant interne pour les cases de stats
function StatBox({ label, value, color, textColor, loading }: any) {
  return (
    <div className={`flex flex-col items-center p-3 ${color} rounded-xl border border-white shadow-sm`}>
      <span className="text-[10px] uppercase tracking-tighter font-bold text-slate-400 mb-1">{label}</span>
      {loading ? (
        <div className="h-6 w-10 bg-slate-200 animate-pulse rounded"></div>
      ) : (
        <span className={`text-xl font-black ${textColor}`}>{value || 0}</span>
      )}
    </div>
  );
}
