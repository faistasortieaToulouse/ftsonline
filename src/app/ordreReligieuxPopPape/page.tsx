'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Shield, Info } from "lucide-react";

type OrdreReligieuxPopPape = {
  id: number;
  categorie: string;
  siege: string;
  titre: string;
  description: string;
};

export default function OrdreReligieuxPopPapePage() {
  const [donnees, setDonnees] = useState<OrdreReligieuxPopPape[]>([]);

  useEffect(() => {
    fetch("/api/ordreReligieuxPopPape")
      .then((res) => res.json())
      .then(setDonnees);
  }, []);

  return (
    <main className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <nav className="mb-6 max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl md:text-3xl font-black text-slate-900 mb-8 border-b pb-4">
          Le Pape d'Occident et Pops d'Orient
        </h1>

        {/* --- VERSION TABLEAU (VISIBLE SUR PC/TABLETTE) --- */}
        <div className="hidden md:block overflow-hidden bg-white shadow-sm border rounded-xl">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100 text-slate-600 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">ID</th>
                <th className="px-6 py-4 text-left">Catégorie</th>
                <th className="px-6 py-4 text-left">Siège</th>
                <th className="px-6 py-4 text-left">Titre</th>
                <th className="px-6 py-4 text-left">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {donnees.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-400">{item.id}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-1 rounded-full font-bold uppercase">
                      {item.categorie}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{item.siege}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{item.titre}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 leading-relaxed">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- VERSION CARTES (VISIBLE UNIQUEMENT SUR MOBILE) --- */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {donnees.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-l-blue-600 border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-1 rounded font-black uppercase tracking-widest italic">
                  {item.categorie}
                </span>
                <span className="text-gray-300 font-mono text-xs">#{item.id}</span>
              </div>
              
              <h2 className="text-lg font-black text-slate-900 mb-1">{item.titre}</h2>
              
              <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-4">
                <MapPin size={14} className="text-red-500" />
                <span className="font-medium italic">{item.siege}</span>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg flex gap-3">
                <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed italic font-serif">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}