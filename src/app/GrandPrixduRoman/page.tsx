'use client';

import { useEffect, useState } from 'react';

interface PrixLitteraire {
  annee: number;
  auteur: string;
  titre: string | null;
}

export default function GrandPrixPage() {
  const [laureats, setLaureats] = useState<PrixLitteraire[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/GrandPrixduRoman')
      .then((res) => res.json())
      .then((data) => {
        setLaureats(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center">Chargement des chefs-d'œuvre...</div>;

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-serif font-bold mb-8 text-center border-b-2 border-amber-200 pb-4">
        Grand Prix du Roman de l'Académie Française
      </h1>

      <div className="overflow-x-auto shadow-xl rounded-lg border border-gray-200">
        <table className="min-w-full bg-white leading-normal">
          <thead>
            <tr className="bg-amber-50 text-amber-900 uppercase text-sm">
              <th className="px-5 py-3 text-left font-bold">Année</th>
              <th className="px-5 py-3 text-left font-bold">Auteur</th>
              <th className="px-5 py-3 text-left font-bold">Titre de l'ouvrage</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {laureats.map((prix, index) => (
              <tr key={`${prix.annee}-${index}`} className="hover:bg-amber-50 transition-colors border-b border-gray-100">
                <td className="px-5 py-4 font-mono font-bold text-amber-700">
                  {prix.annee}
                </td>
                <td className="px-5 py-4 font-semibold">
                  {prix.auteur}
                </td>
                <td className="px-5 py-4 italic">
                  {prix.titre || <span className="text-gray-400">Non décerné</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}