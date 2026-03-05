"use client";
import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, Scroll, History, FlaskConical, Globe, 
  Binary, Landmark, Swords, Search, BookOpen, ArrowLeft
} from 'lucide-react';

export default function EspionnagePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/jsontest')
      .then(res => res.json())
      .then(json => setData(json));
  }, []);

  if (!data) return <div className="p-10 text-center animate-pulse">Chargement du dossier classifié...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20">
      
      <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline mb-6 transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour à l'accueil
      </Link>
      
      {/* HEADER : STYLE DOSSIER SECRET */}
      <header className="bg-red-900/20 border-b border-red-900/50 py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute top-4 right-10 opacity-10 rotate-12">
          <ShieldAlert size={200} />
        </div>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-red-500 mb-4 drop-shadow-[0_2px_10px_rgba(239,68,68,0.5)]">
          {data.titre}
        </h1>
        <p className="max-w-3xl mx-auto text-xl italic text-slate-400">
          "{data.introduction}"
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-12 space-y-20">

        {/* SECTION 1: PRÉHISTOIRE (L'ORIGINE DU MIMÉTISME) */}
        <section>
          <div className="flex items-center gap-4 mb-8 border-l-4 border-amber-600 pl-4">
            <History className="text-amber-600" size={32} />
            <h2 className="text-3xl font-bold uppercase">{data.transferts_prehistoriques_et_neolithiques.titre}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.transferts_prehistoriques_et_neolithiques.domaines_cles.map((d: any, i: number) => (
              <div key={i} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-amber-600/50 transition-all">
                <h3 className="text-amber-500 font-bold mb-4 flex items-center gap-2">
                  <FlaskConical size={18}/> {d.secteur}
                </h3>
                <ul className="text-sm space-y-3 text-slate-400">
                  {d.evenements.map((ev: string, idx: number) => (
                    <li key={idx} className="leading-relaxed">• {ev}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: CHRONOLOGIE (L'ÉVOLUTION DU VOL TECHNIQUE) */}
        <section className="space-y-8">
           <div className="flex items-center gap-4 border-l-4 border-red-600 pl-4">
            <Globe className="text-red-600" size={32} />
            <h2 className="text-3xl font-bold uppercase">Chronologie du transfert</h2>
          </div>
          
          <div className="space-y-12">
            {data.chronologie_du_transfert.map((ere: any, i: number) => (
              <div key={i} className="relative pl-8 border-l border-slate-800 group">
                <div className="absolute -left-1.5 top-0 w-3 h-3 bg-red-600 rounded-full group-hover:scale-150 transition-transform" />
                <h3 className="text-xl font-black text-red-400 mb-4 uppercase">{ere.ere}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ere.evenements.map((ev: any, idx: number) => (
                    <div key={idx} className="text-sm bg-slate-900/50 p-3 rounded-lg border border-slate-800/50 italic">
                      {typeof ev === 'string' ? ev : `${ev.sujet}: ${ev.info}`}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: TABLEAUX DE SYNTHÈSE */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-blue-400 flex items-center gap-2 uppercase tracking-widest">
              <Binary size={20}/> 2000 ans de transfert
            </h3>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800">
                  <th className="pb-3">Époque</th>
                  <th className="pb-3">Objet</th>
                  <th className="pb-3">Flux</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.tableau_synthese_2000_ans.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="py-3 font-mono text-blue-400">{row.Epoque}</td>
                    <td className="py-3 font-bold">{row.Objet}</td>
                    <td className="py-3 text-slate-400">{row.De} → {row.Vers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-red-950/20 border border-red-900/30 rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-6 text-red-500 flex items-center gap-2 uppercase tracking-widest">
              <Swords size={20}/> Duels Régionaux
            </h3>
            <div className="space-y-4">
              {data.tableau_duels_regionaux.map((duel: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-red-900/20">
                  <div>
                    <div className="text-[10px] text-red-400 uppercase font-black">{duel.Region}</div>
                    <div className="font-bold">{duel.Predateur} <span className="text-slate-500 text-xs font-normal">cible</span> {duel.Proie}</div>
                  </div>
                  <div className="text-xs italic text-slate-400 max-w-[150px] text-right">{duel.Savoir}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: LES ANECDOTES (GRID DISCRÈTE) */}
        <section>
          <div className="flex items-center gap-4 mb-8 border-l-4 border-slate-400 pl-4">
            <Search className="text-slate-400" size={32} />
            <h2 className="text-3xl font-bold uppercase tracking-tighter">Archives & Anecdotes</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.anecdotes_celebres.map((anc: any, i: number) => (
              <div key={i} className="p-4 bg-slate-900 border-b-2 border-slate-800 hover:border-red-500 transition-colors group">
                <h4 className="font-black text-red-500 uppercase text-xs mb-1">{anc.sujet}</h4>
                <p className="text-sm text-slate-400 leading-snug">{anc.info}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CONCLUSION ACCROCHEUSE */}
        <footer className="mt-20 p-10 bg-gradient-to-r from-red-900/40 to-slate-900 rounded-3xl text-center border border-red-900/50">
          <Landmark className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-3xl font-black uppercase mb-4">Leçon de l'histoire</h2>
          <p className="text-2xl font-serif italic text-slate-300">
            {data.conclusion}
          </p>
        </footer>

      </main>
    </div>
  );
}
