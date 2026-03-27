"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Calendar, ExternalLink, Info, MapPin, Sparkles } from "lucide-react";

export default function EvenementsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/evenements')
      .then((res) => {
        if (!res.ok) throw new Error("Erreur serveur");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur de fetch:", err);
        // On évite le crash si le JSON est mal chargé
        setData({ Titre: "Agenda Indisponible", Sources: [] });
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="p-20 text-center animate-pulse font-bold text-blue-600 uppercase tracking-widest">
      Chargement des sites Web de l'agenda toulousain...
    </div>
  );

  return (
    <main className="max-w-7xl mx-auto p-6 bg-slate-50 min-h-screen my-10 shadow-2xl rounded-3xl border border-slate-200">
      
      {/* Navigation - Identique au style Radio */}
      <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-black hover:bg-blue-50 p-2 rounded-md transition-all mb-10">
        <ArrowLeft size={20} /> Retour à l'Accueil
      </Link>

      {/* Header style "Digital" - Adapté du style Tuner */}
      <header className="bg-slate-900 text-white p-10 rounded-3xl mb-12 shadow-inner border-b-4 border-blue-500">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase mb-2">
              {data.Titre || "Évènements"}
            </h1>
            <div className="flex items-center gap-2 text-blue-400 font-mono text-sm">
              <MapPin size={18} />
              <span>ZONE : TOULOUSE & AGGLOMÉRATION</span>
            </div>
          </div>
          <div className="hidden md:block">
             <div className="flex gap-1 items-end h-12">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="w-1 bg-blue-500 opacity-50" style={{ height: `${Math.random() * 100}%` }}></div>
                ))}
             </div>
          </div>
        </div>
      </header>

      {/* Liste des Sources d'évènements */}
      <section className="mb-20">
        <div className="flex items-center gap-4 mb-8">
          <Calendar size={32} className="text-blue-600" />
          <h2 className="text-3xl font-black uppercase text-slate-800 italic">Flux Culturels</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.Sources && data.Sources.map((source: any, i: number) => (
            <div key={i} className="group flex flex-col bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-500 transition-all shadow-sm hover:shadow-md">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-slate-900 text-blue-400 p-3 rounded-xl shadow-inner border border-slate-700">
                  <Sparkles size={24} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Source Officielle</span>
              </div>
              
              <div className="flex-1">
                <h3 className="font-black text-xl text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                  {source.Nom}
                </h3>
                <p className="text-xs text-slate-400 truncate font-mono bg-slate-100 p-1 rounded">
                  {source.Lien}
                </p>
              </div>

              <a 
                href={source.Lien} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-6 flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-all group-hover:scale-[1.02]"
              >
                CONSULTER <ExternalLink size={16} />
              </a>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-20 pt-10 border-t border-slate-200 text-center">
        <p className="font-mono text-slate-400 text-[10px] uppercase tracking-widest">
          © {new Date().getFullYear()} Hub Évènements - Base de données Toulouseain
        </p>
      </footer>
    </main>
  );
}
