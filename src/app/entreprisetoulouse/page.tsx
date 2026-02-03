'use client';

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, ExternalLink, Building2, Rocket, Globe, Search, Loader2 } from "lucide-react";

export default function EntrepriseToulousePage() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLinks() {
      try {
        const res = await fetch('/api/entreprisetoulouse');
        const data = await res.json();
        setLinks(data);
      } catch (error) {
        console.error("Erreur lors du chargement des liens:", error);
      } finally {
        setLoading(false);
      }
    }
    loadLinks();
  }, []);

  const iconMap: any = {
    sirene: <Search size={24} />,
    excellence: <Rocket size={24} />,
    wttj: <Building2 size={24} />,
    annuaire: <Globe size={24} />
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        
        {/* BOUTON RETOUR */}
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline mb-6 transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>

        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Écosystème Entreprises <span className="text-blue-600">Toulouse</span>
          </h1>
          <p className="text-lg text-slate-600 mt-3">
            Accès direct aux portails de données et annuaires officiels de la Ville Rose.
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p>Chargement des ressources...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {links.map((link: any) => (
              <a 
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-8 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all flex flex-col h-full"
              >
                <div className="flex items-center gap-4 mb-4 text-blue-500">
                  <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {iconMap[link.id]}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    {link.type}
                  </span>
                </div>
                
                <h2 className="text-xl font-bold text-slate-800 mb-2">
                  {link.title}
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
                  {link.description}
                </p>

                <div className="flex items-center text-blue-600 font-semibold text-sm mt-auto">
                  Consulter la ressource
                  <ExternalLink size={14} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            ))}
          </div>
        )}

        <footer className="mt-16 pt-8 border-t border-slate-200 text-slate-400 text-sm flex justify-between items-center">
          <p>© 2026 Toulouse Économie</p>
          <div className="hidden md:flex gap-4 italic">
            Mise à jour : Février 2026
          </div>
        </footer>
      </div>
    </main>
  );
}
