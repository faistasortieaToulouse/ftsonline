"use client";

import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  History, 
  FlaskConical, 
  Pickaxe, 
  Layers, 
  Landmark,
  Loader2
} from 'lucide-react';

export default function Jsontest2Page() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // On appelle l'API correspondante à src/app/api/jsontest/route.ts
    fetch('/api/jsontest')
      .then(res => {
        if (!res.ok) throw new Error("Erreur lors de la récupération des données");
        return res.json();
      })
      .then(json => setData(json))
      .catch(err => setError(err.message));
  }, []);

  if (error) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-500">
      <ShieldAlert className="mr-2" /> {error}
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
      <Loader2 className="animate-spin mb-4" size={40} />
      <p className="animate-pulse">Déchiffrement des archives en cours...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20">
      
      {/* HEADER : STYLE DOSSIER SECRET */}
      <header className="bg-red-900/10 border-b border-red-900/30 py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent opacity-50"></div>
        
        <div className="relative z-10">
          <div className="inline-block px-3 py-1 border border-red-500 text-red-500 text-xs font-black tracking-widest uppercase mb-4">
            Confidentiel - Accès Restreint
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-slate-100 mb-6 max-w-4xl mx-auto">
            {data.titre}
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-400 font-serif italic border-l-2 border-red-800 pl-6 py-2 text-left">
            {data.introduction}
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 mt-16 space-y-24">

        {/* SECTION: PRÉHISTOIRE & NÉOLITHIQUE */}
        <section className="relative">
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-amber-600 p-3 rounded-lg shadow-[0_0_15px_rgba(217,119,6,0.4)]">
              <History className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase text-slate-100 tracking-tight">
                {data.transferts_prehistoriques_et_neolithiques.titre}
              </h2>
              <p className="text-amber-500/80 text-sm font-medium">Analyse des flux de savoir primitifs</p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl mb-10 italic text-slate-400">
            {data.transferts_prehistoriques_et_neolithiques.introduction}
          </div>

          {/* GRID DES SECTEURS (Lithique, Céramique) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.transferts_prehistoriques_et_neolithiques.domaines_cles.map((d: any, i: number) => (
              <div key={i} className="group bg-slate-900/60 p-8 rounded-3xl border border-slate-800 hover:border-amber-600/50 transition-all duration-500 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  {d.secteur.includes("Lithique") ? <Pickaxe className="text-amber-600" /> : <Layers className="text-amber-600" />}
                  <h3 className="text-xl font-bold text-amber-500 uppercase tracking-wide">
                    {d.secteur}
                  </h3>
                </div>
                
                <ul className="space-y-4">
                  {d.evenements.map((ev: string, idx: number) => {
                    const [label, text] = ev.split(':');
                    return (
                      <li key={idx} className="text-sm leading-relaxed flex gap-3">
                        <span className="text-amber-600 mt-1">▶</span>
                        <span>
                          <strong className="text-slate-100 uppercase text-xs tracking-tighter">{label} :</strong>
                          <span className="text-slate-400"> {text}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* CONCLUSION FINALE */}
        <footer className="relative mt-32 p-12 bg-gradient-to-br from-slate-900 to-black rounded-[2rem] text-center border border-slate-800 overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-5">
            <Landmark size={250} />
          </div>
          
          <div className="relative z-10">
            <FlaskConical className="mx-auto mb-6 text-red-600" size={40} />
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-red-500 mb-6">
              Synthèse Stratégique
            </h2>
            <blockquote className="text-2xl md:text-3xl font-serif italic text-slate-200 max-w-3xl mx-auto leading-snug">
              "{data.conclusion}"
            </blockquote>
          </div>
        </footer>

      </main>
      
      {/* PETIT FOOTER TECHNIQUE */}
      <div className="text-center text-[10px] text-slate-600 uppercase tracking-widest mt-10">
        System_Ref: DATA_MONDE_CATEGORIES_JSONTEST // 2026_Archiv_Unit
      </div>
    </div>
  );
}
