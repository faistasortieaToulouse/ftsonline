"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Landmark, History, Sparkles, BookOpen, Quote, Plane, Rocket, Heart } from "lucide-react";

export default function HistoireToulousePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/histoiretoulouse')
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
      <div className="animate-spin mb-4 text-amber-600"><History size={40} /></div>
      <div className="font-serif italic text-amber-800">Exploration des archives de la Ville Rose...</div>
    </div>
  );

  if (!data) return <div className="p-20 text-center text-red-600 font-bold">Erreur : Impossible de charger les mémoires de Tolosa.</div>;

  const listeChronologie = data.chronologie || [];

  return (
    <main className="max-w-5xl mx-auto p-4 md:p-10 bg-[#fffcf5] min-h-screen my-5 md:my-10 shadow-2xl rounded-3xl border border-amber-100 overflow-hidden">
      
      {/* Bouton Retour stylisé */}
      <Link href="/" className="group inline-flex items-center gap-2 text-amber-900 font-bold hover:text-rose-600 transition-colors mb-12">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour à l'Agenda
      </Link>

      {/* Header Monumental */}
      <header className="text-center mb-24 relative">
        <div className="flex justify-center mb-6 text-rose-500 opacity-80">
          <Landmark size={64} strokeWidth={1.5} />
        </div>
        <h1 className="text-6xl md:text-8xl font-serif font-black text-slate-900 mb-2 tracking-tighter">
          {data.ville}
        </h1>
        <p className="text-rose-600 font-serif italic text-2xl md:text-3xl tracking-wide">
          « {data.nom_antique} »
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <div className="w-12 h-px bg-amber-300"></div>
          <div className="w-2 h-2 rotate-45 bg-rose-400"></div>
          <div className="w-12 h-px bg-amber-300"></div>
        </div>
      </header>

      {/* Section Symboles (Optionnelle si présente dans le JSON) */}
      {data.symboles && (
        <section className="mb-24 bg-white/60 backdrop-blur-sm p-8 rounded-3xl border-l-8 border-rose-500 shadow-xl">
          <div className="flex items-start gap-5">
            <Sparkles className="text-amber-500 shrink-0 mt-1" size={28} />
            <div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">
                {data.symboles.surnom}
              </h2>
              <p className="text-slate-700 leading-relaxed text-lg italic font-serif">
                {data.symboles.explication}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Timeline Moderne */}
      <section className="relative px-2">
        {/* Ligne centrale */}
        <div className="absolute left-6 md:left-1/2 h-full w-px bg-gradient-to-b from-rose-200 via-amber-200 to-rose-200 transform md:-translate-x-1/2"></div>

        <div className="space-y-20">
          {listeChronologie.map((event: any, i: number) => (
            <div key={i} className={`relative flex flex-col md:flex-row items-center ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
              
              {/* Point d'ancrage avec icône dynamique selon la période */}
              <div className="absolute left-6 md:left-1/2 w-10 h-10 bg-white rounded-full border-2 border-rose-400 flex items-center justify-center transform -translate-x-1/2 z-20 shadow-lg group-hover:scale-110 transition-transform">
                {event.periode.includes("Aéro") ? <Plane size={16} className="text-rose-600" /> : 
                 event.periode.includes("Techno") ? <Rocket size={16} className="text-rose-600" /> :
                 <History size={16} className="text-amber-700" />}
              </div>

              {/* Contenu de la carte */}
              <div className="w-full md:w-[45%] ml-16 md:ml-0">
                <div className="p-8 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-rose-300 transition-all hover:-translate-y-1 group relative overflow-hidden">
                  
                  {/* Badge de Période */}
                  <div className="inline-block px-3 py-1 bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4">
                    {event.periode}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-serif font-black text-amber-900 leading-none">
                        {event.date}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-800 mb-4 group-hover:text-rose-600 transition-colors leading-tight">
                    {event.evenement}
                  </h3>

                  <p className="text-slate-600 leading-relaxed font-medium">
                    {event.details}
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
      <footer className="mt-40 pt-16 border-t-2 border-dashed border-amber-200 text-center pb-20">
        <div className="flex justify-center gap-6 text-rose-300 mb-8">
          <BookOpen size={24} />
          <Heart size={24} fill="currentColor" />
          <Quote size={24} />
        </div>
        <h4 className="font-serif text-2xl font-bold text-slate-800 mb-2">Ô mon pays, ô Toulouse...</h4>
        <p className="font-serif italic text-amber-900/60 max-w-lg mx-auto leading-relaxed">
          Une épopée gravée dans la brique et tournée vers les étoiles. 
          Archives FTS Online — 2026.
        </p>
      </footer>
    </main>
  );
}
