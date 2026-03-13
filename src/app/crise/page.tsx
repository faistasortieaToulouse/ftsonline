"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, TrendingDown, Landmark } from "lucide-react";

export default function CrisePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/crise")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center font-mono">Analyse des flux financiers...</div>;

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      {/* Navigation de retour */}
      <nav className="mb-12">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-amber-600 font-bold transition-colors">
          <ArrowLeft size={20} /> Retour à l'Accueil
        </Link>
      </nav>

      <div className="bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-sm">
        <header className="mb-8">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
            <TrendingDown className="text-amber-600" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 uppercase italic mb-2">
            {data?.titre || "Crises Financières"}
          </h1>
          <p className="text-slate-500">
            Étude chronologique des instabilités monétaires et des effondrements boursiers à travers l'histoire.
          </p>
        </header>

        {/* Le lien vers Wikipedia */}
        <a 
          href={data?.source} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-between p-6 bg-amber-50 border-2 border-amber-100 rounded-2xl hover:bg-amber-100 hover:border-amber-200 transition-all group"
        >
          <div className="flex flex-col">
            <span className="text-xs font-black text-amber-700 uppercase tracking-widest mb-1">Source Wikipédia</span>
            <span className="text-lg font-bold text-amber-900">
              {data?.source ? decodeURIComponent(data.source.split('/').pop()?.replace(/_/g, ' ') || "") : "Lien Wikipédia"}
            </span>
          </div>
          <ExternalLink size={24} className="text-amber-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </a>

        <div className="mt-8 p-4 bg-slate-50 rounded-xl flex items-start gap-3">
          <Landmark size={20} className="text-slate-400 shrink-0" />
          <p className="text-xs text-slate-500 leading-relaxed">
            Note : Cette liste inclut les crises bancaires, les bulles spéculatives et les épisodes d'hyperinflation documentés.
          </p>
        </div>
      </div>
    </div>
  );
}
