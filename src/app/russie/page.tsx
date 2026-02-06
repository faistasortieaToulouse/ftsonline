"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Landmark, Building2, MapPin, Zap, Globe } from "lucide-react";

export default function RussiePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/russie')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-20 text-center font-mono text-blue-600 animate-pulse">Chargementd es données de Russie en cours...</div>;

  return (
    <main className="max-w-7xl mx-auto p-6 bg-white min-h-screen">
      <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-black mb-8 hover:translate-x-[-4px] transition-transform uppercase text-sm">
        <ArrowLeft size={18} /> Retour à l'Acceuil
      </Link>

      <header className="mb-16 border-b-4 border-blue-600 pb-6">
        <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic">
          Russie<span className="text-red-600">.</span>
        </h1>
        
        {/* LIGNE 1 : Source */}
        <div className="mt-6">
          <p className="text-slate-500 font-mono text-sm uppercase tracking-widest italic">
            Service fédéral des statistiques de l'État (Rosstat)
          </p>
        </div>
        
        {/* LIGNE 2 : Badges avec espace mt-4 */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
            Fédération de Russie
          </span>
          <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">
            Recensement & Estimations 2026
          </span>
        </div>
      </header>

      {/* SECTION 1: VILLES FÉDÉRALES & MILLIONNAIRES */}
      <section className="mb-20">
        <h2 className="flex items-center gap-3 text-3xl font-black mb-10 uppercase text-slate-800 italic">
          <Zap className="text-blue-500 fill-blue-500" /> Centres de Pouvoir
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.classement_villes_principales.slice(0, 4).map((v: any, i: number) => (
            <div key={i} className="bg-slate-900 text-white p-6 rounded-2xl relative overflow-hidden group border-b-4 border-red-500 shadow-xl">
              <Building2 className="absolute -right-4 -bottom-4 opacity-10" size={100} />
              <p className="text-blue-400 font-mono text-[10px] mb-1 uppercase tracking-widest">{v.sujet}</p>
              <h3 className="text-2xl font-black mb-4">{v.ville}</h3>
              <p className="text-3xl font-black text-white italic">{v.population}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: RÉPUBLIQUES & KRAÏS */}
      <section className="mb-20">
        <h2 className="flex items-center gap-3 text-2xl font-black mb-8 border-l-8 border-blue-600 pl-4 uppercase text-slate-800">
          <Landmark className="text-slate-400" /> Sujets de la Fédération
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...data.republiques, ...data.krais].slice(0, 12).map((r: any, i: number) => (
            <div key={i} className="border border-slate-100 p-4 hover:border-blue-500 transition-all rounded-xl bg-slate-50/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{r.nom}</p>
              <p className="font-bold text-slate-800 text-lg mb-2">{r.capitale}</p>
              <div className="pt-2 border-t border-slate-200">
                <p className="text-[10px] font-mono text-blue-600 font-bold">Total: {r.population_totale}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: TABLEAU COMPLET DES OBLASTS */}
      <section>
        <h2 className="flex items-center gap-3 text-2xl font-black mb-8 uppercase text-slate-800">
          <MapPin className="text-red-500" /> Répertoire des villes des Oblasts
        </h2>
        <div className="overflow-hidden shadow-2xl rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 text-white">
              <tr className="text-[10px] uppercase font-black tracking-widest">
                <th className="p-5">Oblast</th>
                <th className="p-5">Centre Admin.</th>
                <th className="p-5 text-right">Population Totale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.oblasts.map((o: any, i: number) => (
                <tr key={i} className="hover:bg-blue-50 transition-colors bg-white">
                  <td className="p-5 font-bold text-slate-800">{o.nom}</td>
                  <td className="p-5 text-slate-500 italic text-xs uppercase">{o.capitale}</td>
                  <td className="p-5 text-right font-black text-slate-900 font-mono">{o.population_totale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mt-20 py-10 text-center border-t border-slate-100 font-mono text-slate-400 text-[10px] uppercase tracking-[0.3em]">
        © 2026 Rosstat Federal Registry — Russia Data
      </footer>
    </main>
  );
}
