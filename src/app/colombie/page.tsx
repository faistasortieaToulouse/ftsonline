"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Map, Building2, Users, Trophy } from "lucide-react";

export default function ColombiePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/colombie')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  // Fonction pour convertir "8 100 000" en nombre réel 8100000
  const parsePop = (txt: string) => parseInt(txt?.replace(/\s/g, '') || '0');

  if (loading) return <div className="p-20 text-center animate-pulse font-black text-yellow-600">Chargement en cours...</div>;

  return (
    <main className="max-w-7xl mx-auto p-6 bg-white min-h-screen shadow-2xl my-10 border-t-8 border-yellow-400 rounded-b-xl">
      
      <Link href="/" className="inline-flex items-center gap-2 text-blue-700 font-black hover:bg-blue-50 p-2 rounded-md transition-all mb-10">
        <ArrowLeft size={20} /> RETOUR À L'ACCUEIL
      </Link>

      <header className="mb-16">
        <h1 className="text-7xl font-black text-slate-900 tracking-tighter uppercase italic">
          Colombie<span className="text-yellow-400">.</span>
        </h1>
        <p className="text-slate-400 font-mono mt-2">Recensement 2020 & Estimations 2025/26</p>
        <span className="bg-yellow-400 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">
            Classé par population urbaine
          </span>
      </header>

      {/* SECTION 1 : DÉPARTEMENTS TRIÉS PAR POP. CAPITALE */}
      <section className="mb-24">
        <div className="flex items-center gap-4 mb-8">
          <Map size={32} className="text-yellow-500" />
          <h2 className="text-3xl font-black uppercase tracking-tight">Départements (Tri par Capitale)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...data.departements]
            .sort((a, b) => parsePop(b.population_capitale) - parsePop(a.population_capitale))
            .map((dep: any, i: number) => (
              <div key={i} className="border border-slate-100 p-5 rounded-xl hover:shadow-lg transition-all group relative overflow-hidden">
                <span className="absolute -right-2 -top-2 text-4xl font-black text-slate-50 group-hover:text-yellow-100 transition-colors">#{i+1}</span>
                <h3 className="font-black text-lg text-slate-800 mb-1">{dep.nom}</h3>
                <p className="text-xs text-blue-600 font-bold mb-4 uppercase tracking-tighter">Capitale: {dep.capitale}</p>
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">Pop. Capitale</p>
                    <p className="font-black text-xl text-yellow-500">{dep.population_capitale}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Total Dép.</p>
                    <p className="font-bold text-slate-700 text-sm">{dep.population_totale}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* SECTION 2 : TOP VILLES (CLASSEMENT GÉNÉRAL) */}
      <section className="bg-slate-900 rounded-3xl p-10 text-white shadow-2xl">
        <div className="flex items-center gap-4 mb-10">
          <Trophy size={32} className="text-yellow-400" />
          <h2 className="text-3xl font-black uppercase tracking-tight">Classement des Villes Principales</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...data.classement_villes]
            .sort((a, b) => parsePop(b.population) - parsePop(a.population))
            .map((v: any, i: number) => (
              <div key={i} className="bg-white/5 border-l-4 border-yellow-400 p-4 rounded-r-lg hover:bg-white/10 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black bg-yellow-400 text-slate-900 px-2 py-0.5 rounded">TOP {i + 1}</span>
                </div>
                <p className="font-black text-xl mb-1">{v.ville}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-3 truncate">{v.departement}</p>
                <p className="text-yellow-400 font-mono font-black text-lg">{v.population} <span className="text-[10px] text-white/50">hab.</span></p>
              </div>
            ))}
        </div>
      </section>

      <footer className="mt-20 pt-10 border-t border-slate-100 text-center font-mono text-slate-400 text-xs">
        COLOMBIA - CENSO DE POBLACIÓN Y VIVIENDA 2026
      </footer>
    </main>
  );
}
