"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function EvenementsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Appel API avec une URL RELATIVE (important pour Vercel)
    fetch('/api/evenements')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur de fetch:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data || !data.Sources) {
    return <div className="p-8 text-center text-red-500">Impossible de charger les données.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8">
          <Link href="/" className="group inline-flex items-center text-slate-600 hover:text-blue-600 transition-all">
            <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Retour à l'Accueil</span>
          </Link>
        </div>

        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            {data.Titre}
          </h1>
        </header>
        
        <div className="grid gap-4">
          {data.Sources.map((source: any, index: number) => (
            <div key={index} className="group border border-slate-200 p-5 rounded-xl shadow-sm bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-200 transition-colors">
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-lg text-slate-800">{source.Nom}</h2>
                <p className="text-sm text-slate-400 truncate">{source.Lien}</p>
              </div>
              <a 
                href={source.Lien} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm"
              >
                Ouvrir
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
