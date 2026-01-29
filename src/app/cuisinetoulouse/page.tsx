"use client";
import React, { useEffect, useState } from 'react';
import { Utensils, ChevronRight, ChefHat, ArrowLeft } from 'lucide-react';

export default function CuisinePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cuisinetoulouse')
      .then(res => res.json())
      .then(json => {
        setData(json.cuisine_toulousaine);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center">Chargement des saveurs...</div>;

  return (
    <div className="min-h-screen bg-orange-50/30 py-12 px-4">
      
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-orange-800 hover:text-orange-600 transition-colors font-sans font-bold uppercase text-xs tracking-widest">
            <ArrowLeft size={16} />
            Retour à l'Accueil
          </Link>
        </div>
      </nav>
      
      <div className="max-w-6xl mx-auto">
        
        {/* En-tête */}
        <div className="text-center mb-16">
          <ChefHat className="w-12 h-12 mx-auto text-orange-600 mb-4" />
          <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">
            Gastronomie <span className="text-orange-600">Toulousaine</span>
          </h1>
          <p className="text-slate-500 italic mt-2">Le répertoire gourmand de la Ville Rose</p>
        </div>

        {/* Grille des catégories */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {Object.entries(data).map(([key, value]: [string, any]) => (
            <section key={key} className="break-inside-avoid bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-orange-600 p-4">
                <h2 className="text-white font-bold capitalize flex items-center gap-2">
                  <Utensils className="w-4 h-4" />
                  {key.replace(/_/g, ' ')}
                </h2>
              </div>
              
              <div className="p-4">
                {/* Si la valeur est un tableau simple */}
                {Array.isArray(value) ? (
                  <ul className="space-y-2">
                    {value.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <ChevronRight className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  /* Si la valeur est un objet (sous-catégories) */
                  Object.entries(value).map(([subKey, items]: [string, any]) => (
                    <div key={subKey} className="mb-4 last:mb-0">
                      <h3 className="text-[10px] uppercase font-black text-orange-400 mb-2 tracking-widest">
                        {subKey.replace(/_/g, ' ')}
                      </h3>
                      <ul className="space-y-2">
                        {items.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                            <ChevronRight className="w-4 h-4 text-orange-300 mt-0.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
