'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowLeft } from 'lucide-react';

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

  if (loading) return <div className="p-10 text-center text-purple-600">Chargement du palmarès...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Retour et Entête */}
        <Link href="/" className="flex items-center gap-2 text-purple-600 hover:underline mb-6">
          <ArrowLeft size={18} /> Retour à l'accueil
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-purple-100">
          <div className="bg-purple-600 p-6 text-white flex items-center gap-4">
            <BookOpen size={32} />
            <h1 className="text-2xl font-bold">Palmarès du Grand Prix Femina</h1>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-purple-50 text-purple-700 uppercase text-xs font-bold">
                  <th className="p-4 border-b">Année</th>
                  <th className="p-4 border-b">Auteur</th>
                  <th className="p-4 border-b">Titre de l'œuvre</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {laureats.map((l, index) => (
                  <tr key={l.annee} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-4 font-mono font-bold text-purple-600">{l.annee}</td>
                    <td className="p-4 font-semibold">{l.auteur}</td>
                    <td className="p-4 italic">
                      {l.titre ? `« ${l.titre} »` : <span className="text-gray-400">N/A</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <footer className="mt-8 text-center text-gray-400 text-sm">
          Source : Data Littérature - FTS Online
        </footer>
      </div>
    </div>
  );
}
