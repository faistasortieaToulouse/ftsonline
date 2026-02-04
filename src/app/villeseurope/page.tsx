"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, MapPin, Users, Calendar } from "lucide-react";

export default function VillesEuropePage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/villeseurope")
      .then((res) => res.json())
      .then((villes) => setData(villes))
      .catch((err) => console.error("Erreur:", err));
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <nav className="mb-8">
        <Link href="/" className="text-blue-600 hover:underline flex items-center gap-2">
          <ArrowLeft size={18} /> Retour au tableau de bord
        </Link>
      </nav>

      <div className="mb-12">
        <h1 className="text-4xl font-extrabold mb-4 flex items-center gap-3 text-slate-900">
          <Building2 className="text-blue-600" size={36} /> 
          Démographie des Villes d'Europe
        </h1>
        <p className="text-slate-600 italic">
          Classement des plus grandes villes de l'Union Européenne par population intra-muros.
        </p>
      </div>

      {/* Remplacement du double .map par une grille simple */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-700">
        {data.map((ville: any, i: number) => (
          <div 
            key={i}
            className="flex flex-col p-5 border rounded-xl bg-white shadow-sm hover:border-blue-500 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 bg-slate-900 text-white text-[10px] font-bold rounded-full">
                  {ville.rank}
                </span>
                <h3 className="font-bold text-slate-800 text-lg">{ville.city}</h3>
              </div>
              <MapPin size={16} className="text-blue-500" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                {ville.country}
              </p>
              
              <div className="flex items-center gap-2 text-blue-600 font-bold">
                <Users size={16} />
                <span>{ville.population} hab.</span>
              </div>

              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-50 text-[10px] text-slate-400">
                <Calendar size={12} />
                Données : {ville.date}
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-20 p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
        <p className="text-sm text-slate-500">
          Source des données : Estimations 2023-2025 basées sur les recensements nationaux (Eurostat / Wikipédia).
        </p>
      </footer>
    </div>
  );
}
