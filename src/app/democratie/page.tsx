"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Landmark, Globe, ExternalLink, ShieldCheck, BarChart3 } from "lucide-react";

export default function DemocratiePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/democratie")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center font-mono text-blue-600">Initialisation des archives démocratiques...</div>;
  if (!data || data.error) return <div className="p-10 text-center text-red-500 font-bold underline">Fichier JSON non détecté</div>;

  // Filtrage des catégories (on exclut les métadonnées et la dernière liste sans clé)
  const categories = Object.keys(data).filter(
    (k) => !["titre", "source", "indice"].includes(k) && Array.isArray(data[k])
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header Institutionnel */}
      <div className="bg-slate-900 text-white py-12 border-b-4 border-blue-600">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-white mb-6 font-bold transition-all">
            <ArrowLeft size={20} /> Retour au portail
          </Link>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 flex items-center gap-4">
            <Landmark className="text-blue-500" size={40} />
            {data.titre}
          </h1>
          
          <div className="flex flex-wrap gap-4 text-sm">
            <a href={data.source} target="_blank" className="bg-slate-800 px-3 py-1.5 rounded border border-slate-700 hover:bg-blue-900 flex items-center gap-2">
              <Globe size={14} /> Histoire (Wikipedia)
            </a>
            <a href={data.indice} target="_blank" className="bg-blue-700 px-3 py-1.5 rounded hover:bg-blue-600 flex items-center gap-2 font-bold shadow-lg">
              <BarChart3 size={14} /> Consulter l'Indice de Démocratie
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-12 px-4 max-w-5xl">
        {/* Section de Synthèse */}
        {data[""] && (
          <div className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            {data[""].map((txt: string, i: number) => (
              <div key={i} className="bg-blue-50 border-l-4 border-blue-500 p-4 text-blue-900 text-sm font-medium italic">
                {txt}
              </div>
            ))}
          </div>
        )}

        {/* Chronologie par blocs */}
        <div className="space-y-20">
          {categories.map((cat) => (
            <section key={cat}>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                  {cat.replace(/_/g, " ")}
                </h2>
                <div className="h-1 flex-1 bg-gradient-to-r from-blue-600 to-transparent"></div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {data[cat].map((event: string, i: number) => {
                  const parts = event.split(':');
                  const point = parts[0];
                  const detail = parts.slice(1).join(':');

                  return (
                    <div key={i} className="group flex items-start gap-4 p-4 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                      <div className="bg-slate-100 text-slate-600 font-mono font-bold px-3 py-1 rounded text-xs shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {point}
                      </div>
                      <p className="text-slate-700 leading-relaxed text-sm md:text-base">
                        {detail}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Note de fin sur la résilience */}
        <footer className="mt-24 p-12 border-t text-center">
          <ShieldCheck size={40} className="mx-auto text-blue-200 mb-4" />
          <p className="text-slate-400 italic text-sm max-w-2xl mx-auto">
            Cette chronologie démontre que la souveraineté populaire n'est pas une invention linéaire mais un savoir-faire de résilience face à la prédation systémique.
          </p>
        </footer>
      </div>
    </div>
  );
}
