"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Trophy, MapPin, Calendar, Activity, Users } from "lucide-react";

export default function ClubSportPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/clubsport')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => console.error("Erreur:", err));
  }, []);

  if (loading) {
    return (
      <div className="p-20 text-center animate-pulse font-bold text-red-600 uppercase tracking-widest">
        Chargement des clubs de sport de la ville rose...
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-6 bg-white min-h-screen shadow-2xl my-10 border border-slate-100 rounded-xl">
      
      {/* Navigation */}
      <Link href="/" className="inline-flex items-center gap-2 text-red-600 font-black hover:bg-red-50 p-2 rounded-md transition-all mb-10">
        <ArrowLeft size={20} /> Retour à l'Accueil
      </Link>

      <header className="border-l-8 border-red-600 pl-6 mb-16">
        <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase">
          {data.ville} <span className="text-red-600">Sport</span>
        </h1>
        <p className="text-slate-400 font-mono text-sm mt-2 uppercase tracking-widest">
          Répertoire des clubs professionnels et amateurs
        </p>
      </header>

      {/* SECTION 1 : CLUBS PROFESSIONNELS (GRILLE) */}
      <section className="mb-20">
        <div className="flex items-center gap-4 mb-10 border-b border-slate-100 pb-4">
          <Trophy size={32} className="text-red-600" />
          <h2 className="text-3xl font-black uppercase tracking-tight text-slate-800">Elite Professionnelle</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.clubs_professionnels.map((club: any, i: number) => (
            <div key={i} className="group bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:border-red-500 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                  {club.division}
                </span>
                <Activity size={20} className="text-slate-200 group-hover:text-red-200 transition-colors" />
              </div>
              
              <h3 className="font-black text-2xl text-slate-900 leading-tight mb-1">{club.nom}</h3>
              <p className="text-sm font-bold text-red-600 uppercase tracking-widest mb-6">{club.sport}</p>

              <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-inner">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={14} className="text-slate-400" />
                  <span className="text-slate-600 font-medium">{club.stade}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-50">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} className="text-slate-400" />
                    <span className="text-slate-400 font-bold uppercase">Depuis {club.fondation}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy size={12} className="text-yellow-500" />
                    <span className="font-black text-slate-900">{club.titres} Titres</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2 : AUTRES CLUBS (TABLEAU STYLE INDEX) */}
      <section className="mb-20 bg-slate-900 p-8 rounded-[2rem] text-white">
        <div className="flex items-center gap-4 mb-8">
          <Users size={32} className="text-red-500" />
          <h2 className="text-3xl font-black uppercase tracking-tight">Disciplines & Excellence</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.autres_clubs_et_disciplines.map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between border-b border-slate-800 py-3 hover:bg-slate-800 px-4 rounded-lg transition-colors">
              <div>
                <p className="font-bold text-white">{item.nom}</p>
                <p className="text-[10px] text-red-400 uppercase font-black tracking-widest">{item.sport}</p>
              </div>
              <p className="text-xs text-slate-400 italic max-w-[200px] text-right">
                {item.details || item.division || item.patinoire}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3 : OMNISPORTS */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <div className="h-1 w-12 bg-red-600"></div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800">Clubs Omnisports Historiques</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.omnisports.map((omni: any, i: number) => (
            <div key={i} className="border-2 border-slate-100 p-6 rounded-2xl hover:bg-red-50 transition-colors">
              <h3 className="text-3xl font-black text-red-600 mb-1">{omni.nom}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-4">{omni.nom_complet}</p>
              <div className="flex items-center justify-between font-mono text-xs">
                <span>{omni.sections} SECTIONS</span>
                <span className="text-slate-500 italic">{omni.principaux}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-20 pt-10 border-t border-slate-100 text-center">
        <p className="font-mono text-slate-400 text-[10px] uppercase tracking-widest">
          © {new Date().getFullYear()} Annuaire Sportif - Ville de Toulouse
        </p>
      </footer>
    </main>
  );
}
