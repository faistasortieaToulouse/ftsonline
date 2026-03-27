"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Train, History, MapPin, Sparkles, BookOpen, Info } from "lucide-react";

export default function GareToulousePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/garetoulouse').then(res => res.json()).then(setData);
  }, []);

  if (!data) return <div className="p-20 text-center font-mono animate-pulse">Chargement du réseau...</div>;

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-8 bg-slate-50 min-h-screen my-10 rounded-3xl shadow-xl">
      
      {/* Navigation & Header */}
      <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition-all mb-8 font-bold">
        <ArrowLeft size={20} /> Retour
      </Link>

      <header className="bg-slate-900 text-white p-8 rounded-2xl mb-12 shadow-lg border-b-4 border-blue-500">
        <h1 className="text-4xl font-black uppercase tracking-tighter">{data.titre}</h1>
        <p className="text-slate-400 mt-2 italic">{data.description}</p>
      </header>

      {/* 1. SECTION ACTUELLE */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <Train className="text-blue-600" />
          <h2 className="text-2xl font-black uppercase text-slate-800">Réseau en service</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.actuelles.map((gare: any, i: number) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
              <h3 className="font-bold text-slate-900">{gare.nom}</h3>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase">{gare.type}</span>
              <p className="text-xs text-slate-500 mt-2">{gare.info}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. SECTION DISPARUES & FANTÔMES */}
      <section className="mb-16 bg-white p-6 md:p-10 rounded-3xl border border-slate-200 shadow-inner">
        <div className="flex items-center gap-3 mb-8 text-amber-600">
          <History size={32} />
          <h2 className="text-3xl font-black uppercase tracking-tighter">Mémoire Ferroviaire</h2>
        </div>
        
        <div className="space-y-8">
          {data.disparues.map((gare: any, i: number) => (
            <div key={i} className="border-l-4 border-amber-400 pl-6 py-2">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h4 className="font-black text-slate-800 uppercase">{gare.nom}</h4>
                {gare.epoque && <span className="text-[10px] bg-slate-100 px-2 rounded font-mono">{gare.epoque}</span>}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-2">{gare.destin || gare.note}</p>
              {gare.details && (
                <div className="text-[11px] text-slate-400 bg-slate-50 p-3 rounded-lg italic">
                  {gare.details.histoire} — {gare.details.ce_qu_il_reste || gare.details.vestiges}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 3. SECTION FUTUR (MATABIAU 2) */}
      <section className="mb-16 bg-gradient-to-br from-blue-700 to-indigo-800 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="text-blue-300" />
            <h2 className="text-2xl font-black uppercase tracking-tight">Le Futur : {data.nouvelle_gare.nom}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-blue-100 mb-4">{data.nouvelle_gare.concept}</p>
              <ul className="space-y-2">
                {data.nouvelle_gare.points_cles.map((pt: string, i: number) => (
                  <li key={i} className="text-xs flex items-center gap-2">
                    <div className="w-1 h-1 bg-blue-300 rounded-full" /> {pt}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/20">
              <span className="text-[10px] font-black uppercase text-blue-200">Livraison estimée</span>
              <p className="text-3xl font-black text-white">{data.nouvelle_gare.horizon}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. GUIDE & BIBLIO */}
      <footer className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-800 text-white p-8 rounded-3xl">
        <div>
          <h3 className="font-black uppercase mb-4 flex items-center gap-2 text-blue-400">
            <MapPin size={18} /> Guide de terrain
          </h3>
          <p className="text-xs mb-4 italic text-slate-300">"{data.guide_patrimoine.balade_conseillee}"</p>
          {data.guide_patrimoine.lieux_a_visiter.map((lieu: any, i: number) => (
            <div key={i} className="mb-2">
              <span className="text-sm font-bold block">{lieu.nom}</span>
              <span className="text-[10px] text-slate-400">{lieu.info}</span>
            </div>
          ))}
        </div>
        <div>
          <h3 className="font-black uppercase mb-4 flex items-center gap-2 text-blue-400">
            <BookOpen size={18} /> Ressources
          </h3>
          {data.bibliographie_ressources.map((bib: any, i: number) => (
            <div key={i} className="mb-3 border-b border-slate-700 pb-2">
              <p className="text-xs font-bold">{bib.titre || bib.nom}</p>
              <p className="text-[10px] text-slate-400">{bib.auteur || bib.description}</p>
            </div>
          ))}
          <div className="mt-6 p-4 bg-slate-900 rounded-xl border border-slate-700 flex items-center gap-3">
             <Info className="text-blue-500" size={20} />
             <p className="text-[10px] font-mono leading-tight">{data.note_historique}</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
