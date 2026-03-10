import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe2, Users, Info } from "lucide-react";
import fs from 'fs';
import path from 'path';

async function getImmigrationData() {
  try {
    const filePath = path.join(process.cwd(), "data", "mondecategories", "immigration.json");
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(fileContents);
    }
    return null;
  } catch (error) {
    console.error("Erreur lecture JSON Immigration:", error);
    return null;
  }
}

export default async function ImmigrationPage() {
  const data = await getImmigrationData();

  if (!data) {
    return (
      <div className="p-10 text-center">
        <p className="mb-4 text-red-500 font-bold">Données d'immigration introuvables.</p>
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 underline">
          <ArrowLeft size={18} /> Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-10 bg-white min-h-screen font-sans text-slate-900">
      {/* Navigation */}
      <nav className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-all group uppercase tracking-widest"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Retour à l'Accueil
        </Link>
      </nav>

      {/* Header Statistique */}
      <header className="mb-12 border-l-8 border-blue-600 pl-6 py-2">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2">
          {data.titre}
        </h1>
        <div className="flex items-center gap-4 text-slate-500">
          <Globe2 size={20} className="text-blue-500" />
          <p className="font-bold text-sm uppercase tracking-wide">
            Unité de mesure : <span className="text-blue-600">{data.unite_base}</span>
          </p>
        </div>
      </header>

      

      {/* Tableau des pays */}
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-4 py-5 font-bold text-xs uppercase tracking-widest w-16 text-center">Rang</th>
                <th className="px-6 py-5 font-bold text-xs uppercase tracking-widest">Pays d'accueil</th>
                <th className="px-6 py-5 font-bold text-xs uppercase tracking-widest text-right">nbre (mil.)</th>
                <th className="px-6 py-5 font-bold text-xs uppercase tracking-widest hidden md:table-cell">Analyse & Contexte</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.pays.map((p: any) => (
                <tr key={p.rang} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-block w-8 h-8 leading-8 rounded-full font-black text-[10px] ${
                      p.rang <= 3 ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {p.rang}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                        {p.nom}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-mono font-black text-blue-600 text-lg">
                        {p.stock_immigres_millions.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex items-start gap-2">
                      <Info size={14} className="text-blue-400 mt-1 flex-shrink-0" />
                      <p className="text-sm text-slate-500 leading-snug italic">
                        {p.caracteristique}
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Call to action bas de page */}
      <div className="mt-16 flex flex-col items-center border-t border-slate-100 pt-10 pb-20">
        <div className="flex items-center gap-2 mb-6 text-slate-400">
          <Users size={24} />
          <span className="text-xs font-bold uppercase tracking-widest">Fin de la liste - 100 Pays</span>
        </div>

      </div>

      <footer className="text-center pb-10 text-[10px] text-slate-400 uppercase tracking-[0.2em]">
        Source : Département des affaires économiques et sociales des Nations Unies (DESA) & estimations 2026
      </footer>
    </main>
  );
}
