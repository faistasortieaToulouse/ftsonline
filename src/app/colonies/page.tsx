import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Landmark, History, Map, Info } from "lucide-react";
import fs from 'fs';
import path from 'path';

async function getColoniesData() {
  try {
    const filePath = path.join(process.cwd(), "data", "mondecategories", "colonies.json");
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(fileContents);
    }
    return null;
  } catch (error) {
    return null;
  }
}

export default async function ColoniesPage() {
  const data = await getColoniesData();

  if (!data) return <div className="p-10 text-center font-bold">Données indisponibles.</div>;

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-10 bg-stone-50 min-h-screen font-serif text-stone-900">
      {/* Nav */}
      <nav className="mb-8 font-sans">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-stone-400 hover:text-amber-800 transition-all uppercase tracking-widest">
          <ArrowLeft size={16} /> Retour à l'Acceuil
        </Link>
      </nav>

      {/* Header */}
      <header className="mb-12 border-b-2 border-amber-200 pb-8">
        <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight mb-2 text-stone-800">
          {data.titre}
        </h1>
        <p className="text-stone-500 italic text-lg">{data.description}</p>
      </header>

      

      {/* Grille des Empires */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.empires.map((empire: any, index: number) => (
          <div key={index} className="bg-white border-l-4 border-amber-500 p-6 shadow-sm hover:shadow-md transition-shadow rounded-r-xl border border-stone-200">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-stone-900">{empire.nom}</h2>
              {empire.periode && (
                <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-bold font-sans">
                  {empire.periode}
                </span>
              )}
            </div>

            {/* Zones Majeures ou Entités */}
            <div className="flex items-start gap-2 mb-4">
              <Map size={18} className="text-amber-600 mt-1 shrink-0" />
              <div className="flex flex-wrap gap-1">
                {(empire.zones_majeures || empire.entites || empire.exemples || []).map((zone: string, i: number) => (
                  <span key={i} className="text-sm bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-100 italic">
                    {zone}
                  </span>
                ))}
              </div>
            </div>

            {/* Points clés ou Observations */}
            <div className="bg-stone-50 p-4 rounded-lg border border-stone-100">
              <div className="flex gap-2 items-start text-sm leading-relaxed text-stone-700 italic">
                <Info size={16} className="text-stone-400 mt-1 shrink-0" />
                <p>{empire.points_cles || empire.observations || empire.note || "Analyse en cours..."}</p>
              </div>
            </div>

            {/* Cas particulier Empire Ottoman */}
            {empire.structure && (
              <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-1">
                <Landmark size={12} /> Structure : {empire.structure}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-20 text-center pb-10 font-sans border-t border-stone-200 pt-10">
        <History size={40} className="mx-auto text-stone-300 mb-4" />
        <p className="text-stone-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
          Document de synthèse historique – Archives Numériques 2026
        </p>
      </footer>
    </main>
  );
}
