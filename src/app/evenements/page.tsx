import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react'; // Assurez-vous d'avoir installé lucide-react

async function getEvenements() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/evenements`, {
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error('Erreur lors de la récupération des données');
  }
  return res.json();
}

export default async function EvenementsPage() {
  const data = await getEvenements();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Bouton Retour à l'Accueil */}
        <div className="mb-8">
          <Link href="/" className="group inline-flex items-center text-slate-600 hover:text-blue-600 transition-all">
            <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Retour à l'Accueil</span>
          </Link>
        </div>

        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            {data.Titre || "Évènements à Toulouse"}
          </h1>
          <p className="text-slate-500 mt-2">
            Retrouvez toutes les sources culturelles et agendas de la ville rose.
          </p>
        </header>
        
        <div className="grid gap-4">
          {data.Sources.map((source: any, index: number) => (
            <div 
              key={index} 
              className="group border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">
                  {source.Nom}
                </h2>
                <p className="text-sm text-slate-400 truncate mt-1">
                  {source.Lien}
                </p>
              </div>
              
              <a 
                href={source.Lien} 
                target="_blank" 
                rel="noopener noreferrer"
                className="whitespace-nowrap bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 hover:scale-105 transition-all shadow-sm"
              >
                Ouvrir l'agenda
              </a>
            </div>
          ))}
        </div>
        
        <footer className="mt-12 pt-6 border-t border-slate-200 flex justify-between items-center text-slate-400 text-sm italic">
          <p>Dernière mise à jour : Mars 2026</p>
          <p>{data.Sources.length} sources répertoriées</p>
        </footer>
      </div>
    </div>
  );
}
