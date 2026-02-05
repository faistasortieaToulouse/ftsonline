"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, MapIcon, Building2 } from "lucide-react";
import { DonneesArgentine } from '../api/argentine/route';

export default function ArgentinePage() {
  const [data, setData] = useState<DonneesArgentine | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/argentine');
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

  if (loading) return <div className="text-center mt-20 font-medium text-slate-500">Chargement des données de l'Argentine...</div>;
  if (!data) return <div className="text-center mt-20">Données non disponibles.</div>;

  return (
    <main className="max-w-6xl mx-auto p-6 bg-slate-50 min-h-screen">
      
      <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline mb-6 transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour à l'accueil
      </Link>
      
      <h1 className="text-4xl font-extrabold text-slate-900 mb-8 text-center">
        Démographie et Provinces de l'Argentine
      </h1>

      {/* Section Provinces */}
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <MapIcon className="text-sun-600 text-yellow-500" /> Les Provinces Argentines
      </h2>

      

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {data.provinces.map((prov, index) => (
          <article 
            key={index} 
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-blue-300 transition-colors"
          >
            <h3 className="text-xl font-bold text-blue-800 mb-3">{prov.nom}</h3>
            <div className="text-slate-700 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 italic">Capitale</span>
                <span className="font-medium">{prov.capitale}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2 text-xs">
                <span className="text-slate-500 uppercase tracking-wider">Pop. Totale</span>
                <span className="font-bold text-slate-900">{prov.population_totale} hab.</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Section Grandes Villes */}
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Building2 className="text-purple-600" /> Principales Agglomérations
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.grandes_villes_et_agglomerations.map((ville, index) => (
          <div 
            key={index} 
            className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col"
          >
            <span className="text-lg font-bold text-slate-800">{ville.ville}</span>
            <span className="text-xs text-slate-500 mb-2">{ville.province}</span>
            <span className="text-purple-600 font-bold mt-auto">{ville.population} hab.</span>
          </div>
        ))}
      </div>

      <footer className="mt-16 text-center space-y-6">
        <div className="text-slate-500 italic font-medium">
          Nombre total de ressources : <span className="font-bold text-purple-600">{data.provinces.length + data.grandes_villes_et_agglomerations.length}</span> articles
        </div>
      </footer>
    </main>
  );
}
