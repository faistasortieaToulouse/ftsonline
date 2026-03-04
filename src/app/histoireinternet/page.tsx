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
      
{/* SECTION: LES PIONNIERS (HALL OF FAME) */}
<section className="mb-32">
  <div className="flex items-center gap-4 mb-12">
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-200 to-transparent"></div>
    <h2 className="text-3xl font-serif font-black text-slate-800 text-center uppercase tracking-widest">
      Hall of Fame <br/><span className="text-amber-600 text-sm font-sans">Les architectes du premier Web</span>
    </h2>
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-200 to-transparent"></div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {data.pionniers_web.map((pionnier: any, i: number) => (
      <div key={i} className="bg-white p-6 rounded-2xl border-b-4 border-amber-400 shadow-xl hover:-translate-y-2 transition-transform">
        <div className="text-amber-500 mb-3"><MousePointer2 size={24} /></div>
        <span className="text-[10px] font-black text-slate-400">{pionnier.annee}</span>
        <h3 className="text-lg font-black text-slate-900 mb-2">{pionnier.nom || pionnier.site}</h3>
        <p className="text-xs text-slate-600 italic leading-relaxed">
          {pionnier.description || pionnier.categorie}
        </p>
      </div>
    ))}
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
      
{/* SECTION: SERVICES CLÉS (GRID) */}
<section className="mb-32">
  <h2 className="text-3xl font-serif font-black text-slate-900 mb-10 flex items-center gap-3">
    <Zap className="text-amber-500" /> Les Plateformes qui ont changé nos vies
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {data.sites_et_services_cles.map((service: any, i: number) => (
      <div key={i} className="relative p-6 bg-[#fffcf5] border border-amber-100 rounded-3xl shadow-sm">
        <div className="absolute -top-3 left-6 px-4 py-1 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase tracking-tighter">
          {service.periode.split(':')[0]}
        </div>
        <h4 className="mt-4 text-amber-900 font-serif font-bold text-lg mb-4 border-b border-amber-200 pb-2">
          {service.periode.split(':')[1]}
        </h4>
        <ul className="space-y-3">
          {service.sites.map((s: string, idx: number) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0"></span>
              {s}
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
</section>
      
{/* SECTION: DESIGN & ANATOMIE RETRO */}
<section className="mb-32 grid grid-cols-1 lg:grid-cols-2 gap-12">
  <div>
    <h2 className="text-3xl font-serif font-black text-slate-900 mb-8 flex items-center gap-3">
      <Monitor className="text-blue-500" /> L'esthétique du Web
    </h2>
    <div className="space-y-6">
      {data.evolution_structure_et_design.map((ere: any, i: number) => (
        <div key={i} className="group p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <h3 className="font-bold text-blue-600 mb-2">{ere.ere}</h3>
          <ul className="text-sm text-slate-600 space-y-2">
            {ere.points_cles.map((point: string, idx: number) => (
              <li key={idx} className="flex gap-2">
                <span className="text-blue-300">›</span> {point}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>

  <div className="bg-slate-200 p-1 rounded-t-xl shadow-2xl">
    {/* Simulateur de fenêtre de navigateur 1999 */}
    <div className="bg-slate-300 p-2 flex items-center gap-2 rounded-t-lg border-b border-slate-400">
      <div className="flex gap-1"><div className="w-3 h-3 bg-red-400 rounded-full"></div><div className="w-3 h-3 bg-yellow-400 rounded-full"></div><div className="w-3 h-3 bg-green-400 rounded-full"></div></div>
      <div className="bg-white px-4 py-0.5 rounded flex-1 text-[10px] text-slate-400 font-mono italic">http://www.mon-site-en-1999.com</div>
    </div>
    <div className="bg-[#c0c0c0] p-6 min-h-[400px] border-2 border-white border-r-slate-500 border-b-slate-500">
      <h3 className="text-blue-900 font-black mb-6 underline text-center">ANATOMIE D'UN SITE TYPIQUE (1999)</h3>
      <div className="grid grid-cols-1 gap-4">
        {data.anatomie_site_typique_1999.map((item: any, i: number) => (
          <div key={i} className="bg-white p-3 border-b-2 border-r-2 border-slate-800 flex justify-between items-center">
            <span className="font-mono text-xs font-bold uppercase">{item.element}</span>
            <span className="text-xs italic text-blue-700">{item.details}</span>
          </div>
        ))}
      </div>
      <div className="mt-10 flex justify-center">
        <div className="bg-black text-green-500 font-mono p-2 text-xl border-2 border-slate-400">
          0004328
        </div>
      </div>
      <p className="text-[10px] text-center mt-2 font-mono uppercase">Visiteurs depuis 1998</p>
    </div>
  </div>
</section>
      
{/* SECTION: LES PARADIGMES (WEB 1.0 -> 4.0) */}
<section className="mb-32">
  <h2 className="text-3xl font-serif font-black text-slate-900 mb-12 text-center">L'Évolution des Paradigmes</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {data.paradigmes.map((p: any, i: number) => (
      <div key={i} className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 text-slate-700 opacity-20 group-hover:scale-110 transition-transform">
          <Cpu size={100} />
        </div>
        <span className="text-blue-400 font-black text-xs">{p.version}</span>
        <h3 className="text-xl font-bold mb-4">{p.nom}</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{p.caracteristiques}</p>
      </div>
    ))}
  </div>
</section>
      
{/* SECTION: DOSSIERS SPÉCIAUX & IMPACT MÉTIERS */}
<section className="mb-32">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    
    {/* DOSSIERS SPÉCIAUX */}
    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.dossiers_speciaux.map((d: any, i: number) => (
        <div key={i} className="p-6 bg-amber-50 rounded-2xl border-2 border-dashed border-amber-200">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="text-amber-600" size={20} />
            <h3 className="font-black text-amber-900 uppercase text-sm">{d.sujet}</h3>
          </div>
          <p className="text-sm text-amber-800/80 leading-relaxed">{d.description}</p>
        </div>
      ))}
    </div>

    {/* IMPACT MÉTIERS */}
    <div className="bg-blue-900 text-white p-8 rounded-3xl shadow-2xl">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Smartphone /> Impact Métiers</h3>
      <div className="space-y-6">
        {data.impact_metiers.map((m: any, i: number) => (
          <div key={i} className="border-l-2 border-blue-400 pl-4">
            <h4 className="font-bold text-blue-300 text-sm">{m.domaine}</h4>
            <p className="text-xs text-slate-300 mt-1">{m.info}</p>
          </div>
        ))}
      </div>
    </div>

  </div>
</section>
      
{/* SECTION: TECHNOLOGIES CLÉS */}
<section className="mb-32">
  <div className="text-center mb-12">
    <h2 className="text-3xl font-serif font-black text-slate-900 uppercase tracking-tighter">
      Le Moteur de l'Innovation
    </h2>
    <p className="text-slate-500 italic">Les piliers techniques qui ont transformé notre réalité numérique</p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    {data.technologies_cles.map((tech: any, i: number) => (
      <div key={i} className="relative group p-8 bg-white rounded-3xl border border-slate-100 shadow-xl hover:border-blue-500 transition-all duration-300">
        {/* Icône décorative en arrière-plan */}
        <div className="absolute top-4 right-4 text-slate-50 opacity-10 group-hover:opacity-20 transition-opacity">
          <Cpu size={80} />
        </div>
        
        <div className="flex flex-col h-full">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
            {tech.nom.includes('HTML') ? <Monitor size={24} /> : tech.nom.includes('IA') ? <Sparkles size={24} /> : <Zap size={24} />}
          </div>
          
          <h3 className="text-xl font-black text-slate-900 mb-4">{tech.nom}</h3>
          
          <p className="text-sm text-slate-600 leading-relaxed flex-grow">
            {tech.role}
          </p>
          
          <div className="mt-6 pt-4 border-t border-slate-50 text-[10px] font-black text-blue-500 uppercase tracking-widest">
            Infrastructure Core
          </div>
        </div>
      </div>
    ))}
  </div>
</section>
      
{/* SECTION: ANECDOTES RAPIDES */}
<section className="mb-20 grid grid-cols-1 md:grid-cols-2 gap-6">
  {data.anecdotes.map((a: any, i: number) => (
    <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 italic text-slate-600 text-sm shadow-sm">
      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
      <span className="font-bold text-slate-900 not-italic uppercase text-[10px] w-24">{a.sujet} :</span>
      "{a.info}"
    </div>
  ))}
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
    {/* COLONNE GAUCHE : DATES CLÉS FRANCE */}
    <div className="space-y-6">
      <h3 className="text-xl font-serif font-bold text-rose-800 mb-4 flex items-center gap-2">
        <History size={20} /> Chronologie Nationale
      </h3>
      {data.histoire_france_web.dates_cles_France.map((item: any, i: number) => (
        <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-rose-400">
          <h3 className="font-black text-rose-900 mb-2 tracking-tight">{item.phase}</h3>
          <ul className="text-sm text-slate-600 space-y-1">
            {item.evenements.map((ev: string, idx: number) => (
              <li key={idx} className="flex gap-2">
                <span className="text-rose-300">•</span> {ev}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    {/* COLONNE DROITE : SAVIEZ-VOUS + TABLEAU COMPARATIF */}
    <div className="space-y-8">
      {/* BLOC ANECDOTES */}
      <div className="bg-rose-900 text-white p-6 rounded-3xl shadow-xl">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Info size={18}/> Le saviez-vous ?</h3>
        <div className="space-y-4">
          {data.histoire_france_web.anecdotes_France.slice(0, 5).map((anc: any, i: number) => (
            <div key={i} className="border-b border-rose-800 pb-2 last:border-0">
              <span className="text-rose-300 font-bold text-[10px] uppercase tracking-wider">{anc.sujet}</span>
              <p className="text-sm italic leading-snug">{anc.info}</p>
            </div>
          ))}
        </div>
      </div>

      {/* BLOC TABLEAU COMPARATIF MINITEL VS INTERNET */}
      <div className="bg-white p-6 rounded-3xl border border-rose-200 shadow-sm">
        <h3 className="text-rose-900 font-black text-sm uppercase mb-4 text-center tracking-widest">Minitel vs Internet</h3>
        <div className="overflow-hidden rounded-xl border border-rose-100">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-rose-50 text-rose-900">
                <th className="p-3 text-left">Critère</th>
                <th className="p-3 text-center">Minitel</th>
                <th className="p-3 text-center">Web</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {data.histoire_france_web.tableau_comparatif.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-rose-50/30">
                  <td className="p-3 font-bold text-slate-700">{row.caracteristique}</td>
                  <td className="p-3 text-center text-slate-500">{row.minitel}</td>
                  <td className="p-3 text-center font-bold text-rose-600">{row.internet}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* SECTION 5: MESSAGERIE & CHAT */}
      <section className="mb-32">
        <h2 className="text-3xl font-serif font-black text-blue-900 mb-10 flex items-center gap-3">
          <MessageSquare className="text-blue-500" /> Allô ? Uh-oh ! Messagerie & Chat
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
