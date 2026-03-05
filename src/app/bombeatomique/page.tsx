"use client";

import React, { useEffect, useState } from 'react';
import { 
  Atom, 
  Radiation, 
  Skull, 
  Zap, 
  Microscope, 
  ShieldCheck, 
  Globe, 
  AlertTriangle,
  Loader2,
  Database,
  ArrowLeft
} from 'lucide-react';

export default function BombeAtomiquePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/bombeatomique')
      .then(res => res.json())
      .then(json => setData(json));
  }, []);

  if (!data) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-emerald-500 font-mono">
      <Radiation className="animate-spin mb-4" size={48} />
      <p className="animate-pulse tracking-[0.3em]">CHARGEMENT DU PROTOCOLE TRINITY...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-emerald-500/30">
      
      <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline mb-6 transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour à l'accueil
      </Link>
            
      {/* HERO SECTION */}
      <header className="relative py-24 px-6 border-b border-emerald-900/30 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-emerald-500/50 text-emerald-500 text-xs font-black tracking-widest uppercase mb-8 bg-emerald-950/30">
            <Atom size={14} /> Classification : Top Secret / Manhattan Level
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 uppercase">
            {data.titre}
          </h1>
          <p className="text-xl text-slate-400 font-serif italic max-w-3xl mx-auto leading-relaxed">
            {data.introduction}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20 space-y-32">

        {/* CHRONOLOGIE ET ÉCHEC NAZI */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <h2 className="text-2xl font-black text-emerald-500 flex items-center gap-3 uppercase tracking-wider">
              <Microscope /> Genèse Scientifique
            </h2>
            <div className="space-y-4">
              {data.chronologie_scientifique?.map((step: string, i: number) => (
                <div key={i} className="p-4 bg-slate-900/50 border-l-4 border-emerald-600 rounded-r-xl text-sm">
                  <span className="text-emerald-400 font-bold block mb-1">{step.split(':')[0]}</span>
                  {step.split(':')[1]}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8 bg-red-950/10 border border-red-900/20 p-8 rounded-3xl">
            <h2 className="text-2xl font-black text-red-500 flex items-center gap-3 uppercase tracking-wider">
              <AlertTriangle /> L'Échec de l'Uranprojekt
            </h2>
            <ul className="space-y-6">
              {data.echec_nazi_uranprojekt?.map((item: string, i: number) => (
                <li key={i} className="flex gap-4 text-sm leading-relaxed">
                  <span className="text-red-600 font-bold">0{i+1}</span>
                  <div>
                    <strong className="text-slate-100 block uppercase text-xs">{item.split(':')[0]}</strong>
                    <span className="text-slate-400">{item.split(':')[1]}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        

        {/* PROJET MANHATTAN VS V2 */}
        <section className="bg-emerald-950/10 border border-emerald-900/30 rounded-[3rem] p-8 md:p-12">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-black text-white mb-8 uppercase italic underline decoration-emerald-500 underline-offset-8">Manhattan Project (USA)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.projet_manhattan_usa?.map((item: string, i: number) => (
                  <div key={i} className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs leading-relaxed">
                    <Zap className="text-emerald-500 mb-2" size={16} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-slate-500 mb-8 uppercase italic">Le Rendez-vous manqué (V2)</h2>
              {data.le_rendez_vous_manque_v2_atome?.map((item: string, i: number) => (
                <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-800 group hover:bg-slate-900/40 transition-colors">
                  <span className="text-2xl font-black text-slate-800 group-hover:text-emerald-900 tracking-tighter italic">V2-A</span>
                  <p className="text-sm text-slate-400 italic">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ÉTAT DES LIEUX MONDIAL 2026 */}
        <section>
          <div className="flex flex-col items-center mb-12">
            <Globe className="text-emerald-500 mb-4 animate-pulse" size={40} />
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Échiquier Nucléaire 2026</h2>
          </div>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {data.etat_des_lieux_mondial_2026?.map((item: string, i: number) => (
              <div key={i} className="break-inside-avoid p-6 bg-slate-900/40 border border-slate-800 rounded-2xl hover:border-emerald-500 transition-all group">
                <div className="text-emerald-500 font-black text-xs uppercase mb-3 flex items-center justify-between">
                  <span>{item.split(':')[0]}</span>
                  <ShieldCheck size={14} className="opacity-0 group-hover:opacity-100" />
                </div>
                <p className="text-sm text-slate-400 font-serif leading-relaxed">
                  {item.split(':')[1]}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* MÉTHODES DE BLOCAGE & CYBER */}
        <footer className="relative bg-black rounded-[4rem] p-12 border border-emerald-900/50 overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.1)]">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Database size={200} />
          </div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-black text-emerald-500 uppercase mb-6 tracking-widest flex items-center gap-2">
                <Skull size={24} /> Guerre de l'ombre
              </h3>
              <div className="space-y-4">
                {data.methodes_de_blocage_modernes?.map((m: string, i: number) => (
                  <div key={i} className="flex gap-3 text-sm border-l-2 border-emerald-900 pl-4 py-1">
                    <span className="text-emerald-600 font-bold">»</span> {m}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-emerald-900/10 p-8 rounded-[2rem] border border-emerald-500/20 italic font-serif text-lg text-emerald-200">
              "{data.conclusion_anecdotique}"
            </div>
          </div>
        </footer>

      </main>

      <div className="text-center py-10 text-[10px] text-slate-600 font-mono uppercase tracking-[1em]">
        Atomic-Clock-Sync: OK | Radiation-Level: Normal | End-Of-File
      </div>
    </div>
  );
}
