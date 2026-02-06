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
        // 1. Tri des États par population de leur capitale
        const etatsTries = [...json.administration_territoriale.etats].sort((a, b) => b.pop_capitale - a.pop_capitale);

        // 2. Fusion de TOUTES les sections urbaines pour un tri global décroissant
        const toutesVilles = [
          ...json.demographie_urbaine_2026.megalopoles_plus_10m,
          ...json.demographie_urbaine_2026.villes_tres_grandes_3m_10m,
          ...json.demographie_urbaine_2026.villes_majeures_1m_3m,
          ...json.demographie_urbaine_2026.growth_centers_500k_1m
        ].sort((a, b) => {
          const popA = a.population || a.census_2011 || 0;
          const popB = b.population || b.census_2011 || 0;
          return popB - popA;
        });

        setData({ ...json, etatsTries, classementUrbain: toutesVilles });
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
        <ArrowLeft size={20} /> RETOUR À L'ACCUEIL
      </Link>

      <header className="mb-16 border-b-4 border-orange-500 pb-6">
        <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic">Inde<span className="text-orange-500">.</span></h1>
        
<div className="mt-6 mb-8 flex flex-wrap items-center gap-x-6 gap-y-3">
  {/* Côté gauche : La Source */}
  <p className="text-slate-500 font-mono text-sm uppercase tracking-widest italic">
    {data.data_source}
  </p>

  {/* Côté droit : Les Badges (rapprochés) */}
  <div className="flex items-center gap-3">
    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
      Union des États
    </span>
    <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">
      Tri Global Décroissant
    </span>
  </div>
</div>
        
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

      {/* SECTION 1: TOP 6 MÉGALOPOLES (Mises en avant) */}
      <section className="mb-20">
        <h2 className="flex items-center gap-3 text-3xl font-black mb-10 uppercase text-slate-800 italic">
          <Zap className="text-orange-500 fill-orange-500" /> Mégalopoles Mondiales (+10M)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.classementUrbain.slice(0, 6).map((v: any, i: number) => (
            <div key={i} className="bg-slate-900 text-white p-6 rounded-2xl relative overflow-hidden group border-b-4 border-orange-500 shadow-xl">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform text-white">
                <Building2 size={120} />
              </div>
              <p className="text-orange-500 font-mono text-xs mb-1 uppercase tracking-widest">RANG #0{i + 1} — {v.etat || v.province}</p>
              <h3 className="text-3xl font-black mb-4 group-hover:text-orange-400 transition-colors">{v.ville}</h3>
              <p className="text-4xl font-black text-white italic">
                {formatPop(v.population || v.census_2011)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: ÉTATS & CAPITALES (Tri administratif) */}
      <section className="mb-20">
        <h2 className="flex items-center gap-3 text-2xl font-black mb-8 border-l-8 border-orange-500 pl-4 uppercase">
          <Landmark className="text-slate-400" /> Etats par taille démographique des capitales
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.etatsTries.map((e: any, i: number) => (
            <div key={i} className="border border-slate-100 p-4 hover:border-orange-500 hover:shadow-md transition-all rounded-lg">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{e.nom}</p>
              <p className="font-bold text-slate-800 text-lg">{e.capitale}</p>
              <p className="text-xs font-mono text-orange-600 mt-2 font-black">{e.pop_capitale.toLocaleString()} hab.</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: CLASSEMENT COMPLET DES VILLES (Tableau trié) */}
      <section>
        <h2 className="flex items-center gap-3 text-2xl font-black mb-8 uppercase text-slate-800">
          <MapPin className="text-orange-500" /> Répertoire Urbain National par population
        </h2>
        <div className="overflow-hidden shadow-2xl rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 text-white">
              <tr className="text-[10px] uppercase font-black tracking-widest">
                <th className="p-5">Rang / Ville</th>
                <th className="p-5">État / Territoire</th>
                <th className="p-5 text-right">Population (Franchise Urbaine)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.classementUrbain.map((v: any, i: number) => (
                <tr key={i} className={`hover:bg-orange-50 transition-colors group ${i < 6 ? 'bg-slate-50' : 'bg-white'}`}>
                  <td className="p-5 font-bold text-slate-800">
                    <span className={`mr-4 font-mono text-xs ${i < 6 ? 'text-orange-500' : 'text-slate-300'}`}>
                      {(i + 1).toString().padStart(2, '0')}
                    </span>
                    {v.ville}
                  </td>
                  <td className="p-5 text-slate-500 italic text-xs uppercase font-medium">
                    {v.etat || v.province || v.statut}
                  </td>
                  <td className="p-5 text-right font-black text-slate-900 font-mono">
                    {(v.population || v.census_2011).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mt-20 py-10 text-center border-t border-slate-100 font-mono text-slate-400 text-[10px] uppercase tracking-[0.3em]">
        © 2026 Index Démographique Inde — {data.classementUrbain.length} Entités Urbanisées
      </footer>
    </main>
  );
}
