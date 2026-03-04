"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { 
  ArrowLeft, 
  Globe, 
  History, 
  Sparkles, 
  BookOpen, 
  Quote, 
  Cpu, 
  Zap, 
  Wifi, 
  MousePointer2 
} from "lucide-react";

export default function HistoireInternetPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/histoireinternet')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur de chargement:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fffcf5]">
      <div className="animate-spin mb-4 text-blue-600"><History size={40} /></div>
      <div className="font-serif italic text-blue-800">Chargement des archives du World Wide Web...</div>
    </div>
  );

  if (!data) return (
    <div className="p-20 text-center text-red-600 font-bold">
      Erreur : Impossible de charger les mémoires du réseau.
    </div>
  );

  // Utilisation de la liste spécifique de ton JSON
  const listeChronologie = data.sites_importants_popular_mechanics || [];

  return (
    <main className="max-w-5xl mx-auto p-4 md:p-10 bg-[#fffcf5] min-h-screen my-5 md:my-10 shadow-2xl rounded-3xl border border-blue-100 overflow-hidden">
      
      {/* Bouton Retour stylisé */}
      <Link href="/" className="group inline-flex items-center gap-2 text-blue-900 font-bold hover:text-blue-600 transition-colors mb-12">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour à l'Accueil
      </Link>

      {/* Header Monumental */}
      <header className="text-center mb-24 relative">
        <div className="flex justify-center mb-6 text-blue-500 opacity-80">
          <Globe size={64} strokeWidth={1.5} />
        </div>
        <h1 className="text-5xl md:text-7xl font-serif font-black text-slate-900 mb-4 tracking-tighter uppercase">
          {data.titre}
        </h1>
        <p className="text-blue-600 font-serif italic text-xl md:text-2xl tracking-wide max-w-2xl mx-auto leading-relaxed">
          « {data.introduction} »
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <div className="w-12 h-px bg-blue-200"></div>
          <div className="w-2 h-2 rotate-45 bg-blue-400"></div>
          <div className="w-12 h-px bg-blue-200"></div>
        </div>
      </header>

      {/* Timeline Centrale */}
      <section className="relative px-2">
        {/* Ligne centrale de la Timeline */}
        <div className="absolute left-6 md:left-1/2 h-full w-px bg-gradient-to-b from-blue-200 via-blue-400 to-blue-200 transform md:-translate-x-1/2"></div>

        <div className="space-y-20">
          {listeChronologie.map((event: any, i: number) => (
            <div key={event.id || i} className={`relative flex flex-col md:flex-row items-center ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
              
              {/* Point d'ancrage avec icône dynamique selon la date */}
              <div className="absolute left-6 md:left-1/2 w-10 h-10 bg-white rounded-full border-2 border-blue-400 flex items-center justify-center transform -translate-x-1/2 z-20 shadow-lg group-hover:scale-110 transition-transform">
                {parseInt(event.annee) < 1990 ? <Cpu size={16} className="text-blue-600" /> : 
                 parseInt(event.annee) < 2000 ? <Wifi size={16} className="text-blue-600" /> :
                 <Zap size={16} className="text-amber-500" />}
              </div>

              {/* Contenu de la carte d'événement */}
              <div className="w-full md:w-[45%] ml-16 md:ml-0">
                <div className="p-8 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-blue-300 transition-all hover:-translate-y-1 group relative overflow-hidden">
                  
                  {/* Badge de l'année */}
                  <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4">
                    Époque {event.annee}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl font-serif font-black text-blue-900 leading-none">
                        {event.annee}
                    </span>
                    <Sparkles size={16} className="text-blue-200 group-hover:text-amber-400 transition-colors" />
                  </div>

                  <h3 className="text-2xl font-black text-slate-800 mb-4 group-hover:text-blue-600 transition-colors leading-tight">
                    {event.nom}
                  </h3>

                  <p className="text-slate-600 leading-relaxed font-medium">
                    {event.description}
                  </p>
                </div>
              </div>

              {/* Espaceur pour le côté opposé */}
              <div className="hidden md:block md:w-[45%]"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Traditionnel */}
      <footer className="mt-40 pt-16 border-t-2 border-dashed border-blue-100 text-center pb-20">
        <div className="flex justify-center gap-6 text-blue-300 mb-8">
          <BookOpen size={24} />
          <MousePointer2 size={24} />
          <Quote size={24} />
        </div>
        <h4 className="font-serif text-2xl font-bold text-slate-800 mb-4">
          L'évolution continue...
        </h4>
        <p className="font-serif italic text-blue-900/60 max-w-2xl mx-auto leading-relaxed px-4">
          « {data.conclusion} »
          <br />
          <span className="block mt-4 text-[10px] font-sans uppercase tracking-widest opacity-50">
            Archives Numériques FTS — 2026.
          </span>
        </p>
      </footer>
    </main>
  );
}
