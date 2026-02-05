"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Map, Users } from "lucide-react";
import { DonneesAndorre } from '../api/andorre/route';

export default function AndorrePage() {
  const [data, setData] = useState<DonneesAndorre | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/andorre');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Erreur de fetch:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-20 font-medium text-slate-500">Chargement des données d'Andorre...</div>;
  if (!data) return <div className="text-center mt-20">Aucune donnée trouvée.</div>;

  return (
    <main className="max-w-6xl mx-auto p-6 bg-slate-50 min-h-screen">
      
      <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline mb-6 transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour à l'accueil
      </Link>
      
      <h1 className="text-4xl font-extrabold text-slate-900 mb-4 text-center">
        Démographie et divisions administratives d'Andorre
      </h1>
      <p className="text-center text-slate-600 mb-12 text-lg">Focus sur les 7 paroisses et les principales localités</p>
      
      {/* Section Paroisses */}
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Map className="text-purple-600" /> Les 7 Paroisses (Divisions administratives - triés par population des villes)
      </h2>

        <div className="flex flex-wrap items-center gap-3">
          <p className="text-slate-400 font-mono">
            Recensement 2020 & Estimations 2025/26
          </p>
          <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">
            Classé par population urbaine
          </span>
        </div>
      <br />
      <br />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {data.paroisses.map((paroisse, index) => (
          <article 
            key={index} 
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-purple-300 transition-colors"
          >
            <h3 className="text-xl font-bold text-purple-700 mb-3">{paroisse.nom}</h3>
            <div className="text-slate-700 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 italic">Capitale</span>
                <span className="font-medium">{paroisse.capitale}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="font-semibold text-slate-500 text-sm">Pop. Paroisse</span>
                <span className="font-bold text-slate-800">{paroisse.population_totale} hab.</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Section Classement Villes */}
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Users className="text-blue-600" /> Classement des principales localités
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.classement_villes_et_localites.map((ville, index) => (
          <article 
            key={index} 
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex justify-between items-center hover:bg-slate-100 transition-colors"
          >
            <div>
              <h3 className="font-bold text-slate-800">{ville.nom}</h3>
              <p className="text-xs text-slate-500 italic">{ville.paroisse}</p>
            </div>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
              {ville.population}
            </span>
          </article>
        ))}
      </div>

      <footer className="mt-16 text-center space-y-6 pb-10">
        <div className="text-slate-500 italic font-medium">
          Nombre total de ressources : <span className="font-bold text-purple-600">{data.paroisses.length + data.classement_villes_et_localites.length}</span> articles
        </div>
      </footer>
    </main>
  );
}
