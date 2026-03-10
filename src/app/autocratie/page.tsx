import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from "lucide-react";

async function getAutocratieData() {
  // On appelle l'API interne
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/autocratie`, { 
    cache: 'no-store' 
  });
  
  if (!res.ok) return null;
  return res.json();
}

export default async function AutocratiePage() {
  const data = await getAutocratieData();

  if (!data) {
    return (
      <div className="p-10 text-center">
        <p className="mb-4">Chargement des données impossible...</p>
        <Link href="/" className="text-blue-600 underline">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-8 bg-white min-h-screen font-sans text-slate-900">
      {/* Bouton Retour à l'Accueil */}
        <nav className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-900 font-bold transition-all group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
            Retour à l'accueil
          </Link>
        </nav>

      <header className="mb-10 border-l-8 border-red-600 pl-6">
        <h1 className="text-4xl font-black uppercase tracking-tight">{data.sujet}</h1>
        <p className="text-slate-500 font-medium">Analyse comparative des régimes et droits de vote</p>
      </header>

      {/* --- SECTION SUFFRAGE --- */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <span className="bg-slate-900 text-white px-3 py-1 rounded mr-3">01</span> 
          Le Suffrage Universel
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {data.suffrage_universel.statistiques_globales.repartition.map((item: any, i: number) => (
            <div key={i} className="border-2 border-slate-100 p-5 rounded-xl hover:border-blue-200 transition-colors">
              <h3 className="font-bold text-blue-800 text-lg mb-2">{item.categorie}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{item.etat_des_lieux}</p>
            </div>
          ))}
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <h3 className="text-lg font-bold mb-4">Exceptions et Nuances</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {data.suffrage_universel.nuances_et_exceptions.exceptions_notables.map((ex: any, i: number) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                <p className="font-bold text-red-600">{ex.entite}</p>
                <p className="text-xs uppercase font-bold text-slate-400 mb-2">{ex.type}</p>
                <p className="text-sm text-slate-700">{ex.details}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      

      {/* --- SECTION REGIMES --- */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <span className="bg-slate-900 text-white px-3 py-1 rounded mr-3">02</span> 
          Classement des Régimes (V-Dem)
        </h2>
        
        <div className="bg-red-50 border-2 border-red-100 p-8 rounded-3xl mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <p className="text-5xl font-black text-red-600 mb-2">
                {data.classement_regimes_politiques.donnees_v_dem_2025_2026.population_concernee_par_autocratie}
              </p>
              <p className="text-red-800 font-bold uppercase tracking-widest text-sm">De la population mondiale sous autocratie</p>
            </div>
            <div className="flex gap-4">
               <div className="bg-white px-6 py-4 rounded-2xl shadow-sm text-center">
                  <p className="text-3xl font-bold">{data.classement_regimes_politiques.donnees_v_dem_2025_2026.total_autocraties}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase">Autocraties</p>
               </div>
               <div className="bg-white px-6 py-4 rounded-2xl shadow-sm text-center">
                  <p className="text-3xl font-bold text-green-600">{data.classement_regimes_politiques.donnees_v_dem_2025_2026.total_democraties}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase">Démocraties</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- TYPOLOGIE --- */}
      <section className="grid md:grid-cols-2 gap-8 items-start pb-12">
        <div className="bg-slate-900 text-white p-8 rounded-3xl">
          <h3 className="text-xl font-bold mb-6 text-red-400">Typologie des Dictatures</h3>
          <ul className="space-y-4">
            {data.typologie_des_dictatures_modernes.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3 border-b border-slate-700 pb-3 last:border-0">
                <span className="text-red-500">→</span>
                <span className="text-sm font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-4 border-double border-slate-200 p-8 rounded-3xl">
          <h3 className="text-xl font-bold mb-4">Ressources Vidéo</h3>
          <p className="text-slate-600 mb-6 italic">"{data.ressources_complementaires.description}"</p>
          <a 
            href={data.ressources_complementaires.video}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center bg-red-600 text-white font-bold py-4 px-6 rounded-full hover:bg-red-700 transition-all"
          >
            Visionner sur YouTube
            <span className="ml-2 group-hover:translate-x-1 transition-transform">▶</span>
          </a>
        </div>
      </section>
    </main>
  );
}
