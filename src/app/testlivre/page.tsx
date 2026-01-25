'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowLeft, Award } from 'lucide-react';

interface Laureat {
  annee: number;
  auteur: string;
  titre: string | null;
}

export default function GrandPrixFeminaPage() {
  const [laureats, setLaureats] = useState<Laureat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/GrandPrixFemina')
      .then((res) => res.json())
      .then((data) => {
        setLaureats(data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-purple-600 font-medium">Chargement du palmarès...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 transition-all duration-300">

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto">
        
        {/* Retour et Entête */}
        <Link href="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium transition-colors mb-6 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-purple-100">
          {/* Header du tableau/liste */}
          <div className="bg-purple-600 p-6 text-white flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <BookOpen size={28} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Grand Prix Femina</h1>
              <p className="text-purple-100 text-xs md:text-sm italic">Le palmarès historique</p>
            </div>
          </div>

          {/* --- VERSION TABLEAU (Ordinateurs et Tablettes : md+) --- */}
          <div className="hidden md:block">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-purple-50 text-purple-700 uppercase text-xs font-bold tracking-wider">
                  <th className="p-4 border-b border-purple-100">Année</th>
                  <th className="p-4 border-b border-purple-100">Auteur</th>
                  <th className="p-4 border-b border-purple-100">Titre de l'œuvre</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {laureats.map((l, index) => (
                  <tr 
                    key={l.annee} 
                    className={`hover:bg-purple-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                  >
                    <td className="p-4 font-mono font-bold text-purple-600">{l.annee}</td>
                    <td className="p-4 font-semibold text-slate-800">{l.auteur}</td>
                    <td className="p-4 italic text-slate-600">
                      {l.titre ? `« ${l.titre} »` : <span className="text-gray-400 font-normal">N/A</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- VERSION CARTES (Mobile : < md) --- */}
          <div className="md:hidden divide-y divide-purple-100">
            {laureats.map((l) => (
              <div key={l.annee} className="p-5 bg-white active:bg-purple-50 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-mono font-bold text-sm">
                    {l.annee}
                  </span>
                  <Award size={16} className="text-purple-300" />
                </div>
                <div className="text-lg font-bold text-slate-900 leading-tight">
                  {l.auteur}
                </div>
                <div className="mt-1 text-sm italic text-purple-600 leading-snug">
                  {l.titre ? `« ${l.titre} »` : <span className="text-gray-400 not-italic">Aucune œuvre mentionnée</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <footer className="mt-8 text-center text-gray-400 text-xs md:text-sm flex flex-col gap-1">
          <p>Source : Data Littérature - FTS Online</p>
          <p>© {new Date().getFullYear()} — Prix Littéraires Français</p>
        </footer>
      </div>
    </div>
  );
}
