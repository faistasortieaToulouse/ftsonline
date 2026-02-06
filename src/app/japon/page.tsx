"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Landmark, Building2, MapPin, Zap } from "lucide-react";

export default function JaponPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/japon')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-20 text-center font-mono text-red-600 animate-pulse">Chargement en cours...</div>;

  return (
    <main className="max-w-7xl mx-auto p-6 bg-white min-h-screen">
      <Link href="/" className="inline-flex items-center gap-2 text-red-600 font-black mb-8 hover:translate-x-[-4px] transition-transform uppercase text-sm">
        <ArrowLeft size={18} /> Retour
      </Link>

      <header className="mb-16 border-b-4 border-red-600 pb-6">
        <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic">
          Japon<span className="text-red-600">.</span>
        </h1>
        
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
        
        {/* LIGNE 1 : Source */}
        <div className="mt-6">
          <p className="text-slate-500 font-mono text-sm uppercase tracking-widest italic">
            {data.data_source} (Classé par population urbaine)
          </p>
        </div>
        
        {/* LIGNE 2 : Badges avec espace mt-4 */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
            Archipel Nippon
          </span>
          <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">
            Estimations 2026 - 47 Préfectures
          </span>
        </div>
      </header>

      {/* SECTION 1: TOP MÉGALOPOLES (+5M) */}
      <section className="mb-20">
        <h2 className="flex items-center gap-3 text-3xl font-black mb-10 uppercase text-slate-800 italic">
          <Zap className="text-red-500 fill-red-500" /> Grandes Métropoles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.administration_territoriale.grandes_metropoles_plus_5m.map((v: any, i: number) => (
            <div key={i} className="bg-slate-900 text-white p-6 rounded-2xl relative overflow-hidden group border-b-4 border-red-500 shadow-xl">
              <Building2 className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform" size={100} />
              <p className="text-red-400 font-mono text-[10px] mb-1 uppercase tracking-widest">Rang #0{i + 1}</p>
              <h3 className="text-2xl font-black mb-1">{v.prefecture}</h3>
              <p className="text-xs text-slate-400 uppercase font-bold mb-4">Capitale: {v.capitale}</p>
              <p className="text-4xl font-black text-white italic">
                {v.population.toLocaleString('fr-FR')}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: RÉGIONS INTERMÉDIAIRES */}
      <section className="mb-20">
        <h2 className="flex items-center gap-3 text-2xl font-black mb-8 border-l-8 border-red-600 pl-4 uppercase text-slate-800">
          <Landmark className="text-slate-400" /> Villes des Régions Intermédiaires (2M - 5M)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.administration_territoriale.regions_intermediaires_2m_5m.map((p: any, i: number) => (
            <div key={i} className="border border-slate-100 p-4 hover:border-red-500 hover:shadow-md transition-all rounded-lg bg-slate-50/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{p.prefecture}</p>
              <p className="font-bold text-slate-800 text-lg">{p.capitale}</p>
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-lg font-mono font-black text-red-600">{p.population.toLocaleString('fr-FR')}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: AUTRES PRÉFECTURES ET VILLES */}
      <section>
        <h2 className="flex items-center gap-3 text-2xl font-black mb-8 uppercase text-slate-800">
          <MapPin className="text-red-500" /> Autres Préfectures & Villes
        </h2>
        <div className="overflow-hidden shadow-2xl rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 text-white">
              <tr className="text-[10px] uppercase font-black tracking-widest">
                <th className="p-5">Préfecture / Ville</th>
                <th className="p-5">Capitale administrative</th>
                <th className="p-5 text-right">Population (Est.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.administration_territoriale.autres_prefectures.map((v: any, i: number) => (
                <tr key={i} className="hover:bg-red-50 transition-colors bg-white">
                  <td className="p-5 font-bold text-slate-800">
                    {v.prefecture || v.ville} 
                    {v.ville && <span className="ml-2 text-[8px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase italic">Municipalité</span>}
                  </td>
                  <td className="p-5 text-slate-500 italic text-xs uppercase font-medium">{v.capitale || v.prefecture}</td>
                  <td className="p-5 text-right font-black text-slate-900 font-mono">
                    {(v.population || v.pop_est_2026).toLocaleString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mt-20 py-10 text-center border-t border-slate-100 font-mono text-slate-400 text-[10px] uppercase tracking-[0.3em]">
        © 2026 Japan Data Analytics — Prefecture Systems
      </footer>
    </main>
  );
}
