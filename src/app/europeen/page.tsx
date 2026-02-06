"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Landmark, Building2, MapPin } from "lucide-react";

export default function EuropePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/europeen')
      .then(res => res.json())
      .then(json => {
        // Fonction de tri générique pour les agglos
        const sortPop = (arr: any[]) => [...arr].sort((a, b) => 
          (b.population_agglo || b.population_agglo_2026) - (a.population_agglo || a.population_agglo_2026)
        );

        setData({
          ...json,
          capitales_europeennes: {
            megapoles_plus_5m: sortPop(json.capitales_europeennes.megapoles_plus_5m),
            metropoles_1m_5m: sortPop(json.capitales_europeennes.metropoles_1m_5m),
            autres_capitales_moins_1m: sortPop(json.capitales_europeennes.autres_capitales_moins_1m),
          },
          metropoles_hors_capitales: sortPop(json.metropoles_hors_capitales)
        });
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-20 text-center font-serif italic text-slate-500">Chargement de l'espace européen...</div>;

  const Card = ({ item, color }: { item: any, color: string }) => (
    <div className={`bg-white border-l-4 ${color} p-4 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-slate-800 text-lg">{item.ville}</h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.pays}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-xl font-black text-slate-900">
          {(item.population_agglo || item.population_agglo_2026).toLocaleString()}
        </span>
        <span className="text-xs text-slate-400 font-medium">hab.</span>
      </div>
      {item.note && <p className="text-[10px] italic text-blue-500 mt-1">{item.note}</p>}
    </div>
  );

  return (
    <main className="max-w-7xl mx-auto p-6 bg-slate-50 min-h-screen">
      <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold mb-8 group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Retour à l'Accueil
      </Link>

      <header className="mb-12 border-b border-slate-200 pb-8">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">
          {data.pays_continent} <span className="text-blue-600">.</span>
        </h1>
        <p className="text-slate-500 font-medium uppercase text-xs tracking-[0.2em]">Agglomérations & Aires Urbaines</p>
        
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-slate-400 font-mono">
            Recensement 2020 & Estimations 2025/26
          </p>
          <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">
            Classé par population urbaine
          </span>
        </div>
      <br />
      <br />
        
      </header>

      {/* SECTION 1: MÉGAPOLES CAPITALES */}
      <section className="mb-16">
        <h2 className="flex items-center gap-3 text-2xl font-black mb-6 uppercase text-slate-800">
          <Landmark className="text-blue-600" /> Mégapoles Capitales (+5M)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {data.capitales_europeennes.megapoles_plus_5m.map((v: any, i: number) => (
            <Card key={i} item={v} color="border-blue-600" />
          ))}
        </div>
      </section>

      {/* SECTION 2: MÉTROPOLES 1M - 5M */}
      <section className="mb-16">
        <h2 className="flex items-center gap-3 text-2xl font-black mb-6 uppercase text-slate-800">
          <Building2 className="text-indigo-600" /> Métropoles Capitales (1M - 5M)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.capitales_europeennes.metropoles_1m_5m.map((v: any, i: number) => (
            <Card key={i} item={v} color="border-indigo-500" />
          ))}
        </div>
      </section>

      {/* SECTION 3: HORS CAPITALES (TRES GRANDE LISTE) */}
      <section className="mb-16">
        <h2 className="flex items-center gap-3 text-2xl font-black mb-6 uppercase text-slate-800">
          <MapPin className="text-emerald-600" /> Grandes Métropoles Régionales
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {data.metropoles_hors_capitales.map((v: any, i: number) => (
            <div key={i} className="bg-white p-3 border border-slate-100 rounded shadow-xs">
              <p className="font-bold text-slate-800 text-sm truncate">{v.ville}</p>
              <p className="text-[9px] text-slate-400 uppercase mb-1">{v.pays}</p>
              <p className="text-emerald-600 font-mono text-xs font-bold">
                {(v.population_agglo).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: AUTRES CAPITALES */}
      <section className="mb-16">
        <h2 className="text-xl font-black mb-6 uppercase text-slate-400 border-t pt-8">
          Autres Capitales & Territoires
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {data.capitales_europeennes.autres_capitales_moins_1m.map((v: any, i: number) => (
            <div key={i} className="bg-slate-100/50 p-3 rounded flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{v.pays}</span>
              <span className="font-bold text-slate-700">{v.ville}</span>
              <span className="text-xs text-slate-500 mt-2">{(v.population_agglo).toLocaleString()} hab.</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center py-10 text-slate-400 text-xs font-mono uppercase tracking-widest border-t">
        Total des aires urbaines traitées : {
          data.capitales_europeennes.megapoles_plus_5m.length + 
          data.capitales_europeennes.metropoles_1m_5m.length + 
          data.capitales_europeennes.autres_capitales_moins_1m.length +
          data.metropoles_hors_capitales.length
        }
      </footer>
    </main>
  );
}
