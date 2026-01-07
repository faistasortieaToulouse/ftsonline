'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowLeft, Search } from 'lucide-react';

interface Laureat {
  annee: number;
  auteur: string;
  titre: string | null;
}

export default function PrixMontyonPage() {
  const [laureats, setLaureats] = useState<Laureat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/PrixMontyonLitteraire')
      .then((res) => res.json())
      .then((data) => {
        // CORRECTION : On cible 'ouvrages_primes' car le JSON est un objet, pas un tableau direct
        if (data && data.ouvrages_primes && Array.isArray(data.ouvrages_primes)) {
          setLaureats(data.ouvrages_primes);
        } else if (Array.isArray(data)) {
          setLaureats(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des données:", err);
        setLoading(false);
      });
  }, []);

  // Filtrage pour la recherche (optionnel mais pratique pour les longues listes)
  const filteredLaureats = laureats.filter(l => 
    l.auteur.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (l.titre && l.titre.toLowerCase().includes(searchTerm.toLowerCase())) ||
    l.annee.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-purple-600 font-bold animate-pulse text-xl">
          Chargement du palmarès Montyon...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation */}
        <Link href="/" className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors mb-6 font-medium">
          <ArrowLeft size={18} /> Retour à l'accueil
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-purple-100">
          
          {/* Header */}
          <div className="bg-purple-600 p-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <BookOpen size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold uppercase tracking-tight">Prix Montyon Littéraire</h1>
                <p className="text-purple-100 text-sm opacity-90">Fondation de l'Académie française</p>
              </div>
            </div>

            {/* Barre de recherche */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-200" size={18} />
              <input 
                type="text"
                placeholder="Rechercher un auteur, une année ou un titre..."
                className="w-full bg-purple-700/50 border border-purple-400/30 rounded-lg py-2 pl-10 pr-4 text-white placeholder:text-purple-300 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Tableau */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-purple-50 text-purple-700 uppercase text-xs font-bold tracking-wider text-nowrap">
                  <th className="p-4 border-b w-24">Année</th>
                  <th className="p-4 border-b">Auteur</th>
                  <th className="p-4 border-b">Titre de l'œuvre</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {filteredLaureats.length > 0 ? (
                  filteredLaureats.map((l, index) => (
                    <tr 
                      key={`${l.annee}-${index}`} // Clé unique combinée
                      className={`group transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-purple-50/50`}
                    >
                      <td className="p-4 font-mono font-bold text-purple-600 border-b border-slate-100">
                        {l.annee}
                      </td>
                      <td className="p-4 font-semibold border-b border-slate-100">
                        {l.auteur}
                      </td>
                      <td className="p-4 italic border-b border-slate-100 text-slate-600">
                        {l.titre ? `« ${l.titre} »` : <span className="text-gray-400">N/A</span>}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-10 text-center text-gray-400">
                      Aucun résultat trouvé pour votre recherche.
                    </td>
                  </tr>
                )}
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