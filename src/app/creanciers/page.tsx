"use client";
import { useEffect, useState } from 'react';
import { ArrowLeft, Search, Landmark, Trophy, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface CreancierData {
  rang: number;
  pays: string;
  details: string;
}

export default function CreanciersPage() {
  const [data, setData] = useState<CreancierData[]>([]);
  const [filteredData, setFilteredData] = useState<CreancierData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch('/api/creanciers')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setFilteredData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Gestion de la recherche
  useEffect(() => {
    const results = data.filter(item =>
      item.pays.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.details.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(results);
  }, [searchTerm, data]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors mb-4 font-medium"
        >
          <ArrowLeft size={20} />
          Retour à l'Accueil
        </Link>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Landmark className="text-indigo-600" />
              Les Créanciers du Monde (2026)
            </h1>
            <p className="text-slate-500 text-sm mt-1">Classement des nations et entités détentrices de la dette mondiale</p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Rechercher un pays ou un fonds..."
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-80"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* TABLEAU */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4 border-b w-24">Rang</th>
                <th className="px-6 py-4 border-b w-48">Pays / Entité</th>
                <th className="px-6 py-4 border-b">Profil & Détails Financiers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-.3s]" />
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-.5s]" />
                    </div>
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.rang} className="hover:bg-indigo-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className={`w-10 h-8 rounded-lg flex items-center justify-center text-sm font-bold 
                        ${item.rang <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                        {item.rang <= 3 && <Trophy size={14} className="mr-1" />}
                        {item.rang}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {item.pays}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <TrendingUp size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-sm text-slate-600 leading-relaxed italic">
                          {item.details}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-slate-500 italic">
                    Aucun résultat trouvé pour "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER INFO */}
      <div className="max-w-5xl mx-auto mt-6 text-center text-slate-400 text-xs">
        <p>Données compilées d'après les rapports du FMI, du Trésor US et de la BRI (2026)</p>
      </div>
    </div>
  );
}
