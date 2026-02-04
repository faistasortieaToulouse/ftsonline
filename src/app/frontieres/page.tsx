'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Globe, ExternalLink, MapPin, Anchor, Info, AlertCircle } from "lucide-react";

export default function FrontieresPage() {
  const [frontieres, setFrontieres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/frontieres")
      .then(res => res.json())
      .then(data => {
        setFrontieres(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur chargement frontières:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900">
      
      {/* Navigation Retour */}
      <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-8 transition-colors font-medium group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour à l'accueil
      </Link>

      {/* Header avec lien Wikipédia */}
      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-black flex items-center gap-4 text-slate-900 tracking-tighter">
              <Globe className="text-indigo-500" size={48} /> 
              Frontières <span className="text-indigo-600">Françaises</span>
            </h1>
            <p className="text-slate-500 mt-4 text-lg max-w-2xl leading-relaxed">
              Exploration des limites territoriales de la France à travers le monde, incluant les frontières terrestres, maritimes et les zones contestées.
            </p>
          </div>

          <a 
            href="https://fr.wikipedia.org/wiki/Frontières_de_la_France" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white border-2 border-indigo-100 text-indigo-700 px-6 py-3 rounded-2xl font-bold hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm shrink-0"
          >
            Source Wikipédia <ExternalLink size={18} />
          </a>
        </div>
      </header>

      {/* Grille des Frontières */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p>Chargement des données géopolitiques...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {frontieres.map((f, i) => (
            <div 
              key={i} 
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Badge Type de Frontière */}
              <div className={`h-2 w-full ${f.type.includes('Terrestre') ? 'bg-emerald-500' : 'bg-blue-500'}`} />
              
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-xl text-slate-800 tracking-tight">{f.pays}</h3>
                  <div className={`p-2 rounded-xl ${f.type.includes('Terrestre') ? 'bg-emerald-50' : 'bg-blue-50'}`}>
                    {f.type.includes('Terrestre') ? 
                      <MapPin size={20} className="text-emerald-600" /> : 
                      <Anchor size={20} className="text-blue-600" />
                    }
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-black mb-1">Localisation</span>
                    <span className="text-sm font-semibold text-slate-700 bg-slate-50 px-2 py-1 rounded-md inline-block">
                      {f.zone}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-black mb-1">Nature du tracé</span>
                    <span className="text-sm font-bold text-indigo-600">
                      {f.type}
                    </span>
                  </div>

                  {/* Notes Spécifiques */}
                  {f.notes && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex gap-2">
                      <AlertCircle size={14} className="text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-500 leading-relaxed italic">
                        {f.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer / Disclaimer */}
      <footer className="mt-20 py-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs italic">
        <p>© 2026 FTS Online - Données synthétisées depuis Wikipédia.</p>
        <div className="flex gap-6">
          <span className="flex items-center gap-1"><MapPin size={12} className="text-emerald-500" /> Terrestre</span>
          <span className="flex items-center gap-1"><Anchor size={12} className="text-blue-500" /> Maritime</span>
        </div>
      </footer>
    </div>
  );
}
