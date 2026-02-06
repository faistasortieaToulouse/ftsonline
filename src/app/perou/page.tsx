"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Landmark, Building2, MapPin, Zap } from "lucide-react";

export default function PerouPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/perou')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-20 text-center font-mono text-rose-600 animate-pulse uppercase tracking-widest">Chargement des données du Pérou en cours...</div>;

  return (
    <main className="max-w-7xl mx-auto p-6 bg-white min-h-screen">
      <Link href="/" className="inline-flex items-center gap-2 text-rose-600 font-black mb-8 hover:translate-x-[-4px] transition-transform uppercase text-sm">
        <ArrowLeft size={18} /> Retour à l'Accueil
      </Link>

      <header className="mb-16 border-b-4 border-rose-600 pb-6">
        <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic">
          Pérou<span className="text-rose-600">.</span>
        </h1>
        
        {/* LIGNE 1 : Source */}
        <div className="mt-6">
          <p className="text-slate-500 font-mono text-sm uppercase tracking-widest italic">
            Instituto Nacional de Estadística e Informática (INEI)
          </p>
        </div>
        
        {/* LIGNE 2 : Badges avec espace mt-4 */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
            République du Pérou
          </span>
          <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">
            Estimations 2026 - Régions & Départements
          </span>
        </div>
      </header>

      {/* SECTION 1: FOCUS LIMA & MACRO-VILLES */}
      <section className="mb-20">
        <h2 className="flex items-center gap-3 text-3xl font-black mb-10 uppercase text-slate-800 italic">
          <Zap className="text-rose-500 fill-rose-500" /> Métropoles de l'Ouest
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.classement_villes.slice(0, 3).map((v: any, i: number) => (
            <div key={i} className="bg-slate-900 text-white p-6 rounded-2xl relative overflow-hidden group border-b-4 border-rose-500 shadow-xl">
              <Building2 className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform" size={120} />
              <p className="text-rose-400 font-mono text-[10px] mb-1 uppercase tracking-widest">{v.region}</p>
              <h3 className="text-3xl font-black mb-4 group-hover:text-rose-300 transition-colors">{v.ville}</h3>
              <p className="text-4xl font-black text-white italic">{v.population}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: VILLES DES RÉGIONS ET DÉPARTEMENTS */}
      <section className="mb-20">
        <h2 className="flex items-center gap-3 text-2xl font-black mb-8 border-l-8 border-rose-600 pl-4 uppercase text-slate-800">
          <Landmark className="text-slate-400" /> Administration Territoriale
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.regions_et_departements.map((r: any, i: number) => (
            <div key={i} className="border border-slate-100 p-4 hover:border-rose-500 hover:shadow-md transition-all rounded-xl bg-slate-50/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{r.nom}</p>
              <p className="font-bold text-slate-800 text-lg mb-2">{r.capitale}</p>
              <div className="pt-2 border-t border-slate-200">
                <p className="text-[10px] font-mono text-rose-600 font-bold uppercase tracking-tighter">Total: {r.population_totale || r.population_region}</p>
                <p className="text-[10px] font-mono text-slate-400 uppercase">Urbain: {r.population_capitale}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: CLASSEMENT URBAIN COMPLET DU PEROU */}
      <section>
        <h2 className="flex items-center gap-3 text-2xl font-black mb-8 uppercase text-slate-800">
          <MapPin className="text-rose-500" /> Principaux Centres Urbains
        </h2>
        <div className="overflow-hidden shadow-2xl rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 text-white">
              <tr className="text-[10px] uppercase font-black tracking-widest">
                <th className="p-5">Ville</th>
                <th className="p-5">Région Administrative</th>
                <th className="p-5 text-right">Population</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.classement_villes.map((v: any, i: number) => (
                <tr key={i} className="hover:bg-rose-50 transition-colors bg-white">
                  <td className="p-5 font-bold text-slate-800">{v.ville}</td>
                  <td className="p-5 text-slate-500 italic text-xs uppercase font-medium">{v.region}</td>
                  <td className="p-5 text-right font-black text-slate-900 font-mono">{v.population}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mt-20 py-10 text-center border-t border-slate-100 font-mono text-slate-400 text-[10px] uppercase tracking-[0.3em]">
        © 2026 Peru Data Central — INEI System
      </footer>
    </main>
  );
}
