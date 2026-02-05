"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Landmark, Building2, TrendingUp, Users } from "lucide-react";

export default function ChinePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/chine')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse font-bold text-red-600 uppercase tracking-widest">Chargement des données démographiques...</div>;

  // Préparation et tri des données par population urbaine décroissante
  const allEntities = [
    ...data.administration_territoriale.provinces,
    ...data.administration_territoriale.regions_autonomes,
    ...data.administration_territoriale.municipalites
  ].sort((a: any, b: any) => (b.pop_capitale_urbaine || 0) - (a.pop_capitale_urbaine || 0));

  return (
    <main className="max-w-7xl mx-auto p-6 bg-white min-h-screen shadow-2xl my-10 border border-slate-100 rounded-xl">
      
      <Link href="/" className="inline-flex items-center gap-2 text-red-600 font-black hover:bg-red-50 p-2 rounded-md transition-all mb-10">
        <ArrowLeft size={20} /> RETOUR À L'ACCUEIL
      </Link>

      <header className="border-l-8 border-red-600 pl-6 mb-16">
        <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase">Chine</h1>
        <div className="flex items-center gap-4 mt-2">
          <p className="text-slate-400 font-mono text-sm">{data.data_source}</p>
          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">
            Classé par population urbaine
          </span>
        </div>
      </header>

      {/* SECTION PRINCIPALE : CLASSEMENT URBAIN */}
      <section className="mb-20">
        <div className="flex items-center gap-4 mb-10 border-b border-slate-100 pb-4">
          <Landmark size={32} className="text-red-600" />
          <h2 className="text-3xl font-black uppercase tracking-tight text-slate-800">Métropoles & Capitales</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allEntities.map((item: any, i: number) => (
            <div key={i} className="group relative bg-slate-50/50 p-6 rounded-3xl border border-slate-100 hover:border-red-500 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-xl">
              <span className="absolute top-4 right-6 text-4xl font-black text-slate-100 group-hover:text-red-50 transition-colors">
                {String(i + 1).padStart(2, '0')}
              </span>
              
              <div className="relative z-10">
                <h3 className="font-black text-2xl text-slate-900 leading-none mb-1">
                  {item.capitale || item.nom}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                  {item.capitale ? `Prov. ${item.nom}` : 'MUNICIPALITÉ'}
                </p>

                <div className="space-y-4">
                  {/* Chiffre Clé : Population Urbaine */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-inner group-hover:border-red-100">
                    <p className="text-[9px] font-black text-red-600 uppercase mb-1 tracking-tighter">Population Urbaine</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900 tracking-tighter">
                        {(item.pop_capitale_urbaine / 1000000).toFixed(1)}
                      </span>
                      <span className="text-sm font-bold text-slate-400">Millions</span>
                    </div>
                  </div>

                  {/* Info secondaire : Population totale de la province */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5">
                      <Users size={12} className="text-slate-300" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Total Province</span>
                    </div>
                    <span className="text-xs font-black text-slate-600 italic">
                      {item.population_est_2026 || item.population_totale_2026}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

{/* SECTION COMPLÉMENTAIRE : VILLES SECONDAIRES TRIÉES PAR POPULATION */}
{data.villes_principales_urbaines && (
  <section className="mt-24">
    <div className="flex items-center justify-between mb-8 border-b-2 border-blue-100 pb-4">
      <div className="flex items-center gap-4">
        <Building2 size={32} className="text-blue-600" />
        <h2 className="text-3xl font-black uppercase tracking-tight text-slate-800">Index Urbain Complet</h2>
      </div>
      <span className="text-xs font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase">
        Trié par Census 2020
      </span>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {/* On ajoute le TRI ici basé sur census_2020 */}
      {[...data.villes_principales_urbaines]
        .sort((a: any, b: any) => b.census_2020 - a.census_2020)
        .map((v: any, i: number) => (
          <div key={i} className="bg-slate-50 p-3 rounded-xl border border-transparent hover:border-blue-300 hover:bg-white transition-all group text-center relative overflow-hidden">
            {/* Petit badge de classement discret */}
            <span className="absolute top-0 left-0 bg-blue-100 text-blue-600 text-[8px] font-black px-1.5 rounded-br-lg">
              #{i + 1}
            </span>
            
            <p className="text-[9px] font-black text-slate-300 uppercase mb-1 truncate px-2">{v.province}</p>
            <p className="font-bold text-slate-800 text-sm leading-tight mb-1">{v.ville}</p>
            <p className="text-blue-600 font-mono text-[11px] font-black">
              {v.census_2020.toLocaleString('fr-FR')}
            </p>
          </div>
        ))}
    </div>
  </section>
)}

      <footer className="mt-20 pt-10 border-t border-slate-100 text-center">
        <p className="font-mono text-slate-400 text-[10px] uppercase tracking-widest">
          © {new Date().getFullYear()} Répertoire Démographique National - République Populaire de Chine
        </p>
      </footer>
    </main>
  );
}
