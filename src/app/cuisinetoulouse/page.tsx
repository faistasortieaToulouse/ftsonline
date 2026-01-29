"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChefHat, ArrowLeft, UtensilsCrossed, Search, MapPin } from 'lucide-react';

export default function CuisineToulousePage() {
  const [categories, setCategories] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cuisinetoulouse')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => console.error("Erreur chargement cuisine:", err));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-[#fdfaf6]">
      <div className="animate-bounce text-orange-800 font-bold italic">Préparation du service...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdfaf6] text-slate-800 font-serif">
      
      {/* Barre de navigation haute */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-orange-800 hover:text-orange-600 transition-colors font-sans font-bold uppercase text-xs tracking-widest">
            <ArrowLeft size={16} />
            Retour à l'Accueil
          </Link>
          <div className="flex items-center gap-2 text-slate-400 font-sans text-[10px] uppercase tracking-tighter">
            <MapPin size={12} />
            Toulouse, Haute-Garonne
          </div>
        </div>
      </nav>

{/* En-tête Style Menu de Restaurant */}
<header className="py-16 px-4 text-center border-b-2 border-double border-orange-200 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
  <ChefHat className="w-12 h-12 mx-auto text-orange-800 mb-6" />
  
  <p className="text-orange-800 font-sans font-bold uppercase tracking-[0.3em] text-xs mb-2">
    Les spécialités culinaires à Toulouse
  </p>

  <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter uppercase">
    Carte des <span className="text-orange-800">Saveurs</span>
  </h1>
  
  <div className="w-24 h-1 bg-orange-800 mx-auto mb-6"></div>

  {/* Ta question intégrée ici */}
  <div className="mb-4">
    <span className="text-orange-700/60 font-serif italic text-sm">
      Connais-tu la cuisine à Toulouse ?
    </span>
  </div>
  
  <p className="max-w-xl mx-auto text-lg text-slate-600 italic">
    "De la saucisse au cassoulet, découvrez l'âme gourmande du Pays de Cocagne."
  </p>
</header>

      {/* Recherche */}
      <div className="max-w-md mx-auto -mt-6 px-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-800 group-focus-within:scale-110 transition-transform" size={18} />
          <input 
            type="text"
            placeholder="Rechercher un plat, une liqueur..."
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-orange-200 rounded-full shadow-xl focus:outline-none focus:border-orange-800 transition-all font-sans"
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          />
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-16 px-6">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {Object.entries(categories).map(([catName, content]: [string, any]) => {
            
            // Logique de filtrage simple pour la recherche
            const hasMatch = JSON.stringify(content).toLowerCase().includes(searchTerm);
            if (searchTerm && !hasMatch) return null;

            return (
              <section key={catName} className="break-inside-avoid bg-white border border-orange-100 p-8 shadow-sm hover:shadow-xl transition-all relative group">
                {/* Décoration d'angle */}
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <UtensilsCrossed size={40} />
                </div>

                <h2 className="text-2xl font-bold text-orange-900 border-b border-orange-100 pb-4 mb-6 capitalize decoration-double decoration-orange-200 underline-offset-8 underline">
                  {catName.replace(/_/g, ' ')}
                </h2>

                {Array.isArray(content) ? (
                  <ul className="space-y-3">
                    {content.map((item: string, i) => (
                      <li key={i} className="flex justify-between items-baseline gap-2 group/item">
                        <span className="text-slate-700 group-hover/item:text-orange-800 transition-colors">{item}</span>
                        <div className="flex-1 border-b border-dotted border-slate-200"></div>
                        <span className="text-[10px] text-orange-300 font-sans">Spécialité</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  Object.entries(content).map(([subTitle, items]: [string, any]) => (
                    <div key={subTitle} className="mb-8 last:mb-0">
                      <h3 className="text-xs font-black uppercase text-orange-400 mb-4 tracking-[0.2em] flex items-center gap-2">
                        <span className="w-4 h-[1px] bg-orange-200"></span>
                        {subTitle.replace(/_/g, ' ')}
                      </h3>
                      <ul className="space-y-3">
                        {items.map((item: string, i: number) => (
                          <li key={i} className="flex justify-between items-baseline gap-2 group/item">
                            <span className="text-slate-700 group-hover/item:text-orange-800 transition-colors">{item}</span>
                            <div className="flex-1 border-b border-dotted border-slate-200"></div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </section>
            );
          })}
        </div>
      </main>

      <footer className="bg-slate-900 text-white py-12 px-6 text-center font-sans">
        <p className="text-orange-400 font-bold uppercase tracking-widest text-xs mb-2">Terroir d'Occitanie</p>
        <p className="text-slate-400 text-sm italic">"À Toulouse, on ne mange pas, on communie."</p>
      </footer>
    </div>
  );
}
