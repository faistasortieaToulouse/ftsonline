"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Map, Users, Home, Info } from "lucide-react";

export default function SociologiePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sociologieville")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center font-mono">Chargement des données urbaines...</div>;
  if (!data || data.error) return <div className="p-10 text-center text-red-500 font-bold">Erreur : {data?.error || "Fichier manquant"}</div>;

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <nav className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold">
          <ArrowLeft size={20} /> Retour à l'Accueil
        </Link>
      </nav>

      <header className="mb-12 border-b-2 border-slate-200 pb-8">
        <h1 className="text-4xl font-black text-slate-900 mb-4">{data.titre}</h1>
        <p className="text-xl text-slate-600 max-w-3xl leading-relaxed">{data.description}</p>
      </header>

{/* SECTION 1 : LES ZONES GÉOGRAPHIQUES (Inclut le Centre, la Ville-Centre et la Banlieue) */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 border-l-4 border-blue-600 pl-4 uppercase tracking-tight">
          <Map className="text-blue-600" /> Analyse par Zones
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.zones?.map((zone: any, i: number) => (
            <div key={i} className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <h3 className="text-xl font-black mb-1 text-blue-800">{zone.nom}</h3>
              <p className="text-sm text-slate-500 italic mb-4">{zone.caracteristiques}</p>
              
              <div className="space-y-4 flex-grow">
                {/* 1. Cas Standard : Population Majoritaire / Profils */}
                {(zone.populations?.majoritaire || zone.populations?.profils) && (
                  <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-900 border border-blue-100">
                    <strong className="block text-xs uppercase opacity-70">Population Principale</strong>
                    {zone.populations.majoritaire || zone.populations.profils?.join(', ')}
                  </div>
                )}

                {/* 2. Cas Standard : Secondaires & Dynamique */}
                {zone.populations?.secondaires && (
                  <div>
                    <strong className="block text-[10px] uppercase text-slate-400 mb-2 tracking-widest">Populations Secondaires</strong>
                    <div className="flex flex-wrap gap-2">
                      {zone.populations.secondaires.map((sec: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 text-[11px] rounded font-medium border border-slate-200">
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {zone.populations?.dynamique_sociale && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-900 italic">
                    "{zone.populations.dynamique_sociale}"
                  </div>
                )}

                {/* 3. CAS PARTICULIER : Typologies de Banlieue (Petite et Grande Couronne) */}
                {zone.typologies && (
                  <div className="mt-2 space-y-3">
                    <strong className="block text-[10px] uppercase text-red-500 mb-2 tracking-widest">Fragmentation du territoire</strong>
                    {zone.typologies.map((t: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg border-l-2 border-slate-300">
                        <span className="font-bold text-slate-800 text-sm block">{t.type}</span>
                        {t.habitants && <p className="text-[11px] text-slate-500 mb-1">Habitants : {t.habitants.join(', ')}</p>}
                        <p className="text-xs text-slate-600 leading-tight">
                          {t.atouts || t.populaire || t.indicateurs}
                        </p>
                        {t.exemples && <p className="text-[10px] mt-1 text-blue-600 font-medium">Ex: {t.exemples.join(', ')}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

{/* SECTION 2 : STRUCTURE DES FOYERS */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 border-l-4 border-emerald-600 pl-4 uppercase tracking-tight">
          <Users className="text-emerald-600" /> Structure des Foyers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.structure_foyers?.map((foyer: any, i: number) => (
            <div key={i} className="flex gap-4 p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100 transition-all hover:bg-emerald-50">
              <div className="shrink-0 text-emerald-600 font-black text-2xl opacity-20">0{i+1}</div>
              <div className="flex-grow">
                <h3 className="font-black text-emerald-900 text-lg uppercase tracking-tighter mb-1">{foyer.type}</h3>
                <p className="text-xs font-bold text-emerald-700/70 mb-3 italic flex items-center gap-1">
                  <Map size={12} /> {foyer.localisation}
                </p>
                
                <div className="space-y-3">
                  {/* Affichage des Profils (Étudiants, Cadres, Classes moyennes, etc.) */}
                  {foyer.profils && (
                    <div className="flex flex-wrap gap-2">
                      {foyer.profils.map((profil: string, idx: number) => (
                        <span key={idx} className="bg-white/80 px-2 py-0.5 rounded text-[11px] font-semibold text-emerald-800 border border-emerald-200">
                          {profil}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Affichage des Moteurs (Logique de choix de vie) */}
                  <div className="text-sm text-slate-700 leading-relaxed bg-white/40 p-3 rounded-lg border border-emerald-50">
                    <span className="font-bold text-emerald-900 text-xs uppercase block mb-1">Moteurs de localisation :</span> 
                    {foyer.moteurs}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

{/* SECTION 3 : SYNTHÈSE DES CATÉGORIES ET DE L'HABITAT */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 border-l-4 border-purple-600 pl-4 uppercase tracking-tight">
          <Home className="text-purple-600" /> Synthèse Sociologique & Immobilière
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Tableau A : Catégories Sociales */}
          <div>
            <h3 className="text-sm font-black text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2">
              <Users size={16} /> Profils par Catégories
            </h3>
            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full text-left border-collapse bg-white">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Catégorie</th>
                    <th className="p-3">Lieu Privilégié</th>
                    <th className="p-3">Raison</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.synthese_categories?.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors text-sm">
                      <td className="p-3 font-bold text-blue-900">{item.categorie}</td>
                      <td className="p-3 text-slate-600 font-medium">{item.lieu}</td>
                      <td className="p-3 text-slate-500 italic text-xs leading-tight">{item.raison}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tableau B : Typologies d'Habitat */}
          <div>
            <h3 className="text-sm font-black text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2">
              <Home size={16} /> Logique de Foyer
            </h3>
            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full text-left border-collapse bg-white">
                <thead className="bg-slate-900 text-white text-[10px] uppercase font-bold">
                  <tr>
                    <th className="p-3">Foyer</th>
                    <th className="p-3">Zone Idéale</th>
                    <th className="p-3">Habitat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.synthese_habitat?.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-purple-50 transition-colors text-sm">
                      <td className="p-3 font-bold text-slate-700">{item.foyer}</td>
                      <td className="p-3 text-slate-600 font-medium">{item.zone}</td>
                      <td className="p-3 text-purple-700 font-mono font-bold text-xs">{item.habitat}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 4 : PHÉNOMÈNES PARTICULIERS */}
      <section className="bg-slate-900 text-slate-100 p-10 rounded-3xl shadow-2xl">
        <h2 className="text-3xl font-black mb-8 flex items-center gap-3 text-white uppercase tracking-tighter">
          <Info className="text-amber-400" /> Tendances 2026
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {Object.entries(data.phenomenes_particuliers || {}).map(([key, val]: any, i) => (
            <div key={i} className="space-y-4">
              <h3 className="text-amber-400 font-bold uppercase text-xs tracking-widest border-b border-slate-700 pb-2">
                {key.replace(/_/g, ' ')}
              </h3>
              <p className="text-slate-300 leading-relaxed italic">"{val}"</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
