import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from "lucide-react";
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
    console.error("Erreur lecture JSON:", error);
    return null;
  }
}

export default async function ProductivitePage() {
  const data = await getProductiviteData();

  if (!data) {
    return (
      <div className="p-10 text-center">
        <p className="mb-4 text-red-500 font-bold">Données indisponibles.</p>
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 underline">
          <ArrowLeft size={18} /> Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-10 bg-slate-50 min-h-screen font-sans">
      {/* Navigation avec Lucide ArrowLeft */}
      <nav className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-all group uppercase tracking-widest"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Retour à l'Accueil
        </Link>
      </nav>

      {/* Header */}
      <header className="mb-12 border-b border-slate-200 pb-8">
        <h1 className="text-4xl font-black text-slate-900 leading-tight mb-4">
          {data.titre}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded uppercase tracking-tighter">
            Estimation 2026
          </span>
          <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-3 py-1 rounded uppercase">
            Unité : {data.unite_base}
          </span>
        </div>
      </header>

      {/* Table Section */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-6 py-5 font-bold text-xs uppercase tracking-wider w-20 text-center">Rang</th>
                <th className="px-6 py-5 font-bold text-xs uppercase tracking-wider">Pays de destination</th>
                <th className="px-6 py-5 font-bold text-xs uppercase tracking-wider text-right">Stock (M)</th>
                <th className="px-6 py-5 font-bold text-xs uppercase tracking-wider hidden lg:table-cell">Analyse contextuelle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.pays.map((p: any) => (
                <tr key={p.rang} className="hover:bg-indigo-50/50 transition-colors group">
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block w-8 h-8 leading-8 rounded-lg font-black text-xs ${
                      p.rang <= 3 ? 'bg-amber-400 text-amber-900' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {p.rang}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800 group-hover:text-indigo-700">
                    {p.nom}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-indigo-600">
                    {p.stock_immigres_millions.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 hidden lg:table-cell italic leading-snug">
                    {p.caracteristique}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-16 text-center border-t border-slate-200 pt-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-slate-200"
        >
          <ArrowLeft size={20} />
          Revenir à l'Accueil
        </Link>
        <p className="mt-6 text-slate-400 text-[10px] uppercase tracking-widest font-medium">
          Sources : ONU, Banque Mondiale & Statistiques Nationales (Actualisation Mars 2026)
        </p>
      </div>
    </main>
  );
}
