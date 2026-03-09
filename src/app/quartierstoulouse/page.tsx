"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, LayoutGrid, Info, Landmark, TrendingDown, Home } from "lucide-react";

export default function QuartiersToulousePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/quartierstoulouse")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-20 text-center font-mono animate-pulse">Cartographie des quartiers...</div>;
  if (!data || data.error) return <div className="p-20 text-center text-red-500 font-bold">Erreur de chargement.</div>;

  // Conversion de l'objet en tableau trié
  const quartiers = Object.entries(data).map(([key, value]: [string, any]) => ({
    rang: parseInt(key.replace("rang_", "")),
    ...value
  })).sort((a, b) => a.rang - b.rang);

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <nav className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold transition-colors">
          <ArrowLeft size={20} /> Retour
        </Link>
      </nav>

      <header className="mb-12 border-b-4 border-blue-900 pb-6">
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
          <LayoutGrid className="text-blue-600" /> Les 70 Quartiers de Toulouse
        </h1>
        <p className="text-slate-500 font-medium mt-2">Analyse de la stratification urbaine et des dynamiques sociales</p>
      </header>

      {/* GRILLE DES QUARTIERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quartiers.map((q) => {
          // Logique de couleur selon le rang (Aisé vs Fragile)
          const isTop = q.rang <= 10;
          const isBottom = q.rang >= 60;

          return (
            <div 
              key={q.rang} 
              className={`p-5 rounded-2xl border-2 transition-all hover:shadow-lg ${
                isTop ? "border-blue-100 bg-blue-50/30" : 
                isBottom ? "border-red-100 bg-red-50/30" : "border-slate-100 bg-white"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                  isTop ? "bg-blue-600 text-white" : 
                  isBottom ? "bg-red-600 text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  RANG {q.rang}
                </span>
                {q.revenu_median && (
                  <span className="text-[10px] font-mono font-bold text-red-600 bg-white px-2 py-0.5 rounded border border-red-200">
                    {q.revenu_median}€ / an
                  </span>
                )}
              </div>

              <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight uppercase tracking-tighter">
                {q.quartier}
              </h3>

              <div className="space-y-3">
                {q.habitat && (
                  <div className="flex items-start gap-2">
                    <Home size={14} className="text-slate-400 mt-1 shrink-0" />
                    <p className="text-xs text-slate-600"><span className="font-bold">Habitat :</span> {q.habitat}</p>
                  </div>
                )}
                
                {q.dynamique && (
                  <div className="flex items-start gap-2">
                    <TrendingDown size={14} className={`mt-1 shrink-0 ${isBottom ? 'text-red-400' : 'text-blue-400'}`} />
                    <p className="text-xs text-slate-600"><span className="font-bold">Dynamique :</span> {q.dynamique}</p>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <Info size={14} className="text-slate-400 mt-1 shrink-0" />
                  <p className="text-xs text-slate-700 bg-white/50 p-2 rounded-lg italic">
                    {q.profil}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER ANALYTIQUE */}
      <footer className="mt-16 p-8 bg-slate-900 rounded-3xl text-white">
        <div className="flex items-center gap-4 mb-4">
          <Landmark className="text-blue-400" size={30} />
          <h2 className="text-2xl font-bold uppercase tracking-widest">Note Méthodologique</h2>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed italic">
          Cette liste reflète la hiérarchie sociale de Toulouse en 2026. La ville présente une fracture Nord-Sud marquée et une gentrification croissante des faubourgs (Bonnefoy, Saint-Cyprien). Le Mirail reste l'un des ensembles les plus fragiles de France, malgré les plans de rénovation urbaine successifs.
        </p>
      </footer>
    </div>
  );
}
