"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react'; // Importation de l'icône

export default function PageLivres() {
  const [nouveautes, setNouveautes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/livres')
      .then(res => res.json())
      .then(data => {
        setNouveautes(data);
        setLoading(false);
      });
  }, []);

  return (
    <main className="max-w-7xl mx-auto p-6">
      {/* Bouton Retour */}
      <nav className="mb-8">
        <Link 
          href="/" 
          className="group flex items-center text-slate-600 hover:text-blue-600 transition-all w-fit"
        >
          <ArrowLeft 
            className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" 
          />
          <span className="font-medium">Retour à l'Accueil</span>
        </Link>
      </nav>

      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Rayon des Nouveautés
        </h1>
        <p className="text-slate-500 mt-2">Les derniers romans français indexés.</p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-400">Recherche des pépites...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {nouveautes.map((livre: any) => (
            <div key={livre.id} className="group flex flex-col">
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-slate-200 shadow-sm transition-all group-hover:shadow-md">
                <img 
                  src={livre.image} 
                  alt={livre.titre}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug">
                  {livre.titre}
                </h3>
                <p className="text-xs text-slate-500 mt-1 italic">{livre.auteur}</p>
                <div className="mt-2 inline-block px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-600 rounded uppercase">
                  {livre.annee}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
