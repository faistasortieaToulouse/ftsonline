"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VilleAfriqueSud } from '../api/afriquedusud/route';

export default function AfriqueDuSudPage() {
  const [villes, setVilles] = useState<VilleAfriqueSud[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/afriquedusud');
        const data = await res.json();
        setVilles(data);
      } catch (err) {
        console.error("Erreur de fetch:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-20 font-medium">Chargement des données sud-africaines...</div>;

  return (
    <main className="max-w-6xl mx-auto p-6 bg-slate-50 min-h-screen">
      
       <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline mb-6 transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour à l'accueil
      </Link>
      
      <h1 className="text-4xl font-extrabold text-slate-900 mb-8 text-center">
        Classement des villes et capitales par population de l'Afrique du Sud
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {villes.map((item, index) => (
          <article 
            key={index} 
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-purple-300 transition-colors"
          >
            <h2 className="text-2xl font-bold text-purple-700 mb-1">{item.ville}</h2>
            <p className="text-sm text-slate-500 italic mb-4 h-10">{item.role}</p>
            
            <div className="text-slate-700 space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Province</span>
                <span className="font-medium text-right">{item.province}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="font-semibold text-slate-500">Population</span>
                <span className="text-lg font-bold text-slate-800">
                  {item.population_agglo.toLocaleString('fr-FR')}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <footer className="mt-16 text-center space-y-6">
        <div className="text-slate-500 italic font-medium">
          Nombre total de ressources : <span className="font-bold text-purple-600">{villes.length}</span> articles
        </div>
        
      </footer>
    </main>
  );
}
