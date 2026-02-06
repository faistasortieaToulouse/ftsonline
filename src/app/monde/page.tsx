"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Globe2, ExternalLink, Map, Users, LayoutGrid, Info } from "lucide-react";

export default function MondePage() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/monde')
      .then(res => res.json())
      .then(data => {
        setLinks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-20 text-center font-mono text-blue-600 animate-pulse uppercase">Initialisation du Répertoire Mondial...</div>;

  return (
    <main className="max-w-6xl mx-auto p-6 bg-slate-50 min-h-screen">
      {/* Retour */}
      <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-black mb-8 hover:translate-x-[-4px] transition-transform uppercase text-sm">
        <ArrowLeft size={18} /> Retour à l'Accueil
      </Link>

      {/* Header */}
      <header className="mb-12 border-b-8 border-blue-600 pb-8">
        <h1 className="text-7xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-4">
          Monde<Globe2 size={60} className="text-blue-600 animate-spin-slow" />
        </h1>
        <p className="mt-4 text-slate-500 font-mono text-sm uppercase tracking-widest max-w-2xl">
          Données géopolitiques, démographiques et administratives globales. 
          Sources : Wikipedia Open Data & Statistiques Nationales.
        </p>
      </header>

      {/* Grille de liens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {links.map((link, index) => (
          <a 
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-600 hover:shadow-2xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="bg-slate-900 text-white px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                  {link.categorie}
                </span>
                <ExternalLink size={18} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 group-hover:text-blue-600 mb-2 uppercase italic leading-tight">
                {link.titre}
              </h2>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                {link.description}
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
              <Info size={12} /> Cliquer pour consulter la source externe
            </div>
          </a>
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-20 py-10 text-center border-t border-slate-200 font-mono text-slate-400 text-[10px] uppercase tracking-[0.3em]">
        Base de données Monde — Actualisation Systématique 2026
      </footer>
    </main>
  );
}
