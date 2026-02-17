import React from 'react';
import { ArrowLeft, Search, Settings, Tractor, Info, Sprout } from 'lucide-react';
import Link from 'next/link';

async function getStyles() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  try {
    const res = await fetch(`${baseUrl}/api/style`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    return null;
  }
}

export default async function StyleArchitecturePage() {
  const styles = await getStyles();

  if (!styles) {
    return (
      <div className="p-10 text-center text-gray-500 italic">
        Chargement de l'encyclopédie des styles...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-900 mb-6 font-medium transition-colors">
          <ArrowLeft size={20} /> Retour à l'Accueil
        </Link>
      
      <div className="max-w-6xl mx-auto">
        
        <header className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight uppercase">
            Histoire de l'Architecture
          </h1>
          <div className="h-1 w-20 bg-amber-500 mx-auto mb-4"></div>
          <p className="text-slate-600 italic">De la Préhistoire à l'ère contemporaine</p>
        </header>

        {/* Grille d'affichage */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {styles.map((style: any) => (
            <div 
              key={style.id} 
              className="bg-white shadow-sm rounded-xl overflow-hidden border border-slate-200 hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Header du Style */}
              <div className="bg-slate-800 px-6 py-4">
                <span className="text-amber-400 text-[10px] font-bold uppercase tracking-widest">
                  {style.periode}
                </span>
                <h2 className="text-xl font-bold text-white leading-tight mt-1">
                  {style.nom}
                </h2>
              </div>

              {/* Contenu */}
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  {style.description}
                </p>

                {/* Section Caractéristiques */}
                <div className="mt-auto">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase mb-3 tracking-tighter">
                    Éléments clés
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {style.caracteristiques.map((trait: string, idx: number) => (
                      <span 
                        key={idx} 
                        className="text-[10px] bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200 font-medium"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Petit identifiant discret en bas */}
              <div className="px-6 py-2 bg-slate-50 border-t border-slate-100">
                <span className="text-[9px] text-slate-400 font-mono">ID: {style.id}</span>
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-20 text-center text-slate-400 text-xs border-t border-slate-200 pt-8">
          <p>© 2026 - Ressources Éducatives Architecture</p>
        </footer>
      </div>
    </div>
  );
}
