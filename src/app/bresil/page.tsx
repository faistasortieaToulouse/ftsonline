"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, MapPinned, Building2 } from "lucide-react";
import { DonneesBresil } from '../api/bresil/route';

export default function BresilPage() {
  const [data, setData] = useState<DonneesBresil | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/bresil');
        const json: DonneesBresil = await res.json();

        // Tri des états par population de la capitale (Décroissant)
        const etatsTries = [...json.etats].sort((a, b) => {
          const popA = parseInt(a.population_capitale.replace(/\s/g, ''), 10);
          const popB = parseInt(b.population_capitale.replace(/\s/g, ''), 10);
          return popB - popA;
        });

        setData({ ...json, etats: etatsTries });
      } catch (err) {
        console.error("Erreur de fetch:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-20 font-medium text-slate-500 italic">Chargement des données brésiliennes...</div>;
  if (!data) return <div className="text-center mt-20">Données non disponibles.</div>;

  return (
    <main className="max-w-6xl mx-auto p-6 bg-slate-50 min-h-screen">
      
      <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline mb-6 transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour à l'accueil
      </Link>
      
      <h1 className="text-4xl font-extrabold text-slate-900 mb-8 text-center uppercase tracking-tight">
        Classement des États du Brésil par population des capitales
      </h1>

      {/* Section États triés */}
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <MapPinned className="text-green-600" /> États et District Fédéral
      </h2>

      <br />
              <div className="flex flex-wrap items-center gap-3">
          <p className="text-slate-400 font-mono">
            Recensement 2020 & Estimations 2025/26
          </p>
          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">
            Classé par population urbaine
          </span>
        </div>
      <br />
      <br />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {data.etats.map((etat, index) => (
          <article 
            key={index} 
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-green-400 transition-colors border-l-4 border-l-yellow-400"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-slate-800">{etat.nom}</h3>
              <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Rang {index + 1}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Capitale</p>
                  <p className="text-lg font-medium text-green-700">{etat.capitale}</p>
                </div>
                <p className="font-bold text-slate-900">{etat.population_capitale} hab.</p>
              </div>
              
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm">
                <span className="text-slate-500 italic">Population État</span>
                <span className="font-semibold text-slate-700">{etat.population_etat} hab.</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Section Autres Grandes Villes */}
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Building2 className="text-blue-600" /> Autres pôles urbains majeurs
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {data.autres_grandes_villes.map((v, index) => (
          <div 
            key={index} 
            className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow"
          >
            <span className="font-bold text-slate-800 text-sm truncate">{v.ville}</span>
            <span className="text-[10px] text-slate-500 uppercase mb-2">{v.etat}</span>
            <span className="text-blue-600 font-bold text-xs mt-auto">{v.population} hab.</span>
          </div>
        ))}
      </div>

      <footer className="mt-16 text-center border-t pt-8 pb-10">
        <div className="text-slate-500 italic font-medium">
          Nombre total de ressources : <span className="font-bold text-purple-600">
            {data.etats.length + data.autres_grandes_villes.length}
          </span> articles
        </div>
      </footer>
    </main>
  );
}
