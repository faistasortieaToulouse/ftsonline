'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Book, ArrowLeft, Trophy, Search } from 'lucide-react';

interface Livre {
  classement: number;
  titre: string;
}

export default function LitteratureAllemandePage() {
  const [livres, setLivres] = useState<Livre[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/LitteraturePhilosophie')
      .then((res) => res.json())
      .then((data) => {
        setLivres(data);
        setLoading(false);
      })
      .catch((err) => console.error("Erreur chargement:", err));
  }, []);

  // Filtrage pour la recherche
  const filteredLivres = livres.filter(livre =>
    livre.titre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 text-center text-orange-600 font-bold">Chargement des 100 ouvrages...</div>;

  return (
    <div className="min-h-screen bg-orange-50/30 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <Link href="/" className="flex items-center gap-2 text-orange-700 hover:underline font-medium">
            <ArrowLeft size={18} /> Retour au menu
          </Link>
          
          {/* Barre de recherche dynamique */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" size={18} />
            <input 
              type="text"
              placeholder="Rechercher un titre..."
              className="pl-10 pr-4 py-2 border-2 border-orange-100 rounded-full focus:outline-none focus:border-orange-400 w-full md:w-64"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
          <div className="bg-orange-600 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <Book size={32} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Top 100 Littérature de Philosophie</h1>
                <p className="text-orange-100 text-sm">Les chefs-d'œuvre incontournables</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-[0.2em] font-bold">
                  <th className="p-4 w-24 text-center border-b">Position</th>
                  <th className="p-4 border-b text-left">Titre de l'œuvre</th>
                </tr>
              </thead>
              <tbody>
                {filteredLivres.map((livre, index) => (
                  <tr key={index} className="group hover:bg-orange-50/30 transition-colors border-b border-slate-50">
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-black shadow-sm ${
                        // Si le classement est 1, 2 ou 3, on met une couleur spéciale
                        (livre.classement || index + 1) <= 3 
                          ? 'bg-orange-500 text-white ring-4 ring-orange-100' 
                          : 'bg-slate-100 text-slate-600 group-hover:bg-white'
                      }`}>
                        {/* Sécurité : si livre.classement est vide, on prend l'index + 1 */}
                        {livre.classement || index + 1}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-800 text-lg">
                      {livre.titre}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredLivres.length === 0 && (
              <div className="p-10 text-center text-slate-400 italic">
                Aucun livre ne correspond à votre recherche.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}