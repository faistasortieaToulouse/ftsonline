"use client";

import dynamic from 'next/dynamic';
import Link from "next/link";
import { ArrowLeft, Globe } from "lucide-react";
// Importe ton composant GoogleTranslate ici
import GoogleTranslateCustom from "@/components/GoogleTranslateCustom"; 

// Import dynamique de la carte
const MapWorld = dynamic(() => import('./MapWorld'), { 
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center font-mono text-slate-400">Chargement de la cartographie mondiale...</div>
});

export default function MondePage() {
  return (
    <main className="max-w-6xl mx-auto p-6 bg-white min-h-screen relative">
      
      {/* 1. LE TRADUCTEUR (Placé en haut avec un z-index forcé) */}
      <div className="relative" style={{ zIndex: 9999 }}>
        <GoogleTranslateCustom />
      </div>

      <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-black mb-8 uppercase text-sm">
        <ArrowLeft size={18} /> Retour
      </Link>

      <header className="mb-10">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-4">
          Exploration Mondiale <Globe className="text-blue-600" />
        </h1>
      </header>

      {/* 2. ESPACEMENT ET CARTE */}
      {/* On ajoute 'relative' et un z-index plus faible que le traducteur */}
      <section className="mb-12 relative" style={{ zIndex: 1 }}>
        <div className="mb-6 text-xs font-mono text-slate-400 uppercase tracking-widest italic">
          — Navigation interactive via OpenStreetMap
        </div>
        <MapWorld />
      </section>

      {/* 3. TES LIENS WIKIPÉDIA (en bas) */}
      <section className="mt-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
         {/* Ton code pour afficher les liens de l'API ici */}
         <p className="text-slate-500 italic text-sm">Les ressources documentaires sont chargées ci-dessous...</p>
      </section>
    </main>
  );
}
