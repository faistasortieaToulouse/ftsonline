"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Building, Users, MapPin, Anchor } from "lucide-react";

export default function AfriqueDuSudPage() {
  const [villes, setVilles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/afriquedusud')
      .then(res => res.json())
      .then(data => {
        // Tri immédiat par population décroissante
        const sorted = data.sort((a: any, b: any) => b.population_agglo - a.population_agglo);
        setVilles(sorted);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse font-black text-green-700">CHARGEMENT...</div>;

  return (
    <main className="max-w-7xl mx-auto p-6 bg-white min-h-screen my-10 shadow-2xl rounded-xl border-t-8 border-green-600">
      
      <Link href="/" className="inline-flex items-center gap-2 text-slate-600 font-bold hover:text-green-600 transition-colors mb-10">
        <ArrowLeft size={20} /> Retour à l'Accueil
      </Link>

      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-7xl font-black text-slate-900 tracking-tighter uppercase">
            South Africa<span className="text-green-600">.</span>
          </h1>
          <p className="text-slate-400 font-mono mt-2 uppercase tracking-widest">Répertoire Urbain & Provincial 2026</p>
        </div>
        <div className="flex gap-2">
          <div className="h-4 w-8 bg-[#E03C31]"></div>
          <div className="h-4 w-8 bg-[#002395]"></div>
          <div className="h-4 w-8 bg-[#FFB81C]"></div>
          <div className="h-4 w-8 bg-[#007749]"></div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-slate-400 font-mono">
            Recensement 2020 & Estimations 2025/26
          </p>
          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">
            Classé par population urbaine
          </span>
        </div>
      <br />
      <br />
        
      </header>

      {/* GRILLE DES VILLES TRIÉES */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {villes.map((item, i) => (
          <div key={i} className="group border border-slate-100 p-6 rounded-2xl hover:border-green-500 hover:shadow-xl transition-all relative overflow-hidden">
            {/* Badge de rang */}
            <div className="absolute top-0 right-0 bg-slate-900 text-white px-4 py-1 rounded-bl-xl font-black text-sm group-hover:bg-green-600 transition-colors">
              #{i + 1}
            </div>

            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-green-50">
                {item.role.includes("Port") ? <Anchor className="text-green-600" /> : <Building className="text-green-600" />}
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800">{item.ville}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <MapPin size={10} /> {item.province}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Population Agglo</p>
                <p className="text-3xl font-black text-slate-900">
                  {item.population_agglo.toLocaleString('fr-FR')}
                </p>
              </div>

              <div className="px-1">
                <p className="text-[10px] font-bold text-green-700 uppercase italic leading-tight">
                  {item.role}
                </p>
              </div>
            </div>
            
            {/* Barre de progression visuelle (basée sur le top 1 : Jobourg) */}
            <div className="mt-6 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 opacity-30" 
                style={{ width: `${(item.population_agglo / villes[0].population_agglo) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </section>

      <footer className="mt-20 pt-10 border-t border-slate-100 text-center font-mono text-slate-400 text-[10px]">
        REPUBLIC OF SOUTH AFRICA - DEMOGRAPHIC DATA SERVICE 2026
      </footer>
    </main>
  );
}
