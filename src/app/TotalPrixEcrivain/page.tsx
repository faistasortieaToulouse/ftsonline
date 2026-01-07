'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowLeft, Search, Bookmark, User, Calendar } from 'lucide-react';

interface Laureat {
  année?: number;
  code?: number;
  écrivain?: string;
  titre?: string;
  prix?: string;
}

export default function PalmaresTotalPage() {
  const [laureats, setLaureats] = useState<Laureat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/TotalPrixEcrivain')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setLaureats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = laureats.filter(l => 
    (l.écrivain?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (l.titre?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (l.prix?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-purple-600 font-bold">
      Chargement du palmarès...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        
        <Link href="/" className="flex items-center gap-2 text-purple-600 hover:underline mb-6 font-medium transition-all">
          <ArrowLeft size={18} /> Retour à l'accueil
        </Link>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-100">
          
          {/* Header Violet */}
          <div className="bg-purple-600 p-8 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-5">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                  <BookOpen size={36} />
                </div>
                <div>
                  <h1 className="text-3xl font-black uppercase tracking-tighter">Archives</h1>
                  <p className="text-purple-100 opacity-80 text-sm font-medium uppercase tracking-widest">Total des Prix Littéraires</p>
                </div>
              </div>
              
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-2.5 text-purple-300" size={18} />
                <input 
                  type="text" 
                  placeholder="Auteur, livre, prix..." 
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-purple-200 outline-none focus:bg-white/20 transition-all"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filtered.length > 0 ? (
              filtered.map((l, index) => (
                <div key={index} className="p-5 md:p-6 hover:bg-purple-50/40 transition-colors flex flex-col md:flex-row md:items-center gap-4">
                  
                  {/* Bloc Année / Date */}
                  <div className="flex items-center gap-2 md:w-24 shrink-0">
                    <Calendar size={14} className="text-purple-400 md:hidden" />
                    <span className="font-mono font-black text-lg text-purple-600">
                      {l.année || l.code || <span className="text-slate-300 text-xs font-normal italic">s.d.</span>}
                    </span>
                  </div>

                  {/* Bloc Infos Principales */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <User size={14} className="text-slate-400 shrink-0" />
                      <h3 className="font-bold text-slate-800 leading-tight">
                        {l.écrivain || <span className="text-slate-400 font-normal italic underline decoration-dotted">Auteur non identifié</span>}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bookmark size={14} className="text-purple-400 shrink-0" />
                      <p className="text-slate-600 italic text-sm md:text-base">
                        {l.titre ? `« ${l.titre} »` : <span className="text-slate-300 italic">Titre manquant</span>}
                      </p>
                    </div>
                  </div>

                  {/* Bloc Badge Prix */}
                  <div className="md:w-48 md:text-right shrink-0">
                    <span className="inline-block px-3 py-1 rounded-lg bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-wider border border-purple-200">
                      {l.prix || "Prix non spécifié"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center text-slate-400 italic">
                Aucun résultat trouvé pour votre recherche.
              </div>
            )}
          </div>
        </div>

        <footer className="mt-10 mb-10 text-center">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
            Source : FTS Online — {filtered.length} entrées indexées
          </p>
        </footer>
      </div>
    </div>
  );
}