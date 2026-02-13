"use client";
import { useEffect, useState } from 'react';
import { ArrowLeft, Search, BookOpen, Award, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface EducationData {
  rang: number;
  pays: string;
  score_pisa_2018: number;
}

export default function EducationPage() {
  const [data, setData] = useState<EducationData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pays_education')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  const filteredData = data.filter(item =>
    item.pays.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-indigo-50/50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 font-medium transition-colors">
          <ArrowLeft size={20} /> Retour à l'Accueil
        </Link>

        {/* HEADER STATISTIQUE */}
        <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <BookOpen className="text-indigo-600" />
                Classement PISA 2018
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Performance moyenne des élèves de 15 ans (Maths, Sciences, Lecture)
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Filtrer par pays..."
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-full"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* LISTE DES RÉSULTATS */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-indigo-600 text-white text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Rang</th>
                  <th className="px-6 py-4">Nation</th>
                  <th className="px-6 py-4">Score Moyen</th>
                  <th className="px-6 py-4 hidden md:table-cell">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-indigo-300 italic">Analyse des scores en cours...</td>
                  </tr>
                ) : filteredData.map((item) => (
                  <tr key={item.rang} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className={`font-bold ${item.rang <= 10 ? 'text-indigo-600' : 'text-slate-400'}`}>
                        #{item.rang}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {item.rang <= 3 && <Award size={16} className="text-amber-500" />}
                        <span className="font-semibold text-slate-700">{item.pays}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-indigo-700">
                      {item.score_pisa_2018}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell min-w-[200px]">
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${(item.score_pisa_2018 / 600) * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-slate-400 text-xs italic">
          <div className="flex items-center gap-1">
            <BarChart3 size={14} /> Score moyen OCDE : ~488
          </div>
          <div>Données : Programme PISA (OCDE)</div>
        </div>
      </div>
    </div>
  );
}
