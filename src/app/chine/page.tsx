"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Landmark, Building2, TrendingUp } from "lucide-react";

export default function ChinePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/chine')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse font-bold">CHARGEMENT DES DONNÉES...</div>;

  return (
    <main className="max-w-7xl mx-auto p-6 bg-white min-h-screen shadow-2xl my-10 border border-slate-100">
      
      <Link href="/" className="inline-flex items-center gap-2 text-red-600 font-black hover:bg-red-50 p-2 rounded-md transition-all mb-10">
        <ArrowLeft size={20} /> RETOUR À L'ACCUEIL
      </Link>

      <header className="border-l-8 border-red-600 pl-6 mb-16">
        <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase">Chine</h1>
        <p className="text-slate-400 font-mono mt-2">{data.data_source}</p>
      </header>

      {/* BLOC 1: ADMINISTRATION (Provinces & Municipalités) */}
      <section className="mb-20">
        <div className="flex items-center gap-4 mb-8">
          <Landmark size={32} className="text-red-600" />
          <h2 className="text-3xl font-black uppercase tracking-tight">Divisions Territoriales</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Fusion et affichage des Provinces et Régions Autonomes */}
          {[...data.administration_territoriale.provinces, ...data.administration_territoriale.regions_autonomes].map((item: any, i: number) => (
            <div key={i} className="group border-b-2 border-slate-100 p-4 hover:border-red-600 transition-all">
              <h3 className="font-bold text-lg text-slate-800">{item.nom}</h3>
              <p className="text-xs text-slate-400 mb-3">Capitale: {item.capitale}</p>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded">POP. 2026</span>
                <span className="font-black text-red-600">{item.population_est_2026}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BLOC 2: FOCUS MUNICIPALITÉS */}
      <section className="mb-20 bg-slate-900 text-white p-10 rounded-3xl">
        <h2 className="text-2xl font-black mb-8 text-yellow-500">Municipalités Autonomes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.administration_territoriale.municipalites.map((m: any, i: number) => (
            <div key={i} className="border-l-2 border-yellow-500 pl-4">
              <p className="text-4xl font-black mb-1">{m.nom}</p>
              <p className="text-yellow-500 font-mono">{m.population_totale_2026}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BLOC 3: TOUTES LES VILLES URBAINES (LE TABLEAU COMPLET) */}
      <section>
        <div className="flex items-center justify-between mb-8 border-b-4 border-slate-900 pb-4">
          <div className="flex items-center gap-4">
            <Building2 size={32} className="text-blue-600" />
            <h2 className="text-3xl font-black uppercase tracking-tight">Zones Urbaines (Census 2020)</h2>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-bold text-sm">
            <TrendingUp size={16} />
            {data.villes_principales_urbaines.length} Villes répertoriées
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {data.villes_principales_urbaines.map((v: any, i: number) => (
            <div key={i} className="bg-slate-50 p-4 rounded-xl border border-transparent hover:border-blue-300 hover:bg-white transition-all group">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black text-slate-300 group-hover:text-blue-600">#{i + 1}</span>
                <span className="text-[10px] font-bold text-slate-400 truncate ml-2 uppercase">{v.province}</span>
              </div>
              <p className="font-black text-slate-800 text-lg leading-tight mb-2">{v.ville}</p>
              <p className="text-blue-600 font-mono text-sm font-bold">
                {v.census_2020.toLocaleString('fr-FR')} <span className="text-[10px] opacity-70">hab.</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-20 pt-10 border-t border-slate-200 text-center font-mono text-slate-400 text-sm">
        FIN DU RÉPERTOIRE DÉMOGRAPHIQUE - CHINE 2026
      </footer>
    </main>
  );
}
