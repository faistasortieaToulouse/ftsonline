"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Flag, Building2, Map as MapIcon, Star, Users } from "lucide-react";

export default function EtatsUnisPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/etatsunis')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  const parsePop = (val: string) => {
    if (!val) return 0;
    return parseInt(val.replace(/[^0-9]/g, '')) || 0;
  };

  // Fonction pour trouver la population d'une ville (Capitale) dans les index
  const getCityPop = (cityName: string) => {
    const allCities = [...data.villes_plus_de_500k, ...data.villes_intermediaires];
    const city = allCities.find(v => v.ville.toLowerCase() === cityName.toLowerCase());
    return city ? parsePop(city.population) : 0;
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-black text-blue-800 tracking-widest">Chargement en cours...</div>;

  return (
    <main className="max-w-7xl mx-auto p-6 bg-slate-50 min-h-screen my-10 shadow-2xl rounded-2xl border border-slate-200">
      
      <Link href="/" className="inline-flex items-center gap-2 text-blue-800 font-black hover:bg-blue-100 p-2 rounded-md transition-all mb-10">
        <ArrowLeft size={20} /> Retour à l'Accueil
      </Link>

      <header className="mb-16 border-b-4 border-red-600 pb-8">
        <h1 className="text-8xl font-black text-slate-900 tracking-tighter uppercase leading-none">
          Etats-Unis<span className="text-red-600">.</span>
        </h1>
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <p className="text-slate-400 font-mono text-sm uppercase font-bold">U.S. Urban Centers Ranking</p>
          <span className="bg-blue-800 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
            Trié par poids de la Capitale/Ville d'État
          </span>
        </div>
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
      </header>

      {/* SECTION 1 : LES ÉTATS TRIÉS PAR POPULATION URBAINE DE LEUR CAPITALE/VILLE PRINCIPALE */}
      <section className="mb-24">
        <div className="flex items-center gap-4 mb-10">
          <Star size={32} className="text-blue-800 fill-blue-800" />
          <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-800">Classement par Siège Administratif</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...data.etats]
            .sort((a, b) => getCityPop(b.capitale) - getCityPop(a.capitale))
            .map((etat: any, i: number) => {
              const capPop = getCityPop(etat.capitale);
              return (
                <div key={i} className="bg-white p-5 rounded-xl border-l-4 border-l-red-600 border border-slate-200 hover:shadow-xl transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-slate-300">RANK #{i + 1}</span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 rounded">EST. 2026</span>
                  </div>
                  <h3 className="font-black text-xl text-slate-800 leading-tight">{etat.nom}</h3>
                  <div className="mt-4 mb-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Capitale Urbaine</p>
                    <p className="text-lg font-bold text-slate-700">{etat.capitale}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900 text-white p-2 rounded">
                    <Users size={14} className="text-red-500" />
                    <p className="font-mono font-black text-sm">
                      {capPop > 0 ? capPop.toLocaleString('fr-FR') : "Donnée N/A"} hab.
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* SECTION 2 : TOP MÉTROPOLES NATIONALES (> 500k) */}
      <section className="mb-24 bg-slate-900 text-white p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10">
            <Building2 size={200} />
        </div>
        <div className="flex items-center gap-4 mb-12 relative z-10">
          <Building2 size={32} className="text-red-500" />
          <h2 className="text-4xl font-black uppercase tracking-tighter">Top 30 des Métropoles Nationales</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-4 relative z-10">
          {[...data.villes_plus_de_500k]
            .sort((a, b) => parsePop(b.population) - parsePop(a.population))
            .map((v: any, i: number) => (
              <div key={i} className="flex items-center justify-between border-b border-white/10 pb-2 hover:bg-white/5 transition-colors">
                <div className="flex gap-4 items-center">
                  <span className="text-xl font-black text-red-600 w-6 italic">{i + 1}</span>
                  <div>
                    <p className="font-black text-lg">{v.ville}</p>
                    <p className="text-[9px] text-white/40 uppercase font-bold tracking-widest">{v.etat}</p>
                  </div>
                </div>
                <p className="font-mono font-bold text-red-500">{v.population}</p>
              </div>
            ))}
        </div>
      </section>

      <footer className="mt-20 pt-10 border-t border-slate-200 text-center font-black text-slate-300 text-sm tracking-[1em] uppercase">
        United States of America 2026
      </footer>
    </main>
  );
}
