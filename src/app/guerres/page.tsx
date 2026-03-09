"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Sword, Shield, ExternalLink } from "lucide-react";

export default function GuerresPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/guerres")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center font-mono">Chargement des registres militaires...</div>;
  if (!data || data.error) return <div className="p-10 text-center text-red-500 font-bold underline">Erreur de chargement</div>;

  // Filtrage : On retire les métadonnées pour garder les époques
  const categories = Object.keys(data).filter(
    (k) => !["titre", "source_urls", "synthese_strategique"].includes(k)
  );

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <nav className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-700 hover:text-black font-bold">
          <ArrowLeft size={20} /> Retour à l'Accueil
        </Link>
      </nav>

      <header className="mb-12 border-b-4 border-slate-900 pb-6">
        <h1 className="text-4xl font-black uppercase mb-4 flex items-center gap-3">
          <Sword className="text-red-700" /> {data.titre}
        </h1>
        
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sources consultées :</p>
          {data.source_urls.map((url: string, i: number) => (
            <a key={i} href={url} target="_blank" className="text-blue-600 hover:underline text-sm flex items-center gap-2 italic">
              <ExternalLink size={14} /> {url.split('/').pop()?.replace(/_/g, ' ')}
            </a>
          ))}
        </div>
      </header>

      {/* Synthèse en haut */}
      <div className="bg-slate-50 border-2 border-slate-200 p-6 mb-12 rounded-lg">
        <h2 className="font-bold flex items-center gap-2 mb-4 text-slate-800 uppercase tracking-tighter">
          <Shield size={18} /> Analyse Tactique
        </h2>
        <ul className="list-none space-y-2">
          {data.synthese_strategique.map((item: string, i: number) => (
            <li key={i} className="text-sm text-slate-600 border-l-2 border-red-500 pl-4 py-1">{item}</li>
          ))}
        </ul>
      </div>

      {/* Sections par époques */}
      <div className="space-y-16">
        {categories.map((cat) => (
          <section key={cat}>
            <h2 className="text-xl font-black mb-6 text-slate-900 uppercase border-b border-slate-200 pb-2">
              {cat.replace(/_/g, " ")}
            </h2>
            <div className="grid gap-4">
              {data[cat].map((event: string, i: number) => {
                const [date, ...desc] = event.split(':');
                return (
                  <div key={i} className="flex flex-col md:flex-row gap-2 md:gap-6 group">
                    <span className="font-mono font-bold text-red-700 md:w-24 shrink-0">{date}</span>
                    <p className="text-slate-800 group-hover:translate-x-1 transition-transform">{desc.join(':')}</p>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
