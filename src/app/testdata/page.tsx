"use client";

import { useState, useEffect } from "react";
import { Zap, Film, Bell, Gamepad2, Database, RefreshCw, LayoutGrid } from "lucide-react";

export default function MeetupSupPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/testdata");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Erreur de chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <RefreshCw className="animate-spin text-red-600" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <header className="text-center mb-12">
          <h1 className="text-6xl font-black italic tracking-tighter uppercase mb-4">
            Radar<span className="text-red-600">.Toulouse</span>
          </h1>
          <p className="text-slate-500 font-bold tracking-[0.3em] uppercase text-xs">Analyse globale de l'activité urbaine</p>
        </header>

        {/* SECTION DES GRANDS COMPTEURS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          
          {/* COMPTEUR ARTICLES (MANUEL) */}
          <div className="text-center p-10 bg-slate-900/20 border border-white/5 rounded-[3rem] relative overflow-hidden group">
            <Database className="absolute -right-4 -top-4 text-white/5 group-hover:text-white/10 transition-colors" size={160} />
            <span className="relative z-10 text-[8rem] font-black leading-none bg-gradient-to-b from-slate-200 to-slate-600 bg-clip-text text-transparent">
              {data?.totalArticles}
            </span>
            <p className="text-slate-400 font-black italic uppercase tracking-widest text-lg mt-4">Articles & Rubriques</p>
            <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest mt-1">Base de données FTS</p>
          </div>

          {/* COMPTEUR LIVE (DYNAMIQUE) */}
          <div className="text-center p-10 bg-red-950/10 border border-red-900/20 rounded-[3rem] relative overflow-hidden group">
            <Zap className="absolute -right-4 -top-4 text-red-600/5 group-hover:text-red-600/10 transition-colors" size={160} />
            <span className="relative z-10 text-[8rem] font-black leading-none bg-gradient-to-b from-white to-red-600 bg-clip-text text-transparent">
              {data?.totalLive}
            </span>
            <p className="text-red-600 font-black italic uppercase tracking-widest text-lg mt-4">Radar Live</p>
            <p className="text-[10px] text-red-900 uppercase font-bold tracking-widest mt-1">Événements en temps réel</p>
          </div>
          
        </div>

        {/* TITRE DE LA GRILLE */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-[1px] flex-1 bg-white/10"></div>
          <h2 className="text-xs font-black uppercase tracking-[0.5em] text-slate-500">Détails des flux détectés</h2>
          <div className="h-[1px] flex-1 bg-white/10"></div>
        </div>

        {/* GRILLE DES SOURCES LIVE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<Zap />} label="Meetup" count={data?.detailsLive?.meetup} color="text-yellow-400" />
          <StatCard icon={<Film />} label="Cinéma" count={data?.detailsLive?.cinema} color="text-blue-400" />
          <StatCard icon={<Bell />} label="Agenda" count={data?.detailsLive?.agenda} color="text-red-400" />
          <StatCard icon={<Gamepad2 />} label="Jeux RSS" count={data?.detailsLive?.jeux} color="text-emerald-400" />
        </div>

      </div>
    </div>
  );
}

function StatCard({ icon, label, count, color }: any) {
  return (
    <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2rem] hover:bg-slate-800 transition-all group relative overflow-hidden">
      <div className="relative z-10">
        <div className={`${color} mb-4 transition-transform group-hover:scale-110`}>{icon}</div>
        <div className="text-4xl font-black mb-1">{count}</div>
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</div>
      </div>
      {/* Petit effet de reflet au survol */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
    </div>
  );
}