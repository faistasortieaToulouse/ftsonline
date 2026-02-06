"use client";

import dynamic from 'next/dynamic';
import Link from "next/link";
import { ArrowLeft, Globe } from "lucide-react";

// Import dynamique de la carte
const MapWorld = dynamic(() => import('./MapWorld'), { 
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center font-mono text-slate-400">Chargement de la cartographie mondiale...</div>
});

export default function MondePage() {
  return (
    <main className="max-w-6xl mx-auto p-6 bg-white min-h-screen">
      <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-black mb-8 uppercase text-sm">
        <ArrowLeft size={18} /> Retour
      </Link>

      <header className="mb-10">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-4">
          Exploration Mondiale <Globe className="text-blue-600" />
        </h1>
      </header>

      {/* La Carte */}
      <section className="mb-12">
        <MapWorld />
      </section>

      {/* Tes liens Wikipédia ici... */}
      {/* ... */}
    </main>
  );
}
