"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export default function EvenementsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/evenements')
      .then((res) => {
        if (!res.ok) throw new Error(`Erreur ${res.status}: Fichier introuvable`);
        return res.json();
      })
      .then((json) => {
        if (!json.Sources) throw new Error("Format JSON invalide");
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur de fetch:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Chargement des agendas toulousains...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Oups ! Impossible de charger les données</h2>
        <p className="text-slate-500 mb-6 text-center">{error || "Le fichier est manquant sur le serveur."}</p>
        <Link href="/" className="text-blue-600 hover:underline flex items-center gap-2">
          <ArrowLeft size={18} /> Retour à l'accueil
        </Link>
      </div>
    );
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
          <p className="text-slate-500 mt-2">{data.Sources.length} sources répertoriées</p>
        </header>
        
        <div className="grid gap-4">
          {data.Sources.map((source: any, index: number) => (
            <div key={index} className="group border border-slate-200 p-5 rounded-xl shadow-sm bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-200 transition-all">
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">{source.Nom}</h2>
                <p className="text-sm text-slate-400 truncate mt-1">{source.Lien}</p>
              </div>
              <a 
                href={source.Lien} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-md"
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
