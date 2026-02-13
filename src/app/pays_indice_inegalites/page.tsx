"use client";

import { useEffect, useState } from 'react';
import { ArrowLeft, Search, Scale, Award, Info, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

// Interfaces pour la sécurité du typage
interface PaysGini {
  rang: number;
  pays: string;
  gini: number;
  flag: string;
}

interface InegalitesData {
  metadata: {
    title: string;
    definition: string;
    usage_conseille: string;
  };
  data: PaysGini[];
}

export default function InegalitesPage() {
  // On initialise à null, mais on gère le cas dans le filter
  const [data, setData] = useState<InegalitesData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pays_indice_inegalites')
      .then(res => {
        if (!res.ok) throw new Error("Erreur de chargement");
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // CORRECTION : On vérifie si data ET data.data existent avant de filtrer
  const filteredData = data?.data ? data.data.filter(item =>
    item.pays.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="min-h-screen bg-indigo-50/50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* LIEN RETOUR */}
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 font-medium transition-colors">
          <ArrowLeft size={20} /> Retour à l'Accueil
        </Link>

        {/* HEADER STATISTIQUE */}
        <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <Scale className="text-indigo-600" />
                {data?.metadata?.title || "Indice de Gini"}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {data?.metadata?.definition || "Chargement de la définition..."}
              </p>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Chercher un pays..."
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-full text-slate-700"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* BANDEAU CONSEIL */}
          {data?.metadata?.usage_conseille && (
            <div className="mt-4 flex items-start gap-3 bg-amber-50 border border-amber-100 p-3 rounded-xl text-amber-800 text-xs italic">
              <AlertTriangle size={16} className="shrink-0" />
              <span><strong>Calcul Niveau de Vie :</strong> {data.metadata.usage_conseille}</span>
            </div>
          )}
        </div>

        {/* LISTE DES RÉSULTATS */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-indigo-600 text-white text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Rang</th>
                  <th className="px-6 py-4">Nation</th>
                  <th className="px-6 py-4">Indice Gini</th>
                  <th className="px-6 py-4 hidden md:table-cell">Impact Social</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-indigo-300 italic">
                      Analyse des inégalités en cours...
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={item.rang} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className={`font-bold ${item.rang <= 10 ? 'text-indigo-600' : 'text-slate-400'}`}>
                          #{item.rang}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{item.flag}</span>
                          <span className="font-semibold text-slate-700">{item.pays}</span>
                          {item.rang <= 3 && <Award size={16} className="text-amber-500" />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-indigo-700">{item.gini}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold md:hidden">Points Gini</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden max-w-[100px]">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${
                                item.gini < 30 ? 'bg-emerald-500' : item.gini < 45 ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${item.gini}%` }}
                            />
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            item.gini < 30 ? 'bg-emerald-50 text-emerald-700' : 
                            item.gini < 45 ? 'bg-amber-50 text-amber-700' : 
                            'bg-rose-50 text-rose-700'
                          }`}>
                            {item.gini < 30 ? 'Égalitaire' : item.gini < 45 ? 'Modéré' : 'Critique'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      Aucun pays ne correspond à votre recherche.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-slate-400 text-xs italic">
          <div className="flex items-center gap-1">
            <Info size={14} /> Sources : Banque Mondiale & CIA World Factbook
          </div>
        </div>
      </div>
    </div>
  );
}
