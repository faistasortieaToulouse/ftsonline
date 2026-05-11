"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Castle, MapPin, ShieldCheck } from 'lucide-react';

interface Ville {
  nom: string;
  departement: string;
  type: string;
  status: string;
  description: string;
  conservation_totale?: boolean;
}

interface Data {
  titre: string;
  region: string;
  villes: Ville[];
}

export default function RempartOccitaniePage() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/rempartoccitanie')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-20 text-center font-serif text-xl">Exploration des citadelles d'Occitanie...</div>;
  if (!data) return <div className="p-20 text-center text-red-600">Erreur lors du chargement du patrimoine.</div>;

  return (
    <main className="min-h-screen bg-stone-50 p-6 md:p-12 text-stone-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-stone-500 hover:text-red-700 transition-colors mb-10 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Retour à l'Accueil</span>
        </Link>

        {/* Header */}
        <header className="mb-16 border-l-4 border-red-700 pl-6">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-stone-900 mb-2">
            {data.titre}
          </h1>
          <p className="text-xl text-stone-600 font-medium italic">Région {data.region}</p>
        </header>

        {/* Liste des Villes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {data.villes.map((ville, index) => (
            <div 
              key={index} 
              className="group relative bg-white border border-stone-200 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-red-200 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-red-50 text-red-700 rounded-xl group-hover:bg-red-700 group-hover:text-white transition-colors">
                  <Castle size={28} />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">Status</span>
                  <span className="px-3 py-1 bg-stone-100 text-stone-700 rounded-md text-sm font-bold">
                    {ville.status}
                  </span>
                </div>
              </div>

              <h2 className="text-2xl font-serif font-bold mb-3 text-stone-800">{ville.nom}</h2>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm font-medium text-stone-500">
                  <MapPin size={16} className="text-red-600" />
                  <span>{ville.departement}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-500">
                  <ShieldCheck size={16} className="text-stone-400" />
                  <span>Style architectural : **{ville.type}**</span>
                </div>
              </div>

              <p className="text-stone-600 leading-relaxed">
                {ville.description}
              </p>

              {ville.conservation_totale && (
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-tighter">
                  <ShieldCheck size={14} />
                  Conservation Intégrale
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer décoratif */}
        <footer className="mt-20 pt-10 border-t border-stone-200 text-center text-stone-400 text-sm italic font-serif">
          Patrimoine architectural protégé — Inventaire {data.region} 2024
        </footer>
      </div>
    </main>
  );
}
