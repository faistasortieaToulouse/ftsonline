"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Radio, TowerControl, Info, History, Wifi } from "lucide-react";

export default function FrequenceRadioPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/frequenceradio')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse font-bold text-blue-600 uppercase tracking-widest">Recherche des ondes FM...</div>;

  return (
    <main className="max-w-7xl mx-auto p-6 bg-slate-50 min-h-screen my-10 shadow-2xl rounded-3xl border border-slate-200">
      
      {/* Navigation */}
      <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-black hover:bg-blue-50 p-2 rounded-md transition-all mb-10">
        <ArrowLeft size={20} /> RETOUR
      </Link>

      {/* Header style "Tuner" */}
      <header className="bg-slate-900 text-white p-10 rounded-3xl mb-12 shadow-inner border-b-4 border-blue-500">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase mb-2">Bande FM : {data.ville}</h1>
            <div className="flex items-center gap-2 text-blue-400 font-mono text-sm">
              <TowerControl size={18} />
              <span>ÉMETTEUR PRINCIPAL : {data.emetteur_actuel}</span>
            </div>
          </div>
          <div className="hidden md:block">
             <div className="flex gap-1 items-end h-12">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="w-1 bg-blue-500 animate-bounce" style={{ height: `${Math.random() * 100}%`, animationDuration: `${0.5 + Math.random()}s` }}></div>
                ))}
             </div>
          </div>
        </div>
      </header>

      {/* Liste des Fréquences */}
      <section className="mb-20">
        <div className="flex items-center gap-4 mb-8">
          <Radio size={32} className="text-blue-600" />
          <h2 className="text-3xl font-black uppercase text-slate-800">Fréquences en direct</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.frequences.map((radio: any, i: number) => (
            <div key={i} className="group flex items-center bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-500 transition-all shadow-sm">
              {/* Le cadran de la fréquence */}
              <div className="bg-slate-900 text-blue-400 w-24 h-16 flex items-center justify-center rounded-xl font-mono text-xl font-bold shadow-inner border border-slate-700">
                {radio.frequence}
              </div>
              
              <div className="ml-4 flex-1">
                <h3 className="font-black text-slate-900 leading-tight truncate w-48">{radio.nom}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    radio.type === 'Public' ? 'bg-red-100 text-red-600' : 
                    radio.type === 'Associatif' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {radio.type}
                  </span>
                  <p className="text-[10px] text-slate-400 truncate italic">{radio.details}</p>
                </div>
              </div>
              
              <Wifi size={16} className="text-slate-200 group-hover:text-blue-500 transition-colors" />
            </div>
          ))}
        </div>
      </section>

      {/* Archives et Sites démantelés */}
      <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <History size={32} className="text-slate-400" />
          <h2 className="text-3xl font-black uppercase text-slate-800 tracking-tighter">Mémoire des Ondes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Radios disparues */}
          <div>
            <h4 className="text-sm font-black text-blue-600 uppercase mb-4 border-b pb-2">Anciennes Stations</h4>
            <div className="space-y-4">
              {data.archives.filter((a: any) => a.nom).map((arch: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-700">{arch.nom} ({arch.frequence})</span>
                  <span className="text-slate-400 italic text-xs">{arch.statut}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sites démantelés */}
          <div>
            <h4 className="text-sm font-black text-red-600 uppercase mb-4 border-b pb-2">Anciens Sites d'émission</h4>
            <div className="space-y-4">
              {data.archives.filter((a: any) => a.site).map((site: any, i: number) => (
                <div key={i} className="flex flex-col border-l-2 border-slate-100 pl-4">
                  <span className="font-bold text-slate-700">Site {site.site}</span>
                  <span className="text-xs text-slate-400">{site.motif || `Opérateur : ${site.operateur}`}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-20 pt-10 border-t border-slate-200 text-center">
        <p className="font-mono text-slate-400 text-[10px] uppercase tracking-widest">
          © {new Date().getFullYear()} Scan Radio FM - Coordination Technique de Toulouse
        </p>
      </footer>
    </main>
  );
}
