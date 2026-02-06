"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Landmark, Building2, MapPin, Zap, Star } from "lucide-react";

export default function TurquiePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/turquie')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-20 text-center font-mono text-red-600 animate-pulse uppercase">Chargement des données de Turquie...</div>;

  return (
    <main className="max-w-7xl mx-auto p-6 bg-white min-h-screen">
      <Link href="/" className="inline-flex items-center gap-2 text-red-600 font-black mb-8 hover:translate-x-[-4px] transition-transform uppercase text-sm">
        <ArrowLeft size={18} /> Retour à l'Accueil
      </Link>

      <header className="mb-16 border-b-4 border-red-600 pb-6">
        <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic">
          Turquie<span className="text-red-600">.</span>
        </h1>
        
        {/* LIGNE 1 : Source demandée */}
        <div className="mt-6">
          <p className="text-slate-500 font-mono text-sm uppercase tracking-widest italic">
            Turkish Statistical Institute (TÜİK) - Adrese Dayalı Nüfus Kayıt Sistemi
          </p>
        </div>
        
        {/* LIGNE 2 : Badges avec espace mt-4 */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
            République de Turquie
          </span>
          <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">
            Estimations 2025/26 - 81 Provinces
          </span>
        </div>
      </header>

      {/* SECTION 1: TOP MÉGALOPOLES */}
      <section className="mb-20">
        <h2 className="flex items-center gap-3 text-3xl font-black mb-10 uppercase text-slate-800 italic">
          <Zap className="text-red-500 fill-red-500" /> Pôles Majeurs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.donnees_provinciales_principales.slice(0, 3).map((v: any, i: number) => (
            <div key={i} className="bg-slate-900 text-white p-6 rounded-2xl relative overflow-hidden group border-b-4 border-red-500 shadow-xl">
              <Building2 className="absolute -right-4 -bottom-4 opacity-10" size={120} />
              <p className="text-red-400 font-mono text-[10px] mb-1 uppercase tracking-widest">Rang #{i + 1}</p>
              <h3 className="text-3xl font-black mb-4">{v.province}</h3>
              <p className="text-4xl font-black text-white italic">{v.pop_province}</p>
              <p className="text-[10px] text-slate-400 mt-2 uppercase">Agglomération urbaine principale</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: VILLES DES PROVINCES PRINCIPALES */}
      <section className="mb-20">
        <h2 className="flex items-center gap-3 text-2xl font-black mb-8 border-l-8 border-red-600 pl-4 uppercase text-slate-800">
          <Landmark className="text-slate-400" /> Provinces de Premier Plan
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.donnees_provinciales_principales.map((p: any, i: number) => (
            <div key={i} className="border border-slate-100 p-4 hover:border-red-500 transition-all rounded-xl bg-slate-50/50 group">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{p.province}</p>
              <p className="font-bold text-slate-800 text-lg">{p.capitale}</p>
              <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-end">
                <div>
                  <p className="text-[8px] text-slate-400 uppercase font-bold">Province</p>
                  <p className="text-sm font-black text-red-600 font-mono">{p.pop_province}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-slate-400 uppercase font-bold">Ville</p>
                  <p className="text-sm font-black text-slate-900 font-mono">{p.pop_capitale}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: RÉPERTOIRE COMPLET DES VILLES DES 81 PROVINCES */}
      <section>
        <h2 className="flex items-center gap-3 text-2xl font-black mb-8 uppercase text-slate-800">
          <MapPin className="text-red-500" /> Répertoire Administratif (1-81)
        </h2>
        
        <div className="overflow-hidden shadow-2xl rounded-2xl border border-slate-100 mt-6">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900 text-white sticky top-0 z-10">
                <tr className="text-[10px] uppercase font-black tracking-widest">
                  <th className="p-5 w-20">Code</th>
                  <th className="p-5">Province</th>
                  <th className="p-5">Chef-lieu</th>
                  <th className="p-5 text-right">Population Ville</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.liste_complete_provinces.map((v: any, i: number) => (
                  <tr key={i} className="hover:bg-red-50 transition-colors bg-white">
                    <td className="p-5 font-mono text-xs text-slate-400">{v.id.toString().padStart(2, '0')}</td>
                    <td className="p-5 font-bold text-slate-800 underline decoration-red-200 underline-offset-4">{v.province}</td>
                    <td className="p-5 text-slate-500 italic text-xs uppercase">{v.capitale}</td>
                    <td className="p-5 text-right font-black text-slate-900 font-mono">{v.pop_capitale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <footer className="mt-20 py-10 text-center border-t border-slate-100 font-mono text-slate-400 text-[10px] uppercase tracking-[0.3em]">
        © 2026 Türkiye Veri Analitiği — TÜİK System Registration
      </footer>
    </main>
  );
}
