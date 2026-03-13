"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Skull } from "lucide-react";

export default function EpidemiePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/epidemie")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center font-mono">Chargement...</div>;

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      {/* Navigation de retour */}
      <nav className="mb-12">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-bold transition-colors">
          <ArrowLeft size={20} /> Retour à l'Accueil
        </Link>
      </nav>

      <div className="bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-sm">
        <header className="mb-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
            <Skull className="text-emerald-600" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 uppercase italic mb-2">
            {data?.titre || "Épidémies"}
          </h1>
          <p className="text-slate-500">
            Consultez les archives historiques des grandes crises sanitaires mondiales.
          </p>
        </header>

        {/* Le lien vers Wikipedia */}
        <a 
          href={data?.source} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-between p-6 bg-emerald-50 border-2 border-emerald-100 rounded-2xl hover:bg-emerald-100 hover:border-emerald-200 transition-all group"
        >
          <div className="flex flex-col">
            <span className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-1">Source Officielle</span>
            <span className="text-lg font-bold text-emerald-900">
              {data?.source ? decodeURIComponent(data.source.split('/').pop()?.replace(/_/g, ' ') || "") : "Lien Wikipédia"}
            </span>
          </div>
          <ExternalLink size={24} className="text-emerald-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </a>
      </div>
    </div>
  );
}
