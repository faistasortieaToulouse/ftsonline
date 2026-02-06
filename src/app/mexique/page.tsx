"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Landmark, Building2, MapPin, Zap } from "lucide-react";

export default function MexiquePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/mexique')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-20 text-center font-mono text-amber-600 animate-pulse uppercase tracking-tighter">Chargement des données mexicaines...</div>;

  return (
    <main className="max-w-7xl mx-auto p-6 bg-white min-h-screen">
      <Link href="/" className="inline-flex items-center gap-2 text-amber-600 font-black mb-8 hover:translate-x-[-4px] transition-transform uppercase text-sm">
        <ArrowLeft size={18} /> Retour à l'Accueil
      </Link>

      <header className="mb-16 border-b-4 border-amber-500 pb-6">
        <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic">
          Mexique<span className="text-emerald-500">.</span>
        </h1>
        
        {/* LIGNE 1 : Source */}
        <div className="mt-6">
          <p className="text-slate-500 font-mono text-sm uppercase tracking-widest italic">
            Instituto Nacional de Estadística y Geografía (INEGI)
          </p>
        </div>
        
        {/* LIGNE 2 : Badges avec mt-4 */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
            États-Unis Mexicains
          </span>
          <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">
            Données Démographiques 2026
          </span>
        </div>
      </header>

      {/* SECTION 1: TOP 3 VILLES DE L'ÉTAT (Basé sur capitales ou villes majeures) */}
      <section className="mb-20">
        <h2 className="flex items-center gap-3 text-3xl font-black mb-10 uppercase text-slate-800 italic">
          <Zap className="text-amber-500 fill-amber-500" /> Pôles Urbains Majeurs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sélection manuelle des 3 plus gros du JSON */}
          {[
            { ville: "Ville de Mexico", pop: "9 250 000", desc: "CDMX - Capitale Fédérale" },
            { ville: "Tijuana", pop: "1 950 000", desc: "Basse-Californie" },
            { ville: "Puebla", pop: "1 720 000", desc: "Puebla de Zaragoza" }
          ].map((v, i) => (
            <div key={i} className="bg-slate-900 text-white p-6 rounded-2xl relative overflow-hidden border-b-4 border-emerald-500 shadow-xl">
              <Building2 className="absolute -right-4 -bottom-4 opacity-10" size={120} />
              <p className="text-amber-500 font-mono text-[10px] mb-1 uppercase tracking-widest">{v.desc}</p>
              <h3 className="text-3xl font-black mb-4">{v.ville}</h3>
              <p className="text-4xl font-black text-white italic">{v.pop}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: ÉTATS ET CAPITALES */}
      <section className="mb-20">
        <h2 className="flex items-center gap-3 text-2xl font-black mb-8 border-l-8 border-emerald-500 pl-4 uppercase text-slate-800">
          <Landmark className="text-slate-400" /> États et Capitales
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.etats_et_capitales.map((e: any, i: number) => (
            <div key={i} className="border border-slate-100 p-4 hover:border-amber-500 transition-all rounded-xl bg-slate-50/30">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">{e.etat}</p>
              <p className="font-bold text-slate-800 text-base">{e.capitale}</p>
              <p className="text-xs font-mono text-emerald-600 font-bold mt-2">Pop: {e.population_capitale}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: AUTRES GRANDES VILLES */}
      <section>
        <h2 className="flex items-center gap-3 text-2xl font-black mb-8 uppercase text-slate-800">
          <MapPin className="text-amber-500" /> Autres Concentrations Urbaines
        </h2>
        <div className="overflow-hidden shadow-2xl rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 text-white">
              <tr className="text-[10px] uppercase font-black tracking-widest">
                <th className="p-5">Ville</th>
                <th className="p-5">État</th>
                <th className="p-5 text-right">Population</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.autres_grandes_villes.map((v: any, i: number) => (
                <tr key={i} className="hover:bg-amber-50 transition-colors bg-white">
                  <td className="p-5 font-bold text-slate-800">{v.ville}</td>
                  <td className="p-5 text-slate-500 italic text-xs uppercase">{v.etat}</td>
                  <td className="p-5 text-right font-black text-slate-900 font-mono">{v.population}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mt-20 py-10 text-center border-t border-slate-100 font-mono text-slate-400 text-[10px] uppercase tracking-[0.3em]">
        © 2026 Observatoire Démographique Mexique
      </footer>
    </main>
  );
}
