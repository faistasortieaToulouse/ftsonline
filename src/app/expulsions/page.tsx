"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe, History, BookOpen, Users, Heart } from 'lucide-react';

export default function ExpulsionsPage() {
  // 1. On crée un état pour stocker les données de l'API
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 2. On appelle l'API au chargement de la page
  useEffect(() => {
    fetch('/api/expulsions')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => console.error("Erreur de fetch:", err));
  }, []);

  // 3. Affichage pendant le chargement
  if (loading) return <div className="p-10 text-center font-bold">Chargement de l'histoire...</div>;
  if (!data) return <div className="p-10 text-center">Aucune donnée trouvée.</div>;

  const { migrations_forcees, themes, peuples_expulses } = data;

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation */}
        <Link href="/" className="inline-flex items-center gap-2 text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all mb-8 font-bold">
          <ArrowLeft size={20} /> Retour à l'Accueil
        </Link>

        {/* Header */}
        <header className="mb-16">
          <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter mb-4">
            Diasporas & <span className="text-red-600">Migrations Forcées</span>
          </h1>
          <div className="bg-white p-6 rounded-2xl border-l-4 border-red-600 shadow-sm italic text-slate-600">
            <p className="text-lg">"{themes.definition_diaspora}"</p>
            <p className="mt-4 text-sm font-medium text-slate-500 flex items-center gap-2">
              <Heart size={16} className="text-red-400"/> {themes.point_commun_psychologique}
            </p>
          </div>
        </header>

        {/* SECTION 1 : FOCUS DÉTAILLÉ (ROMS) */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <Users className="text-red-600" size={32} />
            <h2 className="text-3xl font-black uppercase text-slate-800">Focus : {migrations_forcees[0].peuple}</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
                <h3 className="text-amber-400 font-bold uppercase text-xs tracking-widest mb-2">Origine</h3>
                <p className="text-xl font-bold">{migrations_forcees[0].origine}</p>
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <h3 className="text-amber-400 font-bold uppercase text-xs tracking-widest mb-2">L'erreur du nom "{migrations_forcees[0].etymologie.terme}"</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{migrations_forcees[0].etymologie.explication}</p>
                </div>
              </div>

              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-4"><BookOpen size={18}/> La Légende</h3>
                <p className="text-sm text-amber-900 font-bold mb-2">{migrations_forcees[0].legendes[0].nom}</p>
                <p className="text-xs text-amber-800 leading-relaxed">{migrations_forcees[0].legendes[0].recit}</p>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
               <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><History className="text-red-500"/> Les causes du départ (An 1000)</h3>
                  <div className="grid gap-6">
                    {migrations_forcees[0].contexte_depart_inde.raisons_principales.map((raison: any, i: number) => (
                      <div key={i} className="border-b border-slate-100 last:border-0 pb-4">
                        <h4 className="font-black text-red-600 text-sm uppercase mb-1">{raison.titre}</h4>
                        <p className="text-sm text-slate-700">{raison.description}</p>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* SECTION 2 : AUTRES PEUPLES */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Globe className="text-red-600" size={32} />
            <h2 className="text-3xl font-black uppercase text-slate-800">Autres Destins</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {peuples_expulses.map((p: any) => (
              <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-black text-slate-900">{p.nom}</h3>
                <p className="text-red-600 text-xs font-bold uppercase mb-3 italic">{p.titre_theme}</p>
                <p className="text-sm text-slate-600 mb-4">{p.cause_exil || p.trajet}</p>
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((tag: string, idx: number) => (
                    <span key={idx} className="text-[9px] font-black bg-slate-800 text-white px-2 py-0.5 rounded uppercase">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
