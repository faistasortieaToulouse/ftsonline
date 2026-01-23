"use client";
import { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ExpansionHebraismePage() {
  const [data, setData] = useState<any>(null);
  const [periodes, setPeriodes] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/expansionchristianisme')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        const allPeriodes = new Set<string>();
        // On itère sur les clés (Afrique, etc.) pour récupérer les périodes
        Object.values(json).forEach((regions: any) => {
          regions.forEach((item: any) => allPeriodes.add(item.periode));
        });
        
        // Tri basique (Note : pour des dates av. J.-C., un tri personnalisé serait idéal)
        setPeriodes(Array.from(allPeriodes)); 
      });
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft } = scrollContainerRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - 500 : scrollLeft + 500;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const headerColors = [
    'bg-blue-900','bg-amber-800','bg-slate-800','bg-cyan-900'
  ];

  const bodyColors = [
    'bg-blue-50 border-blue-400 text-blue-900',
    'bg-amber-50 border-amber-400 text-amber-900',
    'bg-slate-50 border-slate-400 text-slate-900',
    'bg-cyan-50 border-cyan-400 text-cyan-900'
  ];

  if (!data) return <div className="p-10 text-center font-bold italic animate-pulse">Chargement de l'histoire...</div>;

  const categoriesListe = Object.keys(data);

  return (
    <div className="min-h-screen bg-slate-100 p-4 font-sans">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-amber-700 mb-2 uppercase">
            Diffusion de l'Hébraïsme
          </h1>
          <p className="text-gray-500 uppercase tracking-widest text-sm font-bold italic">
            Chronologie mondiale par continents
          </p>
        </header>

        {/* NAVIGATION */}
        <div className="flex justify-between items-center mb-6 px-4">
          <button 
            onClick={() => scroll('left')} 
            className="flex items-center justify-center w-14 h-14 bg-white shadow-lg rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all active:scale-90"
          >
            <span className="text-2xl font-bold">←</span>
          </button>

          <div className="text-center">
             <div className="flex gap-2 items-center justify-center mb-1">
                <span className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></span>
                <span className="text-xs text-slate-600 font-black uppercase">Exploration temporelle</span>
             </div>
          </div>

          <button 
            onClick={() => scroll('right')} 
            className="flex items-center justify-center w-14 h-14 bg-white shadow-lg rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all active:scale-90"
          >
            <span className="text-2xl font-bold">→</span>
          </button>
        </div>

        {/* TABLEAU */}
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto rounded-2xl shadow-2xl border-2 border-white bg-white/50 backdrop-blur-sm"
        >
          <table className="border-collapse w-full">
            <thead>
              <tr>
                <th className="sticky left-0 z-20 bg-slate-900 text-white p-5 border-r-4 border-blue-500 text-lg uppercase font-black">
                  Période
                </th>
                {categoriesListe.map((cat, index) => (
                  <th key={cat} className={`${headerColors[index % headerColors.length]} text-white p-6 min-w-[300px] uppercase text-sm font-black tracking-widest text-center border-x border-white/10`}>
                    {cat}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periodes.map((periode) => (
                <tr key={periode} className="group hover:bg-white transition-colors">
                  <td className="sticky left-0 z-10 bg-slate-50 group-hover:bg-blue-50 p-4 border-r-4 border-b border-blue-500 font-black text-slate-700 text-center whitespace-nowrap">
                    {periode}
                  </td>
                  {categoriesListe.map((cat, index) => {
                    const info = data[cat].find((item: any) => item.periode === periode);
                    const colorClass = bodyColors[index % bodyColors.length];
                    
                    return (
                      <td key={cat} className="p-3 border-b border-slate-100 align-top">
                        {info ? (
                          <div className={`${colorClass} border-l-[6px] p-4 rounded-lg shadow-sm hover:shadow-md transition-all`}>
                            <h4 className="text-[10px] font-bold uppercase opacity-60 mb-1">{info.region}</h4>
                            <p className="text-sm font-semibold leading-relaxed">
                              {info.evenement}
                            </p>
                          </div>
                        ) : (
                          <div className="flex justify-center items-center py-10 opacity-5 italic text-[10px]">
                            —
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar { height: 12px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #1e3a8a; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #1e40af; }
      `}</style>
    </div>
  );
}
