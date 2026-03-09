"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, Map, Euro, Users, Info } from "lucide-react";

export default function BanlieueToulousePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/banlieuetoulouse")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center font-mono">Classement en cours...</div>;
  if (!data || data.error) return <div className="p-10 text-center text-red-500">Erreur : {data?.error}</div>;

  // Conversion de l'objet JSON en tableau pour faciliter le map
  const rankings = Object.entries(data).map(([key, value]: [string, any]) => ({
    id: key,
    num: parseInt(key.replace("rang_", "")),
    ...value
  })).sort((a, b) => a.num - b.num);

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <nav className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold">
          <ArrowLeft size={20} /> Retour Accueil
        </Link>
      </nav>

      <header className="mb-12 text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-4 flex justify-center items-center gap-3">
          <Trophy className="text-yellow-500" size={40} /> 
          Top 50 des Communes Riches
        </h1>
        <p className="text-slate-500 uppercase tracking-widest text-sm font-bold">Périphérie Toulousaine • Analyse 2026</p>
      </header>

      {/* TOP 5 - MISE EN AVANT SPECIALE */}
      <section className="mb-12 grid grid-cols-1 md:grid-cols-5 gap-4">
        {rankings.slice(0, 5).map((item) => (
          <div key={item.id} className="bg-indigo-900 text-white p-6 rounded-2xl shadow-xl border-t-4 border-yellow-400 relative overflow-hidden">
            <span className="absolute -right-2 -top-2 text-6xl font-black opacity-10">#{item.num}</span>
            <p className="text-xs uppercase text-indigo-300 font-bold mb-1">Rang {item.num}</p>
            <h3 className="text-xl font-black leading-tight mb-2">{item.commune}</h3>
            <div className="flex items-center gap-2 text-yellow-400 font-mono font-bold mb-2">
              <Euro size={14} /> {item.revenu} €
            </div>
            <p className="text-[10px] bg-indigo-800 p-2 rounded italic leading-tight">{item.note}</p>
          </div>
        ))}
      </section>

      {/* RANG 6 À 50 - LISTE DÉTAILLÉE */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold flex items-center gap-2 text-slate-700">
            <Map size={18} /> Secteurs & Profils Sociologiques
          </h2>
          <span className="text-xs font-mono text-slate-400">45 communes restantes</span>
        </div>
        
        <div className="divide-y divide-slate-100">
          {rankings.slice(5).map((item) => (
            <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-4 md:w-1/4">
                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 shrink-0">
                  {item.num}
                </span>
                <span className="font-bold text-slate-800">{item.commune}</span>
              </div>
              
              <div className="md:w-1/4">
                <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase rounded-full">
                  {item.secteur}
                </span>
              </div>
              
              <div className="md:w-2/4 flex items-start gap-2">
                <Users size={14} className="text-slate-400 mt-1 shrink-0" />
                <p className="text-sm text-slate-600 leading-snug">{item.profil}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-12 p-6 bg-slate-100 rounded-2xl flex items-center gap-4">
        <Info className="text-indigo-600 shrink-0" />
        <p className="text-xs text-slate-500 leading-relaxed">
          Ce classement est basé sur le revenu fiscal moyen par ménage et les dynamiques de construction en 2026. Les zones de coteaux (Sud et Est) restent les secteurs les plus valorisés de l'aire urbaine.
        </p>
      </footer>
    </div>
  );
}
