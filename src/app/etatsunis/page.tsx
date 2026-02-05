"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Building2, Star, Users } from "lucide-react";

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

  if (loading) return <div className="p-20 text-center animate-pulse font-black text-blue-800 tracking-widest uppercase">Chargement des données...</div>;

  return (
    <main className="max-w-7xl mx-auto p-6 bg-slate-50 min-h-screen my-10 shadow-2xl rounded-2xl border border-slate-200">
      
      <Link href="/" className="inline-flex items-center gap-2 text-blue-800 font-black hover:bg-blue-100 p-2 rounded-md transition-all mb-10">
        <ArrowLeft size={20} /> Retour à l'Accueil
      </Link>

      <header className="mb-16 border-b-4 border-red-600 pb-8">
        <h1 className="text-8xl font-black text-slate-900 tracking-tighter uppercase leading-none">
          Etats-Unis<span className="text-red-600">.</span>
        </h1>
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <p className="text-slate-500 font-mono font-bold uppercase text-xs tracking-wider">Recensement & Estimations 2026</p>
          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm">
            Trié par Population de la Capitale
          </span>
        </div>
      </header>

      {/* SECTION 1 : CLASSEMENT PAR CAPITALE */}
      <section className="mb-24">
        <div className="flex items-center gap-4 mb-10">
          <Star size={32} className="text-blue-800 fill-blue-800" />
          <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-800">Sièges Administratifs</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...data.etats]
            // On trie directement sur le champ population_totale de l'état
            .sort((a, b) => parsePop(b.population_totale) - parsePop(a.population_totale))
            .map((etat: any, i: number) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-red-300 hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black text-slate-300 group-hover:text-red-600 transition-colors">RANK #{i + 1}</span>
                  <Building2 size={14} className="text-slate-200" />
                </div>
                
                {/* On affiche la Capitale en titre principal */}
                <h3 className="font-black text-xl text-slate-800 leading-tight mb-1">{etat.capitale}</h3>
                <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-4">{etat.nom}</p>
                
                <div className="flex items-center gap-2 bg-slate-900 text-white p-3 rounded-lg shadow-inner group-hover:bg-blue-900 transition-colors">
                  <Users size={16} className="text-red-500" />
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase font-black text-slate-400 leading-none">Population Urbaine</span>
                    <span className="font-mono font-black text-sm tracking-tighter">
                      {/* Affichage direct de la valeur du JSON */}
                      {etat.population_totale} <span className="text-[10px] text-slate-500 font-normal italic">hab.</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* SECTION 2 : VILLES DE +500K (Si présentes dans ton JSON) */}
      {data.villes_plus_de_500k && (
        <section className="mb-24 bg-slate-900 text-white p-10 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-4 mb-12">
            <Building2 size={32} className="text-red-500" />
            <h2 className="text-4xl font-black uppercase tracking-tighter">Métropoles Majeures</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-4">
            {[...data.villes_plus_de_500k]
              .sort((a, b) => parsePop(b.population) - parsePop(a.population))
              .map((v: any, i: number) => (
                <div key={i} className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex gap-4 items-center">
                    <span className="text-xl font-black text-red-600 w-6 italic">{i + 1}</span>
                    <p className="font-black text-lg">{v.ville}</p>
                  </div>
                  <p className="font-mono font-bold text-red-500">{v.population}</p>
                </div>
              ))}
          </div>
        </section>
      )}

      <footer className="mt-20 pt-10 border-t border-slate-200 text-center font-black text-slate-300 text-sm tracking-[1em] uppercase">
        United States of America 2026
      </footer>
    </main>
  );
}
