import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Zap, TrendingUp, AlertTriangle, Globe } from "lucide-react";
import fs from 'fs';
import path from 'path';

async function getProductiviteData() {
  try {
    const filePath = path.join(process.cwd(), "data", "mondecategories", "productivite.json");
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(fileContents);
    }
    return null;
  } catch (error) {
    return null;
  }
}

export default async function ProductivitePage() {
  const data = await getProductiviteData();

  if (!data) return <div className="p-10 text-center">Données non trouvées.</div>;

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-10 bg-white min-h-screen font-sans text-slate-900">
      {/* Navigation */}
      <nav className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-orange-600 transition-all group uppercase tracking-widest">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Retour à l'Accueil
        </Link>
      </nav>

      {/* Header Dynamique */}
      <header className="mb-12 border-b-4 border-orange-500 pb-8">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4 italic">
          {data.nom}
        </h1>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
            <Zap size={18} className="text-orange-500 shadow-sm" />
            <span className="text-xs font-black uppercase">{data.unite}</span>
          </div>
          <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Mise à jour : Mars 2026
          </div>
        </div>
      </header>

      

      {/* Liste des Données */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-6 py-6 font-black text-[10px] uppercase tracking-[0.2em] w-20 text-center">Rang</th>
                <th className="px-6 py-6 font-black text-[10px] uppercase tracking-[0.2em]">Pays de référence</th>
                <th className="px-6 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-right">Valeur (USD/h)</th>
                <th className="px-6 py-6 font-black text-[10px] uppercase tracking-[0.2em] hidden lg:table-cell">Analyse Particulière</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.donnees.map((p: any) => {
                // Logique de couleur de badge selon la productivité
                let colorClass = "bg-slate-100 text-slate-500";
                if (p.valeur >= 90) colorClass = "bg-orange-500 text-white shadow-lg shadow-orange-100";
                else if (p.valeur >= 40) colorClass = "bg-blue-500 text-white";
                else if (p.valeur < 1) colorClass = "bg-red-100 text-red-600 animate-pulse";

                return (
                  <tr key={`${p.rang}-${p.pays}`} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-block w-10 h-6 leading-6 rounded font-black text-[10px] ${colorClass}`}>
                        {p.rang}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 uppercase text-sm group-hover:text-orange-600 transition-colors">
                          {p.pays}
                        </span>
                        <span className="lg:hidden text-[10px] text-slate-400 italic mt-1 leading-tight">
                          {p.particularite}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-mono font-bold text-lg">
                      {p.valeur.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-5 hidden lg:table-cell">
                      <div className="flex items-start gap-3 text-xs text-slate-500 leading-relaxed italic border-l border-slate-100 pl-4">
                        {p.particularite}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Fin de Liste */}
      <div className="mt-12 mb-20 p-10 bg-slate-900 rounded-3xl text-center text-white">
        <Globe size={40} className="mx-auto mb-4 text-orange-500" />
        <h2 className="text-2xl font-black uppercase mb-4">Fin du rapport mondial</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-8 font-medium leading-relaxed">
          Les écarts de productivité entre les leaders (Irlande) et les zones en crise soulignent la fracture technologique mondiale de 2026.
        </p>
      </div>
    </main>
  );
}
