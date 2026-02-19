"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Landmark, History, Sparkles, BookOpen, Quote } from "lucide-react";

export default function HistoireToulousePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/histoiretoulouse')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse font-serif italic text-amber-800">Parcours des manuscrits anciens...</div>;

  return (
    <main className="max-w-5xl mx-auto p-6 bg-[#fffcf5] min-h-screen my-10 shadow-2xl rounded-xl border border-amber-100">
      
      {/* Retour */}
      <Link href="/" className="inline-flex items-center gap-2 text-amber-800 font-bold hover:bg-amber-50 p-2 rounded-md transition-all mb-10">
        <ArrowLeft size={20} /> RETOUR AU RÉPERTOIRE
      </Link>

      {/* Header Historique */}
      <header className="text-center mb-20">
        <div className="flex justify-center mb-4 text-amber-700">
          <Landmark size={48} />
        </div>
        <h1 className="text-5xl font-serif font-black text-slate-900 mb-2 uppercase tracking-widest">
          {data.ville}
        </h1>
        <p className="text-amber-800 font-serif italic text-xl">
          « {data.nom_antique} »
        </p>
        <div className="w-24 h-1 bg-amber-600 mx-auto mt-6"></div>
      </header>

      {/* Section Symboles */}
      <section className="mb-20 bg-white p-8 rounded-2xl shadow-sm border-l-4 border-rose-400 italic">
        <div className="flex items-start gap-4">
          <Sparkles className="text-rose-400 shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-rose-600 mb-2 uppercase tracking-tight">
              {data.symboles.surnom}
            </h2>
            <p className="text-slate-700 leading-relaxed">
              {data.symboles.explication}
            </p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="relative">
        <div className="absolute left-4 md:left-1/2 h-full w-0.5 bg-amber-200 transform md:-translate-x-1/2"></div>

        <div className="space-y-12">
          {data.chronology.map((event: any, i: number) => (
            <div key={i} className={`relative flex flex-col md:flex-row items-center ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
              
              {/* Point sur la ligne */}
              <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-amber-600 rounded-full border-4 border-[#fffcf5] transform -translate-x-1/2 z-10"></div>

              {/* Contenu */}
              <div className="w-full md:w-5/12 ml-10 md:ml-0">
                <div className="p-6 bg-white rounded-xl shadow-md border border-slate-100 hover:border-amber-400 transition-colors group">
                  <span className="text-xs font-black text-amber-600 uppercase tracking-widest block mb-1">
                    {event.periode}
                  </span>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-lg font-serif font-bold text-slate-900 underline decoration-amber-300">
                        {event.date}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-3 group-hover:text-amber-700 transition-colors">
                    {event.evenement}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {event.details}
                  </p>
                </div>
              </div>

              {/* Espace vide pour l'autre côté en desktop */}
              <div className="hidden md:block md:w-5/12"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer style parchemin */}
      <footer className="mt-32 pt-10 border-t border-amber-200 text-center pb-10">
        <div className="flex justify-center gap-4 text-amber-800/40 mb-4">
          <BookOpen size={20} />
          <History size={20} />
          <Quote size={20} />
        </div>
        <p className="font-serif italic text-amber-900/60 text-sm">
          Mémoires de la cité des Capitouls — Archives de la Garonne
        </p>
      </footer>
    </main>
  );
}
