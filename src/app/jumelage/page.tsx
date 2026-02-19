"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Globe, Plane, Handshake, MapPin } from "lucide-react";

export default function JumelagePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/jumelage')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse text-blue-600 font-bold">Connexion aux serveurs internationaux...</div>;
  if (!data) return <div className="p-20 text-center text-red-500 font-bold">Données indisponibles.</div>;

  const jumelages = data.relations_internationales?.jumelages || [];
  const accords = data.relations_internationales?.accords_cooperation || [];

  return (
    <main className="max-w-6xl mx-auto p-6 bg-white min-h-screen my-10 shadow-xl rounded-3xl border border-slate-100">
      
      {/* Retour */}
      <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:bg-blue-50 p-2 rounded-md transition-all mb-10">
        <ArrowLeft size={20} /> RETOUR AU RÉPERTOIRE
      </Link>

      {/* Header */}
      <header className="mb-16 relative overflow-hidden bg-slate-900 text-white p-12 rounded-3xl shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="text-blue-400 animate-spin-slow" size={32} />
            <span className="text-blue-400 font-mono tracking-widest uppercase text-sm">Diplomatie & Culture</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-4 uppercase">
            Toulouse <span className="text-blue-500">&</span> Le Monde
          </h1>
          <p className="text-slate-400 max-w-2xl text-lg">
            Depuis 1962, la Ville Rose tisse des liens à travers les continents pour favoriser les échanges culturels, économiques et humanitaires.
          </p>
        </div>
        {/* Décoration de fond */}
        <div className="absolute top-0 right-0 p-10 opacity-10">
           <Plane size={200} className="rotate-45" />
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-12">
        
        {/* Section Jumelages Officiels */}
        <section>
          <div className="flex items-center gap-3 mb-8 border-b-4 border-blue-600 pb-2">
            <Handshake className="text-blue-600" size={28} />
            <h2 className="text-2xl font-black uppercase text-slate-800">Jumelages Officiels</h2>
          </div>
          <div className="grid gap-4">
            {jumelages.map((v: any, i: number) => (
              <div key={i} className="group bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{v.ville}</h3>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                      <MapPin size={14} />
                      <span>{v.pays}</span>
                    </div>
                  </div>
                  <div className="bg-white px-3 py-1 rounded-full border border-slate-200 text-xs font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                    DEPUIS {v.annee}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section Accords de Coopération */}
        <section>
          <div className="flex items-center gap-3 mb-8 border-b-4 border-emerald-500 pb-2">
            <Globe className="text-emerald-500" size={28} />
            <h2 className="text-2xl font-black uppercase text-slate-800">Accords de Coopération</h2>
          </div>
          <div className="grid gap-4">
            {accords.map((v: any, i: number) => (
              <div key={i} className="group bg-emerald-50/30 p-5 rounded-2xl border border-emerald-100 hover:border-emerald-500 hover:shadow-md transition-all">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{v.ville}</h3>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                      <MapPin size={14} />
                      <span>{v.pays}</span>
                    </div>
                  </div>
                  <div className="bg-white px-3 py-1 rounded-full border border-emerald-100 text-xs font-black text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                    {v.annee}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      <footer className="mt-20 pt-10 border-t border-slate-100 text-center">
        <p className="text-slate-400 text-xs uppercase tracking-[0.2em]">
          Direction des Relations Internationales — Mairie de Toulouse
        </p>
      </footer>
    </main>
  );
}
