"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { 
  ArrowLeft, Globe, History, Sparkles, BookOpen, Quote, 
  Cpu, Zap, Wifi, MousePointer2, Smartphone, Monitor, 
  MessageSquare, ShoppingCart, Landmark, Info
} from "lucide-react";

export default function HistoireInternetCompletePage() {
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
        console.error("Erreur:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fffcf5]">
      <div className="animate-spin mb-4 text-blue-600"><History size={40} /></div>
      <div className="font-serif italic text-blue-800">Chargement de la grande archive du Web...</div>
    </div>
  );

  if (!data) return <div className="p-20 text-center text-red-600 font-bold">Erreur de chargement.</div>;

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-10 bg-[#fffcf5] min-h-screen my-5 md:my-10 shadow-2xl rounded-3xl border border-blue-100">
      
      {/* NAVIGATION */}
      <Link href="/" className="group inline-flex items-center gap-2 text-blue-900 font-bold hover:text-blue-600 transition-colors mb-12">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour à l'Accueil
      </Link>

      {/* HEADER */}
      <header className="text-center mb-20">
        <div className="flex justify-center mb-6 text-blue-500 opacity-80">
          <Globe size={64} strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-black text-slate-900 mb-6 tracking-tighter uppercase">
          {data.titre}
        </h1>
        <div className="max-w-3xl mx-auto p-6 bg-white/50 rounded-2xl border-l-4 border-blue-500 italic text-slate-700 text-lg leading-relaxed shadow-sm">
          « {data.introduction} »
        </div>
      </header>

      {/* SECTION 1: CHRONOLOGIE DÉTAILLÉE (TIMELINE) */}
      <section className="mb-32">
        <h2 className="text-3xl font-serif font-black text-blue-900 mb-12 flex items-center gap-3">
          <History className="text-blue-500" /> Chronologie de l'Éveil
        </h2>
        <div className="relative">
          <div className="absolute left-6 md:left-1/2 h-full w-px bg-blue-200 transform md:-translate-x-1/2"></div>
          <div className="space-y-16">
            {data.chronologie_detaillee.map((item: any, i: number) => (
              <div key={i} className={`relative flex flex-col md:flex-row items-center ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="absolute left-6 md:left-1/2 w-8 h-8 bg-blue-600 rounded-full border-4 border-white transform -translate-x-1/2 z-10 shadow-md"></div>
                <div className="w-full md:w-[45%] ml-16 md:ml-0">
                  <div className="p-6 bg-white rounded-2xl shadow-lg border border-blue-50 hover:border-blue-300 transition-all">
                    <span className="text-blue-600 font-black text-sm uppercase tracking-widest">{item.periode}</span>
                    <h3 className="text-xl font-bold text-slate-800 mt-1 mb-3">{item.titre}</h3>
                    <ul className="space-y-2">
                      {item.evenements.map((ev: string, idx: number) => (
                        <li key={idx} className="text-sm text-slate-600 flex gap-2">
                          <span className="text-blue-400">•</span> {ev}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: COMPARATIF 1991 vs 1999 (TABLEAU) */}
      <section className="mb-32 bg-slate-900 rounded-3xl p-8 text-white shadow-2xl">
        <h2 className="text-2xl font-serif font-bold mb-8 text-blue-300 flex items-center gap-3">
          <Monitor /> Le bond technologique
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700 text-blue-200 uppercase text-xs tracking-widest">
                <th className="py-4 px-2">Caractéristique</th>
                <th className="py-4 px-2">1991</th>
                <th className="py-4 px-2">1999</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data.comparatif_1991_1999.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-2 font-bold">{row.caracteristique}</td>
                  <td className="py-4 px-2 text-slate-400 font-mono">{row['1991']}</td>
                  <td className="py-4 px-2 text-blue-400 font-mono font-bold">{row['1999']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 3: SITES IMPORTANTS (LA LISTE POPULAR MECHANICS) */}
      <section className="mb-32">
        <h2 className="text-3xl font-serif font-black text-blue-900 mb-12 flex items-center gap-3">
          <Sparkles className="text-amber-500" /> Les 50 Sites qui ont fait le Web
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.sites_importants_popular_mechanics.map((site: any) => (
            <div key={site.id} className="p-5 bg-white rounded-xl border border-slate-200 hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-black text-blue-500">#{site.id}</span>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] rounded font-bold">{site.annee}</span>
              </div>
              <h4 className="text-lg font-black text-slate-800 group-hover:text-blue-600 transition-colors">{site.nom}</h4>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">{site.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: L'EXCEPTION FRANÇAISE (STYLE ARCHIVE) */}
      <section className="mb-32 p-8 bg-rose-50/50 rounded-3xl border-2 border-rose-100">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-rose-500 rounded-xl text-white shadow-lg">
            <Landmark size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-serif font-black text-rose-900">{data.histoire_france_web.titre}</h2>
            <p className="text-rose-700/70 italic uppercase text-xs tracking-widest font-bold">Le Minitel face au Géant Web</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            {data.histoire_france_web.dates_cles_France.map((item: any, i: number) => (
              <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-rose-400">
                <h3 className="font-black text-rose-900 mb-2">{item.phase}</h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  {item.evenements.map((ev: string, idx: number) => <li key={idx}>• {ev}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="space-y-6">
             <div className="bg-rose-900 text-white p-6 rounded-2xl shadow-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Info size={18}/> Le saviez-vous ?</h3>
                <div className="space-y-4">
                  {data.histoire_france_web.anecdotes_France.slice(0, 4).map((anc: any, i: number) => (
                    <div key={i} className="border-b border-rose-800 pb-2 last:border-0">
                      <span className="text-rose-300 font-bold text-xs uppercase">{anc.sujet}</span>
                      <p className="text-sm italic">{anc.info}</p>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: MESSAGERIE & CHAT */}
      <section className="mb-32">
        <h2 className="text-3xl font-serif font-black text-blue-900 mb-10 flex items-center gap-3">
          <MessageSquare className="text-blue-500" /> Allô ? Uh-oh !
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {data.messagerie.map((msg: any, i: number) => (
            <div key={i} className="p-4 bg-white rounded-2xl border border-blue-100 text-center hover:scale-105 transition-transform shadow-sm">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                {msg.type === 'Email' ? <Monitor size={20} /> : <MessageSquare size={20} />}
              </div>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">{msg.annee}</span>
              <h5 className="font-bold text-slate-800 block">{msg.nom}</h5>
              <p className="text-[11px] text-slate-500 mt-1 leading-tight">{msg.details}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER & CONCLUSION */}
      <footer className="mt-40 pt-16 border-t-2 border-dashed border-blue-200 text-center pb-20">
        <div className="flex justify-center gap-6 text-blue-300 mb-8">
          <BookOpen size={24} />
          <Quote size={24} />
          <Zap size={24} />
        </div>
        <p className="font-serif italic text-slate-600 max-w-3xl mx-auto leading-relaxed text-lg px-6">
          {data.conclusion}
        </p>
        <div className="mt-10 text-[10px] text-slate-400 uppercase tracking-[0.5em]">
          Patrimoine Digital — Archive 2026
        </div>
      </footer>
    </main>
  );
}
