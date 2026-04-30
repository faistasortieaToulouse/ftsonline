"use client";
import { useEffect, useState } from 'react';
import { ArrowLeft, Search, MapPin, Trophy, Users } from 'lucide-react';
import Link from 'next/link';

interface VilleData {
  rang: number;
  nom: string;
  dept: string;
  pop: string;
  info: string;
}

export default function VillesOccitaniePage() {
  const [data, setData] = useState<VilleData[]>([]);
  const [filteredData, setFilteredData] = useState<VilleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch('/api/villeoccitanie')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setFilteredData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const results = data.filter(item =>
      item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.dept.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(results);
  }, [searchTerm, data]);

  return (
    <div className="min-h-screen bg-orange-50/30 p-4 md:p-8">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-orange-700 hover:text-orange-900 transition-colors mb-4 font-medium"
        >
          <ArrowLeft size={20} />
          Retour au menu
        </Link>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="text-orange-600" />
              Principales Villes d'Occitanie
            </h1>
            <p className="text-slate-500 text-sm mt-1">Démographie et points d'intérêt des communes de la région</p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Rechercher une ville ou un département..."
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none w-full md:w-80"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* TABLEAU */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4 border-b">Rang</th>
                <th className="px-6 py-4 border-b">Ville</th>
                <th className="px-6 py-4 border-b">Département</th>
                <th className="px-6 py-4 border-b">Population</th>
                <th className="px-6 py-4 border-b">Spécificité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce [animation-delay:-.3s]" />
                      <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce [animation-delay:-.5s]" />
                    </div>
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.rang} className="hover:bg-orange-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold 
                        ${item.rang <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                        {item.rang <= 3 && <Trophy size={14} className="mr-1" />}
                        {item.rang}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {item.nom}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {item.dept}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700 font-mono text-sm">
                        <Users size={14} className="text-orange-400" />
                        {item.pop}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 italic">
                      {item.info}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500 italic">
                    Aucune ville trouvée pour "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
