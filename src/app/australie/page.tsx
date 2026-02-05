"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Map, Building } from "lucide-react";
import { DonneesAustralie } from '../api/australie/route';

export default function AustraliePage() {
  const [data, setData] = useState<DonneesAustralie | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/australie');
        const json: DonneesAustralie = await res.json();

        // Tri des états par population de la capitale (Décroissant)
        const etatsTries = [...json.etats_et_territoires].sort((a, b) => {
          const popA = parseInt(a.population_capitale.replace(/\s/g, ''), 10);
          const popB = parseInt(b.population_capitale.replace(/\s/g, ''), 10);
          return popB - popA;
        });

        setData({ ...json, etats_et_territoires: etatsTries });
      } catch (err) {
        console.error("Erreur de fetch:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-20 font-medium text-slate-500">Chargement des données australiennes...</div>;
  if (!data) return <div className="text-center mt-20">Données non disponibles.</div>;

  return (
    <main className="max-w-6xl mx-auto p-6 bg-slate-50 min-h-screen">
      
      <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline mb-6 transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour à l'accueil
      </Link>
      
      <h1 className="text-4xl font-extrabold text-slate-900 mb-8 text-center">
        États et Villes d'Australie : Classement par Population
      </h1>

      {/* Section États et Territoires triés */}
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Map className="text-emerald-600" /> États et Territoires (triés par capitale)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {data.etats_et_territoires.map((item, index) => (
          <article 
            key={index} 
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-emerald-300 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-slate-800 leading-tight">{item.nom}</h3>
              <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                N°{index + 1}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-slate-500 italic">Capitale : {item.capitale}</span>
                <span className="font-bold text-emerald-600">{item.population_capitale}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-400 uppercase">Population totale</span>
                <span className="font-medium text-slate-700">{item.population_totale} hab.</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Section Classement des Villes */}
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Building className="text-blue-600" /> Principales zones urbaines
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.classement_villes.map((v, index) => (
          <div 
            key={index} 
            className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col hover:bg-blue-50 transition-colors"
          >
            <span className="font-bold text-slate-800">{v.ville}</span>
            <span className="text-xs text-slate-500 mb-2">{v.etat}</span>
            <span className="text-blue-600 font-bold text-sm mt-auto">{v.population} hab.</span>
          </div>
        ))}
      </div>

      <footer className="mt-16 text-center border-t pt-8">
        <div className="text-slate-500 italic font-medium">
          Nombre total de ressources : <span className="font-bold text-purple-600">
            {data.etats_et_territoires.length + data.classement_villes.length}
          </span> articles
        </div>
      </footer>
    </main>
  );
}
