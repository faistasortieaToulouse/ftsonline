"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Monitor, History, Layers, Info, ExternalLink, Server, Globe, Cpu } from 'lucide-react';

const SystemesExploitation = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/systeme')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur API:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse text-slate-400 font-medium">Chargement des données...</div>
    </div>
  );

  if (!data) return <div className="p-10 text-center">Erreur : Impossible de charger les données.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-all mb-8 group bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Retour à l'accueil</span>
        </Link>

        <main className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-800 to-indigo-900 p-8 text-white">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Monitor size={32} className="text-blue-300" />
              {data.metadata?.title}
            </h1>
            <p className="text-blue-100 opacity-90">Comprendre les fondations de l'informatique moderne.</p>
          </div>

          <div className="p-8">
            {/* 1. Définition */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-slate-800 flex items-center gap-2">
                <Info size={24} className="text-blue-500" />
                1. Qu'est-ce qu'un OS ?
              </h2>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-slate-700 leading-relaxed italic">
                  "Un système d'exploitation est le chef d'orchestre de l'ordinateur. Il fait le pont entre le matériel et les logiciels."
                </p>
              </div>
            </section>

            {/* 2. Chronologie */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-slate-800 flex items-center gap-2">
                <History size={24} className="text-blue-500" />
                2. Chronologie & Racines
              </h2>
              <div className="relative border-l-2 border-slate-100 ml-3 pl-8 space-y-8">
                {data.chronologie_detaillee?.map((item: any, index: number) => (
                  <div key={index} className="relative group">
                    <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm group-hover:scale-110 transition-transform"></div>
                    <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">{item.date}</span>
                    <h3 className="font-bold text-slate-900 text-lg">{item.evenement}</h3>
                    <p className="text-slate-600 text-sm mb-1">{item.description || item.impact || item.innovation}</p>
                    {item.wiki && (
                      <a href={item.wiki} target="_blank" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                        Détails <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Familles */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-slate-800 flex items-center gap-2">
                <Layers size={24} className="text-blue-500" />
                3. Les Familles de Distributions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.familles_et_philosophie?.map((famille: any, i: number) => (
                  <div key={i} className="p-4 border border-slate-100 bg-slate-50 rounded-xl shadow-sm hover:shadow-md transition-all">
                    <h4 className="font-bold text-blue-800 mb-1">{famille.nom}</h4>
                    <p className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-tight italic">{famille.philosophie}</p>
                    <div className="flex flex-wrap gap-2">
                      {famille.descendance?.map((distro: string) => (
                        <span key={distro} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                          {distro}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Impact Global - LA CORRECTION EST ICI */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-slate-800 flex items-center gap-2">
                <Globe size={24} className="text-blue-500" />
                4. Impact Global
              </h2>
              <div className="bg-slate-900 rounded-2xl p-6 text-white grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 text-blue-400 mb-2 font-bold text-sm">
                    <Server size={16} /> Cloud & Infrastructure
                  </div>
                  {/* Correction du nom de la variable + Optional chaining */}
                  <p className="text-slate-300 text-sm">{data.impact_moderne?.infrastructure?.cloud}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-green-400 mb-2 font-bold text-sm">
                    <Cpu size={16} /> Supercalculateurs
                  </div>
                  {/* Correction du nom de la variable + Optional chaining */}
                  <p className="text-slate-300 text-sm">{data.impact_moderne?.infrastructure?.supercalculateurs}</p>
                </div>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
};

export default SystemesExploitation;
