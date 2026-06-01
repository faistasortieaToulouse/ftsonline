'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Globe, Landmark, ChevronDown, ExternalLink } from "lucide-react";

interface Coordonnees {
  latitude: number;
  longitude: number;
}

interface Mairie {
  nom: string;
  ville: string;
  url: string;
  coordonnees: Coordonnees;
}

export default function HotelDeVillePage() {
  const [mairies, setMairies] = useState<Mairie[] | null>(null);

  // Utilitaire pour créer des IDs d'ancres valides au cas où
  const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  // Chargement des données depuis votre API sécurisée sur Vercel
  useEffect(() => {
    fetch("/api/hoteldeville")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur serveur API");
        return res.json();
      })
      .then((json) => {
        if (Array.isArray(json)) setMairies(json);
      })
      .catch((err) => console.error("Erreur fetch mairies:", err));
  }, []);

  // Écran de chargement ultra-fluide pendant le fetch
  if (!mairies) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em] animate-pulse italic">Indexation du patrimoine...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      
      {/* NAVIGATION */}
      <nav className="mb-8 flex justify-between items-center px-2">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-black uppercase text-[10px] tracking-widest transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Portail Principal
        </Link>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
          <Globe size={14} /> Territoires Database 2026
        </div>
      </nav>

      {/* EN-TÊTE DE PAGE AVEC LE COMPTEUR GLOBAL */}
      <header className="mb-10 relative">
        <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 -z-10"></div>
          <div className="z-10">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
              Hôtels <span className="text-blue-600">de Ville</span>
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2 italic mt-4">
              <Landmark size={14} className="text-blue-500" /> Répertoire et fiches encyclopédiques
            </p>
          </div>
          <div>
            <div className="bg-slate-900 text-white p-4 rounded-3xl text-center min-w-[110px] shadow-md">
              <div className="text-2xl font-black italic tracking-tighter">{mairies.length}</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Édifices</div>
            </div>
          </div>
        </div>
      </header>

      {/* SECTION DU CATALOGUE */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
           <ChevronDown size={20} />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter italic text-slate-800">Catalogue Alphabétique</h2>
      </div>

      {/* GRILLE DES ÉDIFICES COMPORTANT LES LIENS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mairies.map((m, index) => (
          <div 
            key={index} 
            id={`mairie-${slugify(m.nom)}`}
            className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[160px]"
          >
            {/* Index decoratif en arrière-plan */}
            <span className="absolute -right-2 -bottom-4 text-7xl font-black text-slate-50 pointer-events-none -z-0">
              {(index + 1).toString().padStart(2, '0')}
            </span>

            <div className="relative z-10 w-full">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Landmark size={18} />
                </div>
              </div>

              {/* LE NOM DEVIENT LE LIEN WIKIPÉDIA CLIQUABLE */}
              <h3 className="font-black text-slate-900 text-xl uppercase tracking-tighter mb-1 leading-tight group">
                <a 
                  href={m.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-baseline gap-1 hover:text-blue-600 transition-colors underline decoration-dotted decoration-slate-300 hover:decoration-solid break-words"
                >
                  {m.nom}
                </a>
              </h3>
              
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 italic">
                {m.ville}
              </p>
            </div>

            {/* Pied de carte avec bouton d'action externe */}
            <div className="relative z-10 pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
              <a 
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] text-slate-400 font-bold uppercase tracking-wider hover:text-blue-600 flex items-center gap-1 transition-colors"
              >
                Ouvrir Wikipédia <ExternalLink size={10} />
              </a>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
