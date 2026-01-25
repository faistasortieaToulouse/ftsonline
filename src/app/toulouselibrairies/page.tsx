'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ExternalLink, Bookmark, Library, ArrowLeft } from "lucide-react";

interface Librairie {
  nom: string;
  type: string;
  url: string;
}

export default function ToulouseLibrairiesPage() {
  const [data, setData] = useState<Librairie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/toulouselibrairies")
      .then((res) => res.json())
      .then((sorted) => {
        setData(sorted);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCF8] py-12 px-4">

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto">
        
        {/* Header Style "Bibliothèque" */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 text-amber-800 rounded-full mb-4 shadow-sm">
            <Library size={32} />
          </div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">
            Librairies de <span className="text-amber-700 underline decoration-amber-200">Toulouse</span>
          </h1>
          <p className="text-slate-600 font-medium">L'annuaire complet des passeurs de culture de la ville rose.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20 italic text-amber-800 animate-pulse">
            Ouverture de la bibliothèque...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((lib, i) => (
              <a 
                key={i} 
                href={lib.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group bg-white border border-amber-100 rounded-xl p-6 transition-all hover:shadow-lg hover:border-amber-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-1 rounded">
                      {lib.type}
                    </span>
                    <Bookmark size={16} className="text-amber-100 group-hover:text-amber-400 transition-colors" />
                  </div>
                  
                  <h2 className="text-xl font-bold text-slate-800 group-hover:text-amber-900 transition-colors mb-2">
                    {lib.nom}
                  </h2>
                </div>

                <div className="flex items-center gap-2 mt-4 text-sm font-bold text-amber-700 opacity-80 group-hover:opacity-100">
                  <BookOpen size={14} />
                  <span>Visiter le site</span>
                  <ExternalLink size={12} className="ml-auto" />
                </div>
              </a>
            ))}
          </div>
        )}

        <footer className="mt-20 text-center border-t border-amber-100 pt-10">
          <p className="text-slate-400 text-xs italic">
            "Lire, c'est voyager ; voyager, c'est lire." — {data.length} adresses toulousaines répertoriées.
          </p>
        </footer>

      </div>
    </div>
  );
}