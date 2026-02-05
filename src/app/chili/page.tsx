"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, MapIcon, Building2 } from "lucide-react";
import { DonneesChili } from '../api/chili/route';

export default function ChiliPage() {
  const [data, setData] = useState<DonneesChili | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/chili');
        const json: DonneesChili = await res.json();

        // Tri des régions par population de la capitale (Décroissant)
        const regionsTriees = [...json.regions].sort((a, b) => {
          const popA = parseInt(a.population_capitale.replace(/\s/g, ''), 10);
          const popB = parseInt(b.population_capitale.replace(/\s/g, ''), 10);
          return popB - popA;
        });

        setData({ ...json, regions: regionsTriees });
      } catch (err) {
        console.error("Erreur de fetch:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-20 font-medium text-slate-500 italic">Chargement des données chiliennes...</div>;
  if (!data) return <div className="text-center mt-20">Données non disponibles.</div>;

  return (
    <main className="max-w-6xl mx-auto p-6 bg-slate-50 min-h-screen">
      
      <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline mb-6 transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour à l'accueil
      </Link>
      
      <h1 className="text-4xl font-extrabold text-slate-900 mb-8 text-center uppercase tracking-tight">
        Démographie du Chili : Régions et Agglomérations
      </h1>

      {/* Section Régions triées */}
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b-2 border-red-500 pb-2">
        <MapIcon className="text-red-600" /> Régions (triées par population de capitale)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {data.regions.map((region, index) => (
          <article 
            key={index} 
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-blue-400 transition-colors border-l-4 border-l-blue-600"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-slate-800 leading-tight">{region.nom}</h3>
              <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                N°{index + 1}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-slate-500 italic">Capitale : {region.capitale}</span>
                <span className="font-bold text-red-600">{region.population_capitale}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-400 uppercase">Population Région</span>
                <span className="font-medium text-slate-700">{region.population_region} hab.</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Section Grandes Villes */}
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b-2 border-blue-600 pb-2">
        <Building2 className="text-blue-600" /> Principales Agglomérations
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.grandes_villes_et_agglomerations.map((v, index) => (
          <div 
            key={index} 
            className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col hover:bg-red-50 transition-colors"
          >
            <span className="font-bold text-slate-800">{v.ville}</span>
            <span className="text-[10px] text-slate-500 uppercase mb-2 leading-tight">{v.region}</span>
            <span className="text-red-600 font-bold text-sm mt-auto">{v.population} hab.</span>
          </div>
        ))}
      </div>

      <footer className="mt-16 text-center border-t pt-8 pb-10">
        <div className="text-slate-500 italic font-medium">
          Nombre total de ressources : <span className="font-bold text-purple-600">
            {data.regions.length + data.grandes_villes_et_agglomerations.length}
          </span> articles
        </div>
      </footer>
    </main>
  );
}
