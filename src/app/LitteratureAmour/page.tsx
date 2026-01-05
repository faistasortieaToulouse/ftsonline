'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Book, ArrowLeft, Trophy } from 'lucide-react';

interface Livre {
  classement: number;
  titre: string;
}

export default function LitteratureAllemandePage() {
  const [livres, setLivres] = useState<Livre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/LitteratureAmour')
      .then((res) => res.json())
      .then((data) => {
        setLivres(data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  if (loading) return <div className="p-10 text-center text-orange-600 font-bold">Chargement du classement...</div>;

  return (
    <div className="min-h-screen bg-orange-50/30 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        
        <Link href="/" className="flex items-center gap-2 text-orange-700 hover:underline mb-6 font-medium">
          <ArrowLeft size={18} /> Retour au menu
        </Link>

        <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
          <div className="bg-orange-600 p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Book size={28} />
              <h1 className="text-xl md:text-2xl font-bold">Top 100 : Littérature romantique</h1>
            </div>
            <Trophy size={24} className="opacity-50" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-orange-100/50 text-orange-800 text-xs uppercase tracking-wider">
                  <th className="p-4 w-20 text-center border-b border-orange-100">Rang</th>
                  <th className="p-4 border-b border-orange-100">Titre de l'œuvre</th>
                </tr>
              </thead>
              <tbody>
                {livres.map((livre) => (
                  <tr key={livre.classement} className="hover:bg-orange-50/50 transition-colors border-b border-slate-50">
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                        livre.classement <= 3 ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {livre.classement}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-800">
                      {livre.titre}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}