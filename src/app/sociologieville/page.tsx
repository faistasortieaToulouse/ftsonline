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

  if (loading) return <div className="p-10 text-center font-mono">Analyse des données urbaines...</div>;
  if (!data || data.error) return <div className="p-10 text-center text-red-500 font-bold">Erreur : {data?.error || "Fichier manquant"}</div>;

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <nav className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold">
          <ArrowLeft size={20} /> Retour Accueil
        </Link>
      </nav>

      <header className="mb-12 border-b-2 border-slate-200 pb-8">
        <h1 className="text-4xl font-black text-slate-900 mb-4">{data.titre}</h1>
        <p className="text-xl text-slate-600 max-w-3xl leading-relaxed">{data.description}</p>
      </header>

      {/* SECTION 1 : LES ZONES GÉOGRAPHIQUES */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 border-l-4 border-blue-600 pl-4 uppercase tracking-tight">
          <Map className="text-blue-600" /> Analyse par Zones
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.zones?.map((zone: any, i: number) => (
            <div key={i} className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-black mb-3 text-blue-800">{zone.nom}</h3>
              <p className="text-sm text-slate-500 italic mb-4">{zone.caracteristiques}</p>
              
              {zone.populations && (
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-900">
                    <strong>Majoritaire :</strong> {zone.populations.majoritaire || zone.populations.profils?.join(', ')}
                  </div>
                  {zone.typologies && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                      {zone.typologies.map((t: any, idx: number) => (
                        <div key={idx} className="text-sm">
                          <span className="font-bold text-slate-700 underline block mb-1">{t.type}</span>
                          <p className="text-slate-600">{t.atouts || t.populaire}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
            <div key={i} className="flex gap-4 p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100">
              <div className="shrink-0 text-emerald-600 font-black text-2xl opacity-20">0{i+1}</div>
              <div>
                <h3 className="font-black text-emerald-900 text-lg uppercase tracking-tighter">{foyer.type}</h3>
                <p className="text-sm font-bold text-slate-500 mb-2 italic">{foyer.localisation}</p>
                <p className="text-sm text-slate-700 leading-relaxed"><span className="font-bold">Moteurs :</span> {foyer.moteurs}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3 : SYNTHÈSE (TABLEAU) */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 border-l-4 border-purple-600 pl-4 uppercase tracking-tight">
          <Home className="text-purple-600" /> Synthèse Habitat / Zone
        </h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 text-white text-sm uppercase">
              <tr>
                <th className="p-4">Type de Foyer</th>
                <th className="p-4">Zone Idéale</th>
                <th className="p-4">Type d'Habitat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.synthese_habitat?.map((item: any, i: number) => (
                <tr key={i} className="hover:bg-purple-50 transition-colors">
                  <td className="p-4 font-bold text-slate-700">{item.foyer}</td>
                  <td className="p-4 text-slate-600">{item.zone}</td>
                  <td className="p-4 text-purple-700 font-mono text-sm">{item.habitat}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
