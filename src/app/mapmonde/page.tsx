"use client";

import dynamic from 'next/dynamic';
import Link from "next/link";
import { ArrowLeft, Globe } from "lucide-react";

// ON SUPPRIME L'IMPORT QUI CAUSAIT L'ERREUR
// Car le traducteur est géré par le layout.tsx

// Import dynamique de la carte
const MapWorld = dynamic(() => import('./MapWorld'), { 
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center font-mono text-slate-400">Chargement de la cartographie mondiale...</div>
});

export default function MondePage() {
  return (
    <main className="max-w-6xl mx-auto p-6 bg-white min-h-screen relative">
      
      {/* IMPORTANT : 
          Le GoogleTranslateCustom n'est plus appelé ici car il descend déjà de ton layout. 
          On laisse un espace vide ou on met le bouton retour.
      */}

      <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-black mb-8 uppercase text-sm mt-20">
        <ArrowLeft size={18} /> Retour
      </Link>

      <header className="mb-10">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-4">
          Exploration Mondiale <Globe className="text-blue-600" />
        </h1>
      </header>

      {/* LA CARTE 
          On garde z-index: 1 pour qu'elle reste "sous" le menu du layout 
      */}
      <section className="mb-12 relative" style={{ zIndex: 1 }}>
        <div className="mb-6 text-xs font-mono text-slate-400 uppercase tracking-widest italic">
          — Navigation interactive via OpenStreetMap
        </div>
        <MapWorld />
      </section>

      <section className="mt-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
         <p className="text-slate-500 italic text-sm text-center">
           Utilisez la barre de traduction située en haut de la page pour changer la langue.
         </p>
      </section>
    </main>
  );
}
