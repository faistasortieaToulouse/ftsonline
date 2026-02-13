"use client";
import { useEffect, useState } from 'react';
import { ArrowLeft, Search, Cpu, Globe, ShieldCheck, Zap, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function PaysTechnologiePage() {
  const [data, setData] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pays_technologie')
      .then(res => res.json())
      .then(json => {
        setData(json.data || []);
        setMetadata(json.metadata || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredData = data.filter(item => 
    item.pays.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400"></div>
        <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400" size={24} />
      </div>
      <p className="mt-6 text-cyan-100/60 font-mono tracking-widest animate-pulse">SYNCHRONISATION NRI...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <Link href="/" className="flex items-center gap-2 text-cyan-400 font-bold mb-10 hover:text-cyan-300 transition-colors w-fit">
          <ArrowLeft size={18} /> Retour à l'Accueil
        </Link>

        {metadata && (
          <header className="mb-16">
            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
                <div className="p-5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl shadow-2xl shadow-cyan-500/20">
                    <Globe size={40} className="text-white" />
                </div>
                <div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-2">
                    {metadata.title}
                    </h1>
                    <p className="text-cyan-400 font-mono font-bold tracking-[0.3em] uppercase">Tech Readiness Report 2026</p>
                </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-8 rounded-[2.5rem]">
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed italic">
                "{metadata.definition}"
              </p>
            </div>
          </header>
        )}

        {/* Barre de Recherche Futuriste */}
        <div className="relative mb-16">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
          <input 
            type="text"
            placeholder="Analyser un territoire numérique..."
            className="w-full bg-slate-800/40 border border-slate-700 pl-16 pr-8 py-6 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-xl text-white placeholder:text-slate-600"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Grille de Cartes Tech */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredData.map((item) => (
            <div key={`${item.rang}-${item.pays}`} className="relative bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-[2rem] p-8 hover:border-cyan-500/50 transition-all group overflow-hidden">
              
              {/* Effet de scan en arrière-plan au hover */}
              <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              <div className="flex justify-between items-start mb-8">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] mb-1">Position Mondiale</span>
                    <span className="text-3xl font-black text-white">#{item.rang}</span>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-slate-950 flex items-center justify-center border border-slate-700 group-hover:border-cyan-500/50 transition-colors">
                    <Zap size={24} className={item.score_nri > 70 ? "text-cyan-400" : "text-slate-500"} />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-cyan-300 transition-colors">
                {item.pays}
              </h3>

              {/* Score Jauge */}
              <div className="mb-8 p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-end mb-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Score NRI</span>
                    <span className="text-3xl font-black text-cyan-400">{item.score_nri}</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
                        style={{ width: `${item.score_nri}%` }}
                    />
                </div>
              </div>

              {/* Profil d'utilisation */}
              <div className="flex gap-4 p-4 rounded-2xl bg-cyan-950/20 border border-cyan-900/30">
                <ShieldCheck size={20} className="text-cyan-500 shrink-0" />
                <p className="text-sm text-cyan-100/80 leading-relaxed">
                  {item.profil_utilisation}
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span>Infrastructure TIC</span>
                <BarChart3 size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
