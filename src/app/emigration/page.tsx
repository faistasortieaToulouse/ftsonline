import React from 'react';
import Link from 'next/link';
import { ArrowLeft, MoveUpRight, MapPin, Users, Globe } from "lucide-react";
import fs from 'fs';
import path from 'path';

async function getEmigrationData() {
  try {
    const filePath = path.join(process.cwd(), "data", "mondecategories", "emigration.json");
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(fileContents);
    }
    return null;
  } catch (error) {
    return null;
  }
}

export default async function EmigrationPage() {
  const data = await getEmigrationData();

  if (!data) return <div className="p-10 text-center font-bold">Données indisponibles.</div>;

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-10 bg-slate-50 min-h-screen font-sans">
      {/* Navigation */}
      <nav className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-[0.2em]">
          <ArrowLeft size={16} /> Retour à l'Accueil
        </Link>
      </nav>

      {/* Header avec taille réduite comme demandé */}
      <header className="mb-12">
        <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-4 italic text-slate-900 border-l-8 border-indigo-600 pl-6">
          {data.titre}
        </h1>
        <div className="flex items-center gap-3 text-indigo-600 bg-indigo-50 w-fit px-4 py-2 rounded-lg border border-indigo-100">
          <Users size={18} />
          <span className="text-sm font-bold uppercase tracking-widest">{data.unite_stock}</span>
        </div>
      </header>

      

      {/* Tableau des Flux */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest text-center w-20">Rang</th>
                <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest">Pays d'Origine</th>
                <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest text-center">Stock (M)</th>
                <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest">Principales Destinations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.donnees.map((item: any) => (
                <tr key={item.rang} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-6 py-6 text-center">
                    <span className="text-sm font-black text-slate-400 group-hover:text-indigo-600">#{item.rang}</span>
                  </td>
                  <td className="px-6 py-6 font-black text-slate-800 uppercase text-sm">
                    {item.pays_origine}
                    {item.note && (
                      <span className="block text-[10px] font-bold text-indigo-400 normal-case italic mt-1">
                        {item.note}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="inline-flex items-center justify-center px-3 py-1 bg-slate-100 rounded-full font-mono font-bold text-slate-700">
                      {item.emigrants_millions}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-wrap gap-2">
                      {item.destinations.map((dest: string, idx: number) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-bold text-slate-600 shadow-sm group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all">
                          <MapPin size={10} className="text-indigo-400" />
                          {dest}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer avec rappel de sortie */}
      <footer className="mt-16 text-center pb-20 border-t border-slate-200 pt-10">
        <div className="inline-block p-4 rounded-full bg-slate-100 mb-6">
          <Globe size={30} className="text-slate-400" />
        </div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mb-8">
          Source : UN Migration Report & National Census Data 2026
        </p>
      </footer>
    </main>
  );
}
