"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Landmark, Building2, MapPin, Zap } from "lucide-react";

export default function IranPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/iran')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-20 text-center font-mono text-emerald-600 animate-pulse uppercase tracking-widest">Initialisation des données iraniennes...</div>;

  return (
    <main className="max-w-7xl mx-auto p-6 bg-white min-h-screen">
      <Link href="/" className="inline-flex items-center gap-2 text-emerald-600 font-black mb-8 hover:translate-x-[-4px] transition-transform uppercase text-sm">
        <ArrowLeft size={18} /> Retour à l'Accueil
      </Link>

      <header className="mb-16 border-b-4 border-emerald-500 pb-6">
        <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic">
          Iran<span className="text-emerald-500">.</span>
        </h1>
        
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <p className="text-slate-500 font-mono text-sm uppercase tracking-widest italic">
            Statistical Centre of Iran (Classé par population urbaine)
          </p>
          <div className="flex items-center gap-3">
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
              République Islamique d'Iran
            </span>
            <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">
              Recensement 2020 & Estimations 2025/26
            </span>
          </div>
        </div>
      <br />
      <br />
      </header>

      {/* SECTION 1: TOP MÉGALOPOLES */}
      <section className="mb-20">
        <h2 className="flex items-center gap-3 text-3xl font-black mb-10 uppercase text-slate-800 italic">
          <Zap className="text-emerald-500 fill-emerald-500" /> Cœurs Urbains (+1M)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.classement_villes_principales.slice(0, 6).map((v: any, i: number) => (
            <div key={i} className="bg-slate-900 text-white p-6 rounded-2xl relative overflow-hidden group border-b-4 border-emerald-500 shadow-xl">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                <Building2 size={120} />
              </div>
              <p className="text-emerald-500 font-mono text-xs mb-1 uppercase tracking-widest">RANG #0{i + 1} — {v.province}</p>
              <h3 className="text-3xl font-black mb-4 group-hover:text-emerald-400 transition-colors">{v.ville}</h3>
              <p className="text-4xl font-black text-white italic">{v.population}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: PROVINCES */}
      <section className="mb-20">
        <h2 className="flex items-center gap-3 text-2xl font-black mb-8 border-l-8 border-emerald-500 pl-4 uppercase text-slate-800">
          <Landmark className="text-slate-400" /> Administration des Provinces
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.provinces.map((p: any, i: number) => (
            <div key={i} className="border border-slate-100 p-4 hover:border-emerald-500 hover:shadow-md transition-all rounded-lg bg-slate-50/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{p.nom}</p>
              <p className="font-bold text-slate-800 text-lg">{p.capitale}</p>
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-[10px] font-mono text-emerald-600 font-bold uppercase">Province: {p.population_totale}</p>
                <p className="text-[10px] font-mono text-slate-400 uppercase">Capitale: {p.population_capitale}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: TABLEAU COMPLET */}
      <section>
        <h2 className="flex items-center gap-3 text-2xl font-black mb-8 uppercase text-slate-800">
          <MapPin className="text-emerald-500" /> Répertoire Urbain Complet
        </h2>
        <div className="overflow-hidden shadow-2xl rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 text-white">
              <tr className="text-[10px] uppercase font-black tracking-widest">
                <th className="p-5">Ville</th>
                <th className="p-5">Province</th>
                <th className="p-5 text-right">Population</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.classement_villes_principales.map((v: any, i: number) => (
                <tr key={i} className="hover:bg-emerald-50 transition-colors bg-white">
                  <td className="p-5 font-bold text-slate-800">{v.ville}</td>
                  <td className="p-5 text-slate-500 italic text-xs uppercase font-medium">{v.province}</td>
                  <td className="p-5 text-right font-black text-slate-900 font-mono">{v.population}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mt-20 py-10 text-center border-t border-slate-100 font-mono text-slate-400 text-[10px] uppercase tracking-[0.3em]">
        © 2026 Index Démographique Iran — Données Source JSON
      </footer>
    </main>
  );
}
