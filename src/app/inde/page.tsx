"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Landmark, Building2, MapPin, Zap } from "lucide-react";

export default function IndePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/inde')
      .then(res => res.json())
      .then(json => {
        // Tri des états par population de leur capitale
        json.administration_territoriale.etats.sort((a: any, b: any) => b.pop_capitale - a.pop_capitale);
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-20 text-center font-mono text-orange-600 animate-pulse uppercase tracking-widest">Initialisation des données de l'Union Indienne...</div>;

  const formatPop = (num: number) => {
    if (!num) return "N/A";
    return num >= 1000000 
      ? (num / 1000000).toFixed(1) + " M" 
      : (num / 1000).toFixed(0) + " k";
  };

  return (
    <main className="max-w-7xl mx-auto p-6 bg-white min-h-screen">
      <Link href="/" className="inline-flex items-center gap-2 text-orange-600 font-black mb-8 hover:translate-x-[-4px] transition-transform">
        <ArrowLeft size={20} /> Retour à l'Accueil
      </Link>

      <header className="mb-16 border-b-4 border-orange-500 pb-6">
        <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic">Inde<span className="text-orange-500">.</span></h1>
        <div className="flex justify-between items-end mt-4">
          <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">{data.data_source}</p>
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Union des États</span>
          
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-slate-400 font-mono">
            Recensement 2020 & Estimations 2025/26
          </p>
          <span className="bg-green-700 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">
            Classé par population urbaine
          </span>
        </div>
      <br />
      <br />
          
        </div>
      </header>

      {/* SECTION 1: MÉGALOPOLES (+10M) */}
      <section className="mb-20">
        <h2 className="flex items-center gap-3 text-3xl font-black mb-10 uppercase text-slate-800 italic">
          <Zap className="text-orange-500 fill-orange-500" /> Les Mégalopoles Mondiales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.demographie_urbaine_2026.megalopoles_plus_10m.map((v: any, i: number) => (
            <div key={i} className="bg-slate-900 text-white p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                <Building2 size={120} />
              </div>
              <p className="text-orange-500 font-mono text-xs mb-1 uppercase tracking-widest">{v.etat}</p>
              <h3 className="text-2xl font-black mb-4">{v.ville}</h3>
              <p className="text-4xl font-black text-white">
                {formatPop(v.population)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: ÉTATS ET CAPITALES */}
      <section className="mb-20">
        <h2 className="flex items-center gap-3 text-2xl font-black mb-8 border-l-8 border-orange-500 pl-4 uppercase">
          <Landmark className="text-slate-400" /> États & Capitales Administratives
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.administration_territoriale.etats.map((e: any, i: number) => (
            <div key={i} className="border border-slate-100 p-4 hover:bg-orange-50 transition-colors">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{e.nom}</p>
              <p className="font-bold text-slate-800">{e.capitale}</p>
              <p className="text-xs font-mono text-orange-600 mt-2 font-bold">{e.pop_capitale.toLocaleString()} hab.</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: LES AUTRES GRANDS CENTRES */}
      <section>
        <h2 className="flex items-center gap-3 text-2xl font-black mb-8 uppercase text-slate-800">
          <MapPin className="text-orange-500" /> Pôles de Croissance & Villes Majeures
        </h2>
        <div className="overflow-x-auto shadow-xl rounded-xl border border-slate-100">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
                <th className="p-4">Rang / Ville</th>
                <th className="p-4">État / Statut</th>
                <th className="p-4 text-right">Population (Est. 2026 / Census)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ...data.demographie_urbaine_2026.villes_tres_grandes_3m_10m,
                ...data.demographie_urbaine_2026.villes_majeures_1m_3m,
                ...data.demographie_urbaine_2026.growth_centers_500k_1m
              ].map((v: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors group text-sm">
                  <td className="p-4 font-bold text-slate-800">
                    <span className="text-slate-300 mr-3 text-xs font-mono">#{i + 7}</span>
                    {v.ville}
                  </td>
                  <td className="p-4 text-slate-500 italic text-xs">
                    {v.etat || v.province || v.statut}
                  </td>
                  <td className="p-4 text-right font-black text-orange-600 font-mono">
                    {(v.population || v.census_2011).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mt-20 py-10 text-center border-t border-slate-100">
        <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">
          © 2026 - Data India Urban Systems - Récupération de {data.demographie_urbaine_2026.growth_centers_500k_1m.length + 25} points de données
        </p>
      </footer>
    </main>
  );
}
