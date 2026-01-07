'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowLeft } from 'lucide-react';

interface Laureat {
  annee: number;
  auteur: string;
  ouvrage: string | null;
}

export default function PrixFlorePage() { // Renommé pour plus de clarté
  const [laureats, setLaureats] = useState<Laureat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/PrixRenaissance')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLaureats(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center text-purple-600 font-bold">Chargement du palmarès...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Retour et Entête */}
        <Link href="/" className="flex items-center gap-2 text-purple-600 hover:underline mb-6 font-medium">
          <ArrowLeft size={18} /> Retour à l'accueil
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-purple-100">
          <div className="bg-purple-600 p-6 text-white flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <BookOpen size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-tight">Prix de la Renaissance</h1>
              <p className="text-purple-100 text-sm opacity-80">Palmarès des auteurs prometteurs</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-purple-50 text-purple-700 uppercase text-xs font-bold tracking-wider">
                  <th className="p-4 border-b w-24">Année</th>
                  <th className="p-4 border-b">Auteur</th>
                  <th className="p-4 border-b">Titre de l'œuvre</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {laureats.map((l, index) => (
                  /* CORRECTION : key={index} au lieu de l.annee */
                  <tr key={index} className={`group transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-purple-50/50`}>
                    <td className="p-4 font-mono font-bold text-purple-600 border-b border-slate-100">
                      {l.annee}
                    </td>
                    <td className="p-4 font-semibold border-b border-slate-100">
                      {l.auteur}
                    </td>
                    <td className="p-4 italic border-b border-slate-100 text-slate-600">
                      {l.ouvrage ? `« ${l.ouvrage} »` : <span className="text-gray-400">N/A</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <footer className="mt-8 text-center text-gray-400 text-xs uppercase tracking-widest">
          Source : Data Littérature — FTS Online
        </footer>
      </div>
    </div>
  );
}