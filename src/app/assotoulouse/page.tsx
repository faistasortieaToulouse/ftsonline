'use client';

import { useEffect, useState } from "react";
import { ExternalLink, Users, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface HelloAssoSource {
  id: number;
  nom: string;
  description: string;
  type: string;
  url: string;
  color: string;
}

export default function AssoToulousePage() {
  const [sources, setSources] = useState<HelloAssoSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/assotoulouse")
      .then((res) => res.json())
      .then((data) => {
        setSources(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl mb-4">
            <Users size={32} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tight">
            Vie Associative <span className="text-emerald-600">31</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Retrouvez les annuaires et calendriers HelloAsso pour Toulouse et son département.
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sources.map((source) => (
              <a 
                key={source.id} 
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`group relative p-8 border-2 rounded-3xl transition-all hover:shadow-2xl hover:-translate-y-1 bg-white ${source.color.split(' ')[1]}`}
              >
                <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 ${source.color}`}>
                  {source.type}
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">
                  {source.nom}
                </h2>
                
                <p className="text-slate-600 mb-8 leading-relaxed">
                  {source.description}
                </p>

                <div className="flex items-center font-bold text-sm text-slate-900">
                  Consulter sur HelloAsso 
                  <ExternalLink size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>

                <div className="absolute top-8 right-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <MapPin size={48} />
                </div>
              </a>
            ))}
          </div>
        )}

        <footer className="mt-16 text-center text-slate-400 text-sm">
          Données synchronisées avec les plateformes HelloAsso Occitanie.
        </footer>
      </div>
    </div>
  );
}
