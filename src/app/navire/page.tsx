"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function NavirePage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/navire")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((json) => setData(json))
      .catch(() => setError(true));
  }, []);

  if (error) return <div className="p-10 text-red-500">Erreur : Impossible de charger les données navires.</div>;
  if (!data) return <div className="p-10 text-center font-mono">Chargement des données maritimes...</div>;

  return (
    <main className="min-h-screen bg-[#f0f4f8]">
      {/* Barre de navigation avec Flèche de retour */}
      <nav className="bg-white border-b border-slate-200 relative shadow-sm">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link 
            href="/" 
            className="group flex items-center text-blue-700 hover:text-blue-900 font-semibold transition-all"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à l'Accueil
          </Link>
          <span className="text-slate-400 text-sm hidden sm:block">Technologie / Marine</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-16 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            ⚓ {data.titre}
          </h1>
          <div className="inline-block px-4 py-1 bg-blue-900 text-white rounded-full text-sm font-medium">
            {data.categorie_principale} • {data.categorie_secondaire}
          </div>
        </header>

        {/* Section Ressources Wikipedia */}
        <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold mb-8 text-slate-800 flex items-center gap-2 border-b pb-4">
            📖 Encyclopédie Maritime
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.liens_wikipedia.map((link: any, i: number) => (
              <a 
                key={i} 
                href={link.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group p-5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <h3 className="font-bold text-blue-700 group-hover:text-blue-600 mb-2">{link.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{link.description}</p>
                <div className="mt-3 text-xs text-blue-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Lire l'article sur Wikipedia →
                </div>
              </a>
            ))}
          </div>
        </section>

        <footer className="mt-20 text-center text-slate-400 text-sm">
          Données collectées via les archives de la Marine et Wikipedia.
        </footer>
      </div>
    </main>
  );
}
