"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Flag, Building2, Map as MapIcon, ChevronRight } from "lucide-react";

export default function EtatsUnisPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/etatsunis')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  // Nettoie les chaînes comme "39 130 000" ou "~298 000" en nombres
  const parsePop = (val: string) => parseInt(val.replace(/[^0-9]/g, '')) || 0;

  if (loading) return <div className="p-20 text-center animate-pulse font-black text-blue-800 tracking-widest">Chargement en cours...</div>;

  return (
    <main className="max-w-7xl mx-auto p-6 bg-slate-50 min-h-screen my-10 shadow-2xl rounded-2xl border border-slate-200">
      
      <Link href="/" className="inline-flex items-center gap-2 text-blue-800 font-black hover:bg-blue-100 p-2 rounded-md transition-all mb-10">
        <ArrowLeft size={20} /> Retour à l'Accueil
      </Link>

      <header className="mb-16 border-b-4 border-red-600 pb-8">
        <h1 className="text-8xl font-black text-slate-900 tracking-tighter uppercase">
          Etats-Unis<span className="text-red-600">.</span>
        </h1>
        <p className="text-slate-500 font-mono mt-2 font-bold uppercase tracking-widest">Liste des États</p>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-slate-400 font-mono">
            Recensement 2020 & Estimations 2025/26
          </p>
          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">
            Classé par population urbaine
          </span>
        </div>
      <br />
      <br />
      </header>

      {/* SECTION 1 : LES ÉTATS PAR POPULATION */}
      <section className="mb-24">
        <div className="flex items-center gap-4 mb-10">
          <Flag size={32} className="text-blue-800" />
          <h2 className="text-4xl font-black uppercase tracking-tighter">États Fédérés (Tri par Population des capitales)</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...data.etats]
            .sort((a, b) => parsePop(b.population_totale) - parsePop(a.population_totale))
            .map((etat: any, i: number) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-xl transition-all group">
                <span className="text-[10px] font-black text-slate-300 group-hover:text-red-600">RANK #{i + 1}</span>
                <h3 className="font-black text-lg text-slate-800 leading-tight mb-1">{etat.nom}</h3>
                <p className="text-xs text-blue-600 font-bold mb-4 italic truncate">Capitale: {etat.capitale}</p>
                <p className="font-mono font-black text-slate-900 text-sm bg-slate-100 p-2 rounded text-center">
                  {etat.population_totale}
                </p>
              </div>
            ))}
        </div>
      </section>

      {/* SECTION 2 : LES MÉGAPOLES (> 500k) */}
      <section className="mb-24 bg-blue-900 text-white p-10 rounded-3xl shadow-inner">
        <div className="flex items-center gap-4 mb-12">
          <Building2 size={32} className="text-red-500" />
          <h2 className="text-4xl font-black uppercase tracking-tighter">Métropoles de Rang A (+500k)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...data.villes_plus_de_500k]
            .sort((a, b) => parsePop(b.population) - parsePop(a.population))
            .map((v: any, i: number) => (
              <div key={i} className="flex items-center justify-between border-b border-white/10 pb-4 hover:bg-white/5 p-2 rounded transition-colors">
                <div className="flex gap-4 items-center">
                  <span className="text-2xl font-black text-red-500 opacity-50 w-8">{i + 1}</span>
                  <div>
                    <p className="font-black text-xl leading-none">{v.ville}</p>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{v.etat}</p>
                  </div>
                </div>
                <p className="font-mono font-bold text-red-400">{v.population}</p>
              </div>
            ))}
        </div>
      </section>

      {/* SECTION 3 : VILLES INTERMÉDIAIRES */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <MapIcon size={32} className="text-slate-400" />
          <h2 className="text-3xl font-black uppercase tracking-tight text-slate-800">Villes Intermédiaires & Capitales d'États</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[...data.villes_intermediaires]
            .sort((a, b) => parsePop(b.population) - parsePop(a.population))
            .map((v: any, i: number) => (
              <div key={i} className="bg-white border border-slate-100 p-3 rounded-lg hover:border-blue-400 transition-all group">
                <p className="font-black text-slate-800 text-sm group-hover:text-blue-700 transition-colors">{v.ville}</p>
                <p className="text-[9px] text-slate-400 uppercase mb-2">{v.etat}</p>
                <p className="text-xs font-mono font-bold text-slate-500">{v.population.replace('~', '± ')}</p>
              </div>
            ))}
        </div>
      </section>

      <footer className="mt-20 pt-10 border-t border-slate-200 text-center font-black text-slate-300 text-sm tracking-[1em] uppercase">
        United States of America 2026
      </footer>
    </main>
  );
}
