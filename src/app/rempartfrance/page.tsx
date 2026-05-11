"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Castle, MapPin } from 'lucide-react';

interface Ville {
  nom: string;
  type: string;
  status: string;
  description: string;
  conservation_totale?: boolean;
}

interface Data {
  titre: string;
  categorie_principale: string;
  villes: Ville[];
}

export default function RempartFrancePage() {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    fetch('/api/rempartfrance')
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  if (!data) return <div className="p-10 text-center">Chargement du patrimoine...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation Retour */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Retour à l'Accueil</span>
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold uppercase tracking-widest text-amber-600">
              {data.categorie_principale}
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-2">
              {data.titre}
            </h1>
            {/* Ajout de la mention ici */}
            <p className="text-lg text-slate-500 font-medium italic mt-2">
              Remparts les mieux conservés
            </p>
          </div>
        </header>

        {/* Grille des villes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.villes.map((ville, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-amber-100 p-3 rounded-lg text-amber-700">
                  <Castle size={24} />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  ville.status === 'Ville' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {ville.status}
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-800 mb-2">{ville.nom}</h2>
              
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                <MapPin size={14} />
                <span>Style : **{ville.type}**</span>
              </div>

              <p className="text-slate-600 leading-relaxed mb-4">
                {ville.description}
              </p>

              {ville.conservation_totale && (
                <div className="mt-4 pt-4 border-t border-slate-100 text-xs font-medium text-amber-600 italic">
                  ✓ Conservation intégrale du tracé
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
