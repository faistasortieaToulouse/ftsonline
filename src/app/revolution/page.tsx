"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, History, Globe, Info } from "lucide-react";

export default function RevolutionPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/revolution")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center">Chargement...</div>;
  if (!data || data.error) return <div className="p-10 text-center text-red-500 font-bold">Erreur : {data?.error || "Données introuvables"}</div>;

  // Liste des clés de catégories (on exclut le titre, la source et la synthèse)
  const categories = Object.keys(data).filter(
    (k) => !["titre", "source", "synthese_historique"].includes(k)
  );

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <nav className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-red-700 hover:underline font-bold">
          <ArrowLeft size={20} /> Retour
        </Link>
      </nav>

      <h1 className="text-3xl font-black mb-2 uppercase text-slate-900">{data.titre}</h1>
      <p className="text-sm text-gray-500 mb-8 italic">Source : {data.source}</p>

      {/* Synthèse Historique */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-10 rounded-r-lg">
        <h2 className="font-bold text-amber-800 flex items-center gap-2 mb-3 uppercase tracking-wider">
          <Info size={18} /> Points Clés & Analyse
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
          {data.synthese_historique.map((item: string, i: number) => (
            <li key={i} className="text-sm text-amber-900 leading-snug list-disc ml-4">{item}</li>
          ))}
        </ul>
      </div>

      {/* Catégories Chronologiques */}
      <div className="space-y-12">
        {categories.map((cat) => (
          <section key={cat}>
            <h2 className="text-xl font-bold border-b-2 border-red-600 pb-1 mb-6 text-red-700 uppercase tracking-tighter">
              {cat.replace(/_/g, " ")}
            </h2>
            <div className="space-y-4">
              {data[cat].map((event: string, i: number) => {
                const parts = event.split(':');
                const date = parts[0];
                const desc = parts.slice(1).join(':');

                return (
                  <div key={i} className="flex flex-col sm:flex-row gap-2 sm:gap-4 border-l-2 border-slate-200 pl-4 py-1">
                    <span className="font-mono font-bold text-red-600 shrink-0 min-w-[100px]">{date}</span>
                    <p className="text-slate-800 leading-relaxed">{desc}</p>
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
