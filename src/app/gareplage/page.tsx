"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, TrainFront, Waves, MapPin, Info, Navigation, Footprints } from "lucide-react";

export default function GarePlagePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gareplage')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="p-20 text-center animate-pulse font-bold text-cyan-600 uppercase tracking-widest">
      Calcul de l'itinéraire vers la grande bleue...
    </div>
  );

  return (
    <main className="max-w-7xl mx-auto p-6 bg-slate-50 min-h-screen my-10 shadow-2xl rounded-3xl border border-slate-200">
      
      <Link href="/" className="inline-flex items-center gap-2 text-cyan-600 font-black hover:bg-cyan-50 p-2 rounded-md transition-all mb-10">
        <ArrowLeft size={20} /> Retour à l'Accueil
      </Link>

      <header className="bg-slate-900 text-white p-10 rounded-3xl mb-12 shadow-inner border-b-4 border-cyan-500">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase mb-2">
              {data.titre}
            </h1>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm">
              <Navigation size={18} />
              <span>DESTINATION : LITTORAL OCCITAN</span>
            </div>
          </div>
          <div className="hidden md:block">
             <div className="flex gap-1 items-end h-12">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-1 bg-cyan-400 animate-pulse" style={{ height: `${20 + Math.random() * 80}%`, animationDuration: `${1 + Math.random()}s` }}></div>
                ))}
             </div>
          </div>
        </div>
      </header>

      <section className="mb-20">
        <div className="flex items-center gap-4 mb-8">
          <Waves size={32} className="text-cyan-600" />
          <h2 className="text-3xl font-black uppercase text-slate-800">Gares Pieds dans l'eau</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.gares.map((gare: any, i: number) => (
            <div key={i} className="group flex flex-col bg-white rounded-2xl border border-slate-200 hover:border-cyan-500 transition-all shadow-sm overflow-hidden">
              
              {/* Badge Distance */}
              <div className="bg-slate-900 p-4 flex justify-between items-center">
                <div className="flex items-center gap-2 text-cyan-400">
                  <TrainFront size={20} />
                  <span className="font-mono font-bold text-lg">{gare.nom}</span>
                </div>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded border border-cyan-500/30 uppercase font-bold">
                  {gare.departement}
                </span>
              </div>

              <div className="p-6 flex-1">
                <div className="flex items-center gap-2 text-slate-800 font-bold mb-3">
                  <Footprints size={18} className="text-cyan-600" />
                  <span>{gare.distance}</span>
                </div>
                
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {gare.description}
                </p>

                <div className="bg-slate-50 p-3 rounded-xl border-l-4 border-cyan-500 flex gap-3">
                  <Info size={16} className="text-cyan-600 shrink-0 mt-0.5" />
                  <p className="text-xs italic text-slate-500">{gare.plus}</p>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${gare.type === 'Direct' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Accès : {gare.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-20 pt-10 border-t border-slate-200 text-center">
        <p className="font-mono text-slate-400 text-[10px] uppercase tracking-widest">
          © {new Date().getFullYear()} Rail & Mer - Guide des mobilités douces Toulouse-Méditerranée
        </p>
      </footer>
    </main>
  );
}
