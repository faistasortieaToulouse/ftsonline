"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Crown, Quote, Sparkles } from "lucide-react";

type Caste = {
  type: string;
  description: string;
  prestige: string;
};

export default function TypeNoblessePage() {
  const [castes, setCastes] = useState<Caste[]>([]);

  useEffect(() => {
    fetch("/api/typeNoblesse")
      .then((res) => res.json())
      .then(setCastes)
      .catch((err) => {
        console.error("Erreur fetch :", err);
        setCastes([]);
      });
  }, []);

  return (
    <main className="p-4 md:p-8 bg-[#f8f7f2] min-h-screen">
      {/* Navigation */}
      <nav className="mb-6 max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-amber-800 hover:text-amber-600 font-bold transition-all group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-2xl md:text-4xl font-serif font-black text-slate-900 mb-2 uppercase tracking-tight">
            Castes de la Noblesse Française
          </h1>
          <div className="h-1 w-20 bg-amber-600 mx-auto md:mx-0"></div>
        </header>

        {/* --- VERSION TABLEAU (PC & TABLETTE) --- */}
        <div className="hidden md:block overflow-hidden bg-white shadow-xl border border-slate-200 rounded-lg">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-900 text-amber-400 uppercase text-[11px] font-bold tracking-[0.1em]">
              <tr>
                <th className="px-6 py-4 text-left">Type de Noblesse</th>
                <th className="px-6 py-4 text-left">Description Historique</th>
                <th className="px-6 py-4 text-center">Prestige</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {castes.map((caste, index) => (
                <tr key={index} className="hover:bg-amber-50/50 transition-colors">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <Crown size={16} className="text-amber-600" />
                      <span className="font-bold text-slate-900">{caste.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-slate-600 text-sm italic font-serif leading-relaxed">
                    {caste.description}
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
                      {caste.prestige}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- VERSION FICHES (MOBILE) --- */}
        <div className="grid grid-cols-1 gap-6 md:hidden">
          {castes.map((caste, index) => (
            <div key={index} className="bg-white border-t-4 border-t-amber-600 rounded-xl shadow-md p-5 relative overflow-hidden">
              <Sparkles className="absolute -right-2 -top-2 text-amber-50 opacity-50" size={80} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <Crown size={18} className="text-amber-600" />
                    {caste.type}
                  </h2>
                </div>

                <div className="flex gap-3 items-start mb-4">
                  <Quote size={20} className="text-amber-200 shrink-0 rotate-180" />
                  <p className="text-sm text-slate-600 font-serif italic leading-relaxed">
                    {caste.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Prestige</span>
                  <span className="text-xs font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                    {caste.prestige}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}