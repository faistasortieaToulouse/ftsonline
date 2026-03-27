"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe, History, BookOpen, Users, Heart, Music, ShieldAlert, Info } from 'lucide-react';

export default function ExpulsionsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/expulsions')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => console.error("Erreur de fetch:", err));
  }, []);

  if (loading) return <div className="p-10 text-center font-bold animate-pulse text-slate-400">Chargement de l'histoire...</div>;
  if (!data) return <div className="p-10 text-center">Aucune donnée trouvée.</div>;

  const { migrations_forcees, themes, peuples_expulses } = data;
  const roms = migrations_forcees[0];

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation */}
        <Link href="/" className="inline-flex items-center gap-2 text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all mb-8 font-bold">
          <ArrowLeft size={20} /> Retour à l'Accueil
        </Link>

        {/* Header Principal */}
        <header className="mb-16">
          <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter mb-4">
            Diasporas & <span className="text-red-600">Migrations Forcées</span>
          </h1>
          <div className="bg-white p-6 rounded-2xl border-l-4 border-red-600 shadow-sm italic text-slate-600">
            <p className="text-lg leading-relaxed">"{themes.definition_diaspora}"</p>
            <p className="mt-4 text-sm font-medium text-slate-500 flex items-center gap-2">
              <Heart size={16} className="text-red-400"/> {themes.point_commun_psychologique}
            </p>
          </div>
        </header>

        {/* SECTION 1 : LE GRAND FOCUS (ROMS / GITANS) */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Users className="text-red-600" size={32} />
              <h2 className="text-3xl font-black uppercase tracking-tight">{roms.peuple}</h2>
            </div>
            <span className="bg-red-100 text-red-700 px-4 py-1 rounded-full text-xs font-bold uppercase">
              {roms.titre_theme}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLONNE GAUCHE : Identité & Légende */}
            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
                <h3 className="text-amber-400 font-bold uppercase text-xs tracking-widest mb-2">Origine & Trajet</h3>
                <p className="text-xl font-bold mb-2">{roms.origine}</p>
                <p className="text-xs text-slate-400 leading-relaxed italic">{roms.trajet}</p>
                
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <h3 className="text-amber-400 font-bold uppercase text-xs tracking-widest mb-2">L'erreur du nom "{roms.etymologie.terme}"</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{roms.etymologie.explication}</p>
                </div>
              </div>

              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 shadow-sm">
                <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-4 uppercase text-sm tracking-wider">
                  <BookOpen size={18}/> {roms.legendes[0].nom}
                </h3>
                <p className="text-xs text-amber-900 leading-relaxed mb-4 italic">"{roms.legendes[0].recit}"</p>
                <div className="space-y-2">
                  {roms.legendes[0].analyse_sociologique.map((item: string, i: number) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="text-amber-500 font-bold">•</span>
                      <p className="text-[10px] text-amber-800 font-medium">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* État Actuel / Chiffres */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-slate-900 font-bold uppercase text-xs mb-4 flex items-center gap-2">
                   <Info size={16} className="text-blue-500" /> Aujourd'hui
                </h3>
                <p className="text-sm font-bold text-slate-800 mb-2">{roms.etat_actuel.population}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{roms.etat_actuel.situation}</p>
              </div>
            </div>

            {/* COLONNE CENTRE & DROITE : Histoire & Musique */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Réalité Historique & Persécutions */}
              <div className="bg-red-50 border border-red-100 p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                  <ShieldAlert className="text-red-600"/> Réalité & Persécutions
                </h3>
                <p className="text-sm text-red-800 leading-relaxed mb-4">{roms.realite_historique.destin}</p>
                <div className="bg-white/50 p-4 rounded-xl italic text-red-900 font-medium border border-red-200">
                  "{roms.realite_historique.citation_cle}"
                </div>
              </div>

              {/* Les Causes du départ */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <History className="text-slate-400"/> Causes du départ (An 1000)
                </h3>
                <div className="grid gap-6">
                  {roms.contexte_depart_inde.raisons_principales.map((raison: any, i: number) => (
                    <div key={i} className="group border-b border-slate-100 last:border-0 pb-4">
                      <h4 className="font-black text-red-600 text-sm uppercase mb-1 group-hover:translate-x-1 transition-transform inline-block">
                        {raison.titre}
                      </h4>
                      <p className="text-sm text-slate-600 mb-1">{raison.description}</p>
                      <p className="text-[11px] text-slate-400 font-medium italic">
                        {raison.role_roms || raison.marginalisation || raison.consequence}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Héritage Musical */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Music className="text-amber-400"/> L'Héritage Musical & Transformations
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {roms.heritage_musical_et_transformations.map((h: any, i: number) => (
                    <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                      <p className="text-amber-400 text-[10px] font-black uppercase mb-1">{h.etape}</p>
                      <p className="font-bold text-sm mb-2">{h.lieu}</p>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        {h.influence || h.evolution || (h.evolutions && h.evolutions[0].style)}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-xs text-slate-400 border-t border-white/10 pt-4 italic">
                  Note : {roms.etat_actuel.influence}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2 : LA GRANDE LISTE DES AUTRES PEUPLES */}
        <section>
          <div className="flex items-center gap-3 mb-8 border-b border-slate-200 pb-4">
            <Globe className="text-slate-400" size={32} />
            <h2 className="text-3xl font-black uppercase text-slate-800 tracking-tight">Autres Destins à travers le monde</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {peuples_expulses.map((p: any) => (
              <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-black text-slate-900 tracking-tighter leading-none">{p.nom}</h3>
                    <span className="bg-slate-100 text-[9px] font-bold px-2 py-1 rounded text-slate-500">#{p.id}</span>
                  </div>
                  <p className="text-red-600 text-[10px] font-black uppercase tracking-widest mb-3">{p.titre_theme}</p>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {p.cause_exil || p.contexte || p.migration}
                  </p>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                    <p className="text-[11px] text-slate-500 italic">
                      {p.destin_historique || p.etat_actuel || p.culture || p.identite || p.impact}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {p.tags.map((tag: string, idx: number) => (
                    <span key={idx} className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded uppercase tracking-tighter">
                      {tag}
                    </span>
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
