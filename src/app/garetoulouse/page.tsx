"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Train, History, MapPin, Sparkles, BookOpen, Info, Ghost, Map as MapIcon } from "lucide-react";

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
        <ArrowLeft size={20} /> Retour à l'Accueil
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

      {/* 2. SECTION DISPARUES & FANTÔMES (Mise à jour pour inclure les gares fantômes) */}
      <section className="mb-16 bg-white p-6 md:p-10 rounded-3xl border border-slate-200 shadow-inner">
        <div className="flex items-center gap-3 mb-8 text-amber-600">
          <History size={32} />
          <h2 className="text-3xl font-black uppercase tracking-tighter">Mémoire Ferroviaire</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Sous-section : Gares Disparues */}
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><MapPin size={20}/> Sites Historiques</h3>
            <div className="space-y-6">
              {data.disparues.map((gare: any, i: number) => (
                <div key={i} className="border-l-4 border-amber-400 pl-4 py-1">
                  <h4 className="font-bold text-slate-800 text-sm uppercase">{gare.nom}</h4>
                  <p className="text-xs text-slate-600 mt-1">{gare.destin || gare.note || gare.usage_actuel}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sous-section : Gares Fantômes Urbaines (NOUVEAU) */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-700"><Ghost size={20}/> Fantômes Urbains</h3>
            <div className="space-y-6">
              {data.gares_fantomes_urbaines.map((gare: any, i: number) => (
                <div key={i} className="group">
                  <h4 className="font-bold text-slate-800 text-sm">{gare.nom}</h4>
                  <p className="text-[11px] text-slate-500 italic mb-1">{gare.emplacement || gare.statut}</p>
                  <p className="text-xs text-slate-600 leading-snug">{gare.histoire || gare.note || gare.destin}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. RÉSEAU SECONDAIRE & HALTES (NOUVEAU) */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <MapIcon className="text-emerald-600" />
          <h2 className="text-2xl font-black uppercase text-slate-800">Le Réseau Secondaire (CFSO)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
            <h3 className="font-bold text-emerald-800 mb-4 uppercase text-sm tracking-widest">Secteur Lardenne</h3>
            {data.reseau_secondaire_et_haltes.lardenne_cfso.map((h: any, i: number) => (
              <div key={i} className="mb-3 pb-3 border-b border-emerald-200 last:border-0">
                <p className="font-bold text-sm text-emerald-900">{h.nom}</p>
                <p className="text-xs text-emerald-700">{h.note}</p>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-4 uppercase text-sm tracking-widest">Secteur Nord & Est</h3>
            {data.reseau_secondaire_et_haltes.nord_et_est.map((h: any, i: number) => (
              <div key={i} className="mb-3 pb-3 border-b border-blue-200 last:border-0">
                <p className="font-bold text-sm text-blue-900">{h.nom}</p>
                <p className="text-xs text-blue-700">{h.note || h.usage || h.quartier}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SECTION FUTUR */}
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
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/20 text-center">
              <span className="text-[10px] font-black uppercase text-blue-200">Livraison estimée</span>
              <p className="text-3xl font-black text-white">{data.nouvelle_gare.horizon}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GUIDE & BIBLIO */}
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
