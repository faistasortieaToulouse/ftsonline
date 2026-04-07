"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  LayoutGrid, 
  Info, 
  Landmark, 
  TrendingUp, 
  Home, 
  Loader2, 
  Euro, 
  ShieldAlert,
  ArrowUpRight
} from "lucide-react";

export default function QuartiersToulousePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/quartierstoulouse")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="font-black text-xs uppercase tracking-widest text-slate-400 italic">Analyse de la stratification urbaine...</p>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="bg-red-50 text-red-600 p-8 rounded-[2rem] border-2 border-red-100 text-center">
           <ShieldAlert size={48} className="mx-auto mb-4" />
           <h2 className="font-black uppercase tracking-tighter text-2xl">Erreur de Flux</h2>
           <p className="text-sm font-bold opacity-70">Impossible de charger les données sociales 2026.</p>
        </div>
      </div>
    );
  }

  const quartiers = Object.entries(data).map(([key, value]: [string, any]) => ({
    rang: parseInt(key.replace("rang_", "")),
    ...value
  })).sort((a, b) => a.rang - b.rang);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        <nav className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-black uppercase text-[10px] tracking-[0.2em] transition-all group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            Retour Portail Principal
          </Link>
        </nav>

        <header className="mb-12 relative">
          <div className="absolute -top-6 -left-6 text-slate-200 -z-10 opacity-50">
            <LayoutGrid size={120} strokeWidth={3} />
          </div>
          <h1 className="text-3xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-none italic">
            Toulouse <span className="text-blue-600">Sociologie</span>
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <p className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Édition 2026</p>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest italic">Analyse comparative des revenus médians</p>
          </div>
        </header>

        {/* GRILLE DES QUARTIERS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quartiers.map((q) => {
            const isTop = q.rang <= 10;
            const isBottom = q.rang >= 60;

            return (
              <div 
                key={q.rang} 
                className={`group relative p-6 rounded-[2.5rem] border-4 transition-all duration-300 hover:-translate-y-2 ${
                  isTop ? "border-blue-100 bg-white shadow-blue-100/50" : 
                  isBottom ? "border-red-100 bg-white shadow-red-100/50" : "border-white bg-white shadow-slate-200/50"
                } shadow-xl`}
              >
                {/* Badge de Rang */}
                <div className={`absolute -top-4 -right-4 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg rotate-12 group-hover:rotate-0 transition-transform ${
                  isTop ? "bg-blue-600 text-white" : 
                  isBottom ? "bg-red-600 text-white" : "bg-slate-900 text-white"
                }`}>
                  {q.rang}
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-black text-slate-900 mb-1 leading-tight uppercase tracking-tighter group-hover:text-blue-600 transition-colors">
                    {q.quartier}
                  </h3>
                  {q.revenu_median && (
                    <div className="flex items-center gap-1.5 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                      <Euro size={12} className="text-blue-500" />
                      Revenu Médian : <span className={isTop ? "text-blue-600" : isBottom ? "text-red-600" : "text-slate-900"}>{q.revenu_median}€</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Petit graphique de richesse indicatif */}
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${isTop ? 'bg-blue-500' : isBottom ? 'bg-red-500' : 'bg-slate-400'}`}
                      style={{ width: `${Math.max(10, 100 - (q.rang * 1.5))}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {q.habitat && (
                      <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl">
                        <Home size={16} className="text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Habitat dominant</p>
                          <p className="text-xs font-bold text-slate-700 leading-tight">{q.habitat}</p>
                        </div>
                      </div>
                    )}
                    
                    {q.dynamique && (
                      <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl">
                        <ArrowUpRight size={16} className={`${isBottom ? 'text-red-500' : 'text-green-500'} shrink-0 mt-0.5`} />
                        <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Évolution & Flux</p>
                          <p className="text-xs font-bold text-slate-700 leading-tight">{q.dynamique}</p>
                        </div>
                      </div>
                    )}

                    <div className="mt-2 p-4 bg-slate-900 rounded-[1.5rem] relative overflow-hidden group/info">
                      <Info size={40} className="absolute -right-4 -bottom-4 text-white/5 opacity-20 group-hover/info:scale-110 transition-transform" />
                      <p className="text-[11px] text-slate-300 font-medium leading-relaxed italic relative z-10">
                        "{q.profil}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER ANALYTIQUE */}
        <footer className="mt-20 p-8 md:p-12 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-900/50">
                  <Landmark className="text-white" size={32} />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-[0.2em] italic">Note de Synthèse</h2>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Cette cartographie sociale met en lumière la <span className="text-white">polarisation urbaine</span> de la Ville Rose. 
                Alors que l'hyper-centre et le Sud-Est (Cote Pavée, Busca) consolident leur statut, 
                le Nord et l'Ouest (Mirail, Bagatelle) font face à des défis structurels majeurs malgré les investissements publics. 
                <span className="block mt-4 text-blue-400 font-black uppercase text-xs italic tracking-widest">Source : Data Infopolis 2026 — Observatoire des Inégalités.</span>
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                <TrendingUp className="text-green-400 mb-2" />
                <p className="text-2xl font-black italic tracking-tighter">84%</p>
                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Indice d'attractivité Centre</p>
              </div>
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                <Euro className="text-blue-400 mb-2" />
                <p className="text-2xl font-black italic tracking-tighter">+12%</p>
                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Hausse foncière 31400</p>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
