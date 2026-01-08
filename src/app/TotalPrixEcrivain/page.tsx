'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowLeft, Award } from 'lucide-react';

interface Laureat {
  annee: number | null;
  auteur: string | null;
  titre: string | null;
  prix: string | null;
}

export default function TotalPrixEcrivainPage() {
  const [laureats, setLaureats] = useState<Laureat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/TotalPrixEcrivain')
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

  if (loading) {
    return (
      <div className="p-10 text-center text-purple-600 font-bold">
        Chargement du palmarès...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Retour */}
        <Link
          href="/"
          className="flex items-center gap-2 text-purple-600 hover:underline mb-6 font-medium"
        >
          <ArrowLeft size={18} />
          Retour à l&apos;accueil
        </Link>

        {/* Carte principale */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-purple-100">
          
          {/* En-tête */}
          <div className="bg-purple-600 p-6 text-white flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <Award size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-tight">
                Palmarès — Prix littéraires
              </h1>
              <p className="text-purple-100 text-sm opacity-80">
                Total des prix par écrivain
              </p>
            </div>
          </div>

          {/* Tableau */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-purple-50 text-purple-700 uppercase text-xs font-bold tracking-wider">
                  <th className="p-4 border-b w-24">Année</th>
                  <th className="p-4 border-b">Auteur</th>
                  <th className="p-4 border-b">Œuvre</th>
                  <th className="p-4 border-b">Prix</th>
                </tr>
              </thead>

              <tbody className="text-gray-700">
                {laureats.map((l, index) => (
                  <tr
                    key={`${l.annee}-${l.auteur}-${index}`}
                    className={`transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    } hover:bg-purple-50/50`}
                  >
                    <td className="p-4 font-mono font-bold text-purple-600 border-b border-slate-100">
                      {l.annee ?? '—'}
                    </td>

                    <td className="p-4 font-semibold border-b border-slate-100">
                      {l.auteur ?? 'Inconnu'}
                    </td>

                    <td className="p-4 italic border-b border-slate-100 text-slate-600">
                      {l.titre ? `« ${l.titre} »` : '—'}
                    </td>

                    <td className="p-4 border-b border-slate-100 text-purple-700 font-medium">
                      {l.prix ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-400 text-xs uppercase tracking-widest">
          Source : Data Littérature — FTS Online
        </footer>
      </div>
    </div>
  );
}
