"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Map, Building2, ListTree } from "lucide-react";
import { DonneesCanada } from '../api/canada/route';

export default function CanadaPage() {
  const [data, setData] = useState<DonneesCanada | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/canada');
        const json: DonneesCanada = await res.json();

        // Tri des provinces/territoires par population de la capitale (Décroissant)
        const tries = [...json.provinces_et_territoires].sort((a, b) => {
          const popA = parseInt(a.population_capitale.replace(/\s/g, ''), 10);
          const popB = parseInt(b.population_capitale.replace(/\s/g, ''), 10);
          return popB - popA;
        });

        setData({ ...json, provinces_et_territoires: tries });
      } catch (err) {
        console.error("Erreur de fetch:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-20 font-medium text-slate-500 italic">Chargement des données canadiennes...</div>;
  if (!data) return <div className="text-center mt-20">Données non disponibles.</div>;

  return (
    <main className="max-w-6xl mx-auto p-6 bg-slate-50 min-h-screen">
      
      <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline mb-6 transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour à l'accueil
      </Link>
      
      <h1 className="text-4xl font-extrabold text-slate-900 mb-8 text-center">
        Démographie du Canada : Provinces et Villes
      </h1>

      {/* Section Provinces et Territoires */}
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-2">
        <Map className="text-red-600" /> Provinces & Territoires (triés par capitale)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {data.provinces_et_territoires.map((prov, index) => (
          <article 
            key={index} 
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-red-300 transition-colors border-t-4 border-t-red-500"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-slate-800 leading-tight">{prov.nom}</h3>
              <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                #{index + 1}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-slate-500 italic">Capitale : {prov.capitale}</span>
                <span className="font-bold text-red-600">{prov.population_capitale}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Population totale</span>
                <span className="font-medium text-slate-700">{prov.population_totale} hab.</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Section Grandes Villes +500k */}
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-2">
        <Building2 className="text-blue-600" /> Métropoles (+500k habitants)
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {data.grandes_villes_plus_500k.map((v, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col hover:bg-blue-50 transition-colors">
            <div className="flex justify-between mb-1">
               <span className="font-bold text-slate-800">{v.ville}</span>
               <span className="text-[10px] font-bold text-slate-400">RANG {v.rang}</span>
            </div>
            <span className="text-xs text-slate-500 mb-2">{v.province}</span>
            <span className="text-blue-600 font-bold text-sm mt-auto">{v.population} hab.</span>
          </div>
        ))}
      </div>

      {/* Section Villes Intermédiaires */}
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-2">
        <ListTree className="text-slate-600" /> Villes Intermédiaires
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {data.villes_intermediaires.map((v, index) => (
          <div key={index} className="bg-white p-2 rounded border border-slate-100 shadow-xs flex flex-col text-center">
            <span className="font-semibold text-slate-800 text-xs truncate">{v.ville}</span>
            <span className="text-[10px] text-slate-400 mb-1">{v.province}</span>
            <span className="text-slate-600 font-bold text-[10px]">{v.population}</span>
          </div>
        ))}
      </div>

      <footer className="mt-16 text-center border-t pt-8 pb-10">
        <div className="text-slate-500 italic font-medium">
          Nombre total de ressources : <span className="font-bold text-purple-600">
            {data.provinces_et_territoires.length + data.grandes_villes_plus_500k.length + data.villes_intermediaires.length}
          </span> articles
        </div>
      </footer>
    </main>
  );
}
