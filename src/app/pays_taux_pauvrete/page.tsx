"use client";
import { useEffect, useState } from 'react';
import { ArrowLeft, Search, Home, Info, AlertTriangle, TrendingDown } from 'lucide-react';
import Link from 'next/link';

export default function PaysPauvretePage() {
  const [data, setData] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pays_taux_pauvrete')
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600 mb-4"></div>
      <p className="text-slate-500 font-medium">Analyse des indicateurs sociaux...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        <Link href="/" className="flex items-center gap-2 text-red-600 font-bold mb-8 hover:bg-red-50 w-fit px-4 py-2 rounded-xl transition-colors">
          <ArrowLeft size={18} /> Retour à l'Accueil
        </Link>

        {metadata && (
          <header className="mb-12">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter">
              {metadata.title}
            </h1>
            
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-lg md:text-xl opacity-80 leading-relaxed max-w-3xl mb-6">
                  {metadata.definition}
                </p>
                <div className="flex items-center gap-3 bg-white/10 w-fit px-4 py-2 rounded-full border border-white/20">
                  <Info size={18} className="text-red-400" />
                  <span className="text-xs font-bold uppercase tracking-widest">Estimations 2025/2026</span>
                </div>
              </div>
              <TrendingDown size={200} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
            </div>
          </header>
        )}

        <div className="relative mb-12">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
          <input 
            type="text"
            placeholder="Filtrer par pays..."
            className="w-full pl-16 pr-8 py-6 rounded-2xl border-none ring-2 ring-slate-100 focus:ring-4 focus:ring-red-500/20 shadow-sm text-xl transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item) => {
            // Nettoyage de la valeur pour le calcul (ex: "~82,3 %" -> 82.3)
            const valNum = parseFloat(item.taux_pauvrete.replace('~', '').replace('%', '').replace(',', '.').trim());
            
            return (
              <div key={item.rang} className="group border border-slate-100 rounded-3xl p-6 hover:shadow-xl transition-all duration-300 bg-slate-50/50">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-mono font-bold bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                    RANG #{item.rang}
                  </span>
                  {valNum > 50 && <AlertTriangle size={18} className="text-red-500 animate-pulse" />}
                </div>

                <h3 className="text-2xl font-black text-slate-800 mb-4 group-hover:text-red-600 transition-colors">
                  {item.pays}
                </h3>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Taux estimé</span>
                    <span className="text-2xl font-black text-red-600">{item.taux_pauvrete}</span>
                  </div>
                  
                  {/* Jauge visuelle */}
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${valNum > 50 ? 'bg-red-500' : valNum > 20 ? 'bg-orange-400' : 'bg-emerald-500'}`}
                      style={{ width: `${valNum}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  <Home size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-tight">Indicateur de vulnérabilité sociale</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
