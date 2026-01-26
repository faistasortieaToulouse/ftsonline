"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Map, ExternalLink, Compass } from "lucide-react";

interface VoyageLink {
  id: number;
  title: string;
  url: string;
  description: string;
  tag: string;
  icon: string;
}

export default function VoyageToulousePage() {
  const [items, setItems] = useState<VoyageLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/voyagetoulouse")
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return <div className="p-10 text-center animate-pulse text-indigo-600 font-bold">Préparation de l'itinéraire...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation */}
        <nav className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-900 font-bold transition-all group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
            Retour à l'accueil
          </Link>
        </nav>

        {/* Header Style "Carnet de Voyage" */}
        <header className="relative bg-indigo-900 rounded-3xl p-8 mb-10 overflow-hidden shadow-2xl">
          <div className="relative z-10 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Compass className="text-amber-400 animate-spin-slow" size={32} />
              <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">Voyager <span className="text-amber-400">Toulouse</span></h1>
            </div>
            <p className="text-indigo-200 italic max-w-md">Découvrez les meilleures options pour vous évader de la Ville Rose, des Pyrénées à la Mer.</p>
          </div>
          {/* Décoration de fond */}
          <Map className="absolute -right-10 -bottom-10 text-white/5 w-64 h-64 rotate-12" />
        </header>

        {/* Grille de Destinations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl bg-slate-50 w-16 h-16 flex items-center justify-center rounded-xl group-hover:bg-amber-50 transition-colors">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase">
                      {item.tag}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-50 flex justify-end">
                <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Découvrir <ExternalLink size={12} />
                </span>
              </div>
            </a>
          ))}
        </div>

        <footer className="mt-16 text-center">
          <p className="text-slate-400 text-xs">
            Sélection de transports et excursions au départ de Toulouse - Mise à jour {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </p>
        </footer>
      </div>
    </main>
  );
}
