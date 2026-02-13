"use client";

import { useEffect, useState } from 'react';
import { ArrowLeft, Search, Scale, Award, Info, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

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
  const [content, setContent] = useState<InegalitesData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pays_indice_inegalites')
      .then(res => res.json())
      .then(json => {
        // Sécurité : si le JSON reçu est directement le tableau de data
        if (Array.isArray(json)) {
          setContent({
            metadata: { title: "Indice de Gini", definition: "", usage_conseille: "" },
            data: json
          });
        } else {
          setContent(json);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur chargement:", err);
        setLoading(false);
      });
  }, []);

  // Filtrage sécurisé
  const listToFilter = content?.data || [];
  const filteredData = listToFilter.filter(item =>
    item.pays.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-8 font-bold transition-all hover:-translate-x-1">
          <ArrowLeft size={20} /> Retour au Dashboard
        </Link>

        {/* HEADER STATISTIQUE */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                <Scale className="text-indigo-600" size={28} />
                {content?.metadata?.title || "Indice de Gini"}
              </h1>
              <p className="text-slate-500 text-sm mt-2 font-medium leading-relaxed">
                {content?.metadata?.definition || "Analyse de la répartition des richesses par nation."}
              </p>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Chercher un pays..."
                className="pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none w-full transition-all text-slate-800"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {content?.metadata?.usage_conseille && (
            <div className="mt-6 flex items-start gap-3 bg-indigo-50 border border-indigo-100 p-4 rounded-2xl text-indigo-900 text-xs font-semibold">
              <AlertTriangle size={18} className="shrink-0 text-indigo-600" />
              <span>{content.metadata.usage_conseille}</span>
            </div>
          )}
        </div>

        {/* LISTE DES RÉSULTATS */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-[0.2em] font-black">
                  <th className="px-8 py-5">Rang</th>
                  <th className="px-8 py-5">Nation</th>
                  <th className="px-8 py-5">Indice Gini</th>
                  <th className="px-8 py-5 hidden md:table-cell text-right">Impact Social</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-slate-400 animate-pulse font-medium italic">
                      Extraction des données mondiales...
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={`${item.rang}-${item.pays}`} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className={`font-black text-lg ${item.rang <= 10 ? 'text-indigo-600' : 'text-slate-300'}`}>
                          #{item.rang}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl drop-shadow-sm group-hover:scale-110 transition-transform">{item.flag}</span>
                          <span className="font-bold text-slate-800 tracking-tight text-base">{item.pays}</span>
                          {item.rang <= 3 && <Award size={18} className="text-amber-500" />}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="font-mono font-black text-xl text-indigo-700">{item.gini.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 hidden md:table-cell text-right">
                        <div className="flex items-center justify-end gap-3">
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                            item.gini < 30 ? 'bg-emerald-100 text-emerald-700' : 
                            item.gini < 45 ? 'bg-amber-100 text-amber-700' : 
                            'bg-rose-100 text-rose-700'
                          }`}>
                            {item.gini < 30 ? 'Égalitaire' : item.gini < 45 ? 'Modéré' : 'Critique'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold">
                      Aucun pays trouvé pour "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 text-center">
           <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2">
             <Info size={14} /> Sources : Banque Mondiale & CIA World Factbook 2026
           </p>
        </div>
      </div>
    </div>
  );
}
