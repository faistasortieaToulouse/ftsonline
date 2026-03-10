import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Wifi, Globe, Smartphone } from "lucide-react";
import fs from 'fs';
import path from 'path';

async function getConnectesData() {
  try {
    const filePath = path.join(process.cwd(), "data", "mondecategories", "connectes.json");
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(fileContents);
    }
    return null;
  } catch (error) {
    return null;
  }
}

export default async function ConnectesPage() {
  const data = await getConnectesData();

  if (!data) {
    return (
      <div className="p-10 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 underline font-bold">
          <ArrowLeft size={18} /> Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-10 bg-slate-50 min-h-screen font-sans">
      {/* Nav */}
      <nav className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 transition-all group uppercase tracking-widest">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Retour à l'Accueil
        </Link>
      </nav>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200">
            <Wifi size={32} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
            {data.titre}
          </h1>
        </div>
        <p className="text-slate-500 font-bold flex items-center gap-2 uppercase text-xs tracking-widest">
          <Globe size={14} /> Unité : {data.unite}
        </p>
      </header>

      

      {/* Tableau avec barres de progression */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-6 py-5 font-bold text-xs uppercase tracking-widest w-20 text-center">Rang</th>
                <th className="px-6 py-5 font-bold text-xs uppercase tracking-widest">Pays</th>
                <th className="px-6 py-5 font-bold text-xs uppercase tracking-widest">Taux & Visualisation</th>
                <th className="px-6 py-5 font-bold text-xs uppercase tracking-widest hidden lg:table-cell">Observations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.donnees.map((item: any) => (
                <tr key={item.rang} className="hover:bg-emerald-50/30 transition-colors group">
                  <td className="px-6 py-6 text-center">
                    <span className={`text-sm font-black ${item.rang <= 3 ? 'text-emerald-600' : 'text-slate-400'}`}>
                      #{item.rang}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="font-bold text-slate-800 group-hover:text-emerald-700">{item.pays}</span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col gap-2 w-full min-w-[150px]">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-black text-slate-900">{item.taux}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            item.taux > 90 ? 'bg-emerald-500' : item.taux > 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${item.taux}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 hidden lg:table-cell italic text-sm text-slate-500 leading-relaxed max-w-xs">
                    {item.observations}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer / CTA */}
      <footer className="mt-16 text-center pb-20">
        <Link 
          href="/" 
          className="inline-flex items-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-emerald-600 transition-all shadow-xl"
        >
          <ArrowLeft size={20} />
          Quitter le rapport
        </Link>
        <p className="mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
          Données consolidées : UIT, Banque Mondiale & rapports nationaux
        </p>
      </footer>
    </main>
  );
}
