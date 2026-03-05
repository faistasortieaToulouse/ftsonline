"use client";

import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  History, 
  FlaskConical, 
  Pickaxe, 
  Layers, 
  Landmark,
  Loader2,
  FileText,
  Search
} from 'lucide-react';

export default function Jsontest2Page() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Appel de l'API espionnage qui contient les anecdotes
    fetch('/api/jsontest')
      .then(res => {
        if (!res.ok) throw new Error("Erreur lors de la récupération des données");
        return res.json();
      })
      .then(json => setData(json))
      .catch(err => setError(err.message));
  }, []);

  if (error) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-500 font-mono p-4">
      <ShieldAlert className="mr-2" /> [SYSTEM_ERROR]: {error}
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
      <Loader2 className="animate-spin mb-4 text-red-600" size={40} />
      <p className="animate-pulse tracking-widest text-xs uppercase">Déchiffrement des flux sécurisés...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20">
      
      {/* HEADER : STYLE DOSSIER SECRET */}
      <header className="bg-red-900/10 border-b border-red-900/30 py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent opacity-50"></div>
        <div className="relative z-10">
          <div className="inline-block px-3 py-1 border border-red-500 text-red-500 text-xs font-black tracking-widest uppercase mb-4 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
            Confidentiel - Niveau Sigma 4
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-slate-100 mb-6 max-w-4xl mx-auto leading-none">
            {data.titre}
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-400 font-serif italic border-l-2 border-red-800 pl-6 py-2 text-left">
            {data.introduction}
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-16 space-y-32">

        {/* SECTION 1: PRÉHISTOIRE & NÉOLITHIQUE */}
        {data.transferts_prehistoriques_et_neolithiques && (
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.transferts_prehistoriques_et_neolithiques.domaines_cles?.map((d: any, i: number) => (
                <div key={i} className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 hover:border-amber-600/50 transition-colors shadow-xl">
                  <h3 className="text-lg font-bold text-amber-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Pickaxe size={18} /> {d.secteur.split(':')[0]}
                  </h3>
                  <ul className="space-y-3">
                    {d.evenements?.map((ev: string, idx: number) => (
                      <li key={idx} className="text-xs leading-relaxed text-slate-400 flex gap-2">
                        <span className="text-amber-600 font-bold">•</span> {ev}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
        
{/* SECTION : CHRONOLOGIE HISTOIRE DU TRANSFERT */}
{data.chronologie_du_transfert && (
  <section className="relative">
    <div className="flex items-center gap-4 mb-10">
      <div className="bg-blue-700 p-3 rounded-lg shadow-[0_0_15px_rgba(29,78,216,0.4)]">
        <Layers className="text-white" size={28} />
      </div>
      <div>
        <h2 className="text-3xl font-black uppercase text-slate-100 tracking-tight">Chronologie Stratégique</h2>
        <p className="text-blue-500 text-sm font-medium uppercase tracking-widest">Évolution des méthodes de captation de savoir</p>
      </div>
    </div>

    <div className="space-y-12">
      {data.chronologie_du_transfert.map((item: any, i: number) => (
        <div key={i} className="relative pl-8 border-l-2 border-slate-800 hover:border-blue-600 transition-colors group">
          {/* Point sur la timeline */}
          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-800 group-hover:bg-blue-600 border-2 border-slate-950 transition-colors"></div>
          
          <h3 className="text-xl font-black text-blue-500 uppercase mb-6 tracking-tighter">
            {item.ere}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {item.evenements?.map((event: string, idx: number) => {
              const [title, description] = event.split(':');
              return (
                <div key={idx} className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/50 hover:bg-slate-900/60 transition-all">
                  <p className="text-sm leading-relaxed">
                    <span className="text-blue-400 font-bold uppercase text-[10px] block mb-1 tracking-widest">
                      {title}
                    </span>
                    <span className="text-slate-400 font-serif italic">
                      {description}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  </section>
)}  
        
{/* SECTION : ANALYSE DU SUCCÈS & TECHNOLOGIES */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne de gauche : Analyse du succès */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-black uppercase text-blue-500 tracking-widest flex items-center gap-2">
              <ShieldAlert size={24} /> Matrice du succès
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.analyse_du_succes?.map((item: string, i: number) => (
                <div key={i} className="bg-slate-900/40 border-l-2 border-blue-600 p-4 text-xs text-slate-400 font-mono">
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Colonne de droite : Technologies clés */}
          <div className="bg-blue-900/10 border border-blue-900/30 rounded-3xl p-6">
            <h3 className="text-xl font-black uppercase text-slate-100 mb-6 flex items-center gap-2">
              <FlaskConical size={20} className="text-blue-500" /> Flux Critiques
            </h3>
            <ul className="space-y-4">
              {data.technologies_clefs_transferees?.map((tech: string, i: number) => (
                <li key={i} className="text-sm bg-slate-950/50 p-3 rounded-lg border border-slate-800 text-blue-200 italic">
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* SECTION : ANALYSE HISTORIQUE GLOBALE */}
        <section className="bg-slate-900/20 border border-slate-800 rounded-[3rem] p-10">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-100">Leçons de l'Histoire</h2>
            <div className="w-24 h-1 bg-red-600 mt-2"></div>
          </div>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {data.analyse_historique?.map((note: string, i: number) => (
              <div key={i} className="break-inside-avoid bg-slate-900/60 border border-slate-800 p-6 rounded-2xl hover:bg-slate-800/40 transition-colors">
                <p className="text-sm leading-relaxed text-slate-300">
                  <span className="text-red-500 font-black mr-2">#</span>
                  {note}
                </p>
              </div>
            ))}
          </div>
        </section>
        
        {/* SECTION 2: ANECDOTES CÉLÈBRES (LA GRILLE) */}
        <section className="relative">
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-red-700 p-3 rounded-lg shadow-[0_0_15px_rgba(185,28,28,0.4)]">
              <Search className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase text-slate-100 tracking-tight">Archives du Renseignement</h2>
              <p className="text-red-500 text-sm font-medium uppercase tracking-widest">Registre des anecdotes et fuites historiques</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.anecdotes_celebres?.map((anc: any, i: number) => (
              <div key={i} className="group relative bg-slate-900/40 border border-slate-800 p-5 rounded-xl hover:bg-red-950/20 transition-all duration-300">
                <div className="absolute top-0 right-4 h-full flex items-center opacity-5 group-hover:opacity-10 transition-opacity">
                   <FileText size={60} />
                </div>
                <h4 className="text-red-500 font-black text-xs uppercase tracking-widest mb-2 border-b border-red-900/50 pb-1">
                  CASE_REF: {i + 1024}
                </h4>
                <h3 className="text-slate-100 font-bold mb-2 group-hover:text-red-400 transition-colors">
                  {anc.sujet}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed font-serif">
                  {anc.info}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CONCLUSION FINALE */}
        <footer className="relative mt-32 p-12 bg-gradient-to-br from-slate-900 to-black rounded-[2rem] text-center border border-slate-800 overflow-hidden shadow-2xl">
          <div className="absolute -right-10 -bottom-10 opacity-5">
            <Landmark size={250} />
          </div>
          <div className="relative z-10">
            <FlaskConical className="mx-auto mb-6 text-red-600" size={40} />
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-red-500 mb-6">Synthèse du Renseignement</h2>
            <blockquote className="text-2xl md:text-3xl font-serif italic text-slate-200 max-w-3xl mx-auto leading-snug">
              "{data.conclusion}"
            </blockquote>
          </div>
        </footer>

      </main>
      
      {/* FOOTER TECHNIQUE */}
      <div className="text-center text-[10px] text-slate-700 uppercase tracking-[0.5em] mt-20 font-mono">
        &gt; DATA_CORRUPTION_CHECK: OK | SECURITY_CLEARANCE: GRANTED | 2026_ARCHIVE_CORE
      </div>
    </div>
  );
}
