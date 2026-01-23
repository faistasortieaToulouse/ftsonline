"use client";
import { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ExpansionHebraismePage() {
  const [data, setData] = useState<any>(null);
  const [dates, setDates] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/expansionhebraisme')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        const allDates = new Set<string>();
        // On itère sur les continents (Afrique, etc.)
        Object.values(json).forEach((regionData: any) => {
          regionData.forEach((d: any) => allDates.add(d.periode));
        });
        // Pour les dates historiques (av. J.-C.), le tri natif est complexe.
        // On garde ici l'ordre d'insertion ou un tri simple.
        setDates(Array.from(allDates));
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
    'bg-blue-800','bg-amber-600','bg-slate-700','bg-indigo-700'
  ];

  const bodyColors = [
    'bg-blue-50 border-blue-500 text-blue-900',
    'bg-amber-50 border-amber-500 text-amber-900',
    'bg-slate-50 border-slate-500 text-slate-900',
    'bg-indigo-50 border-indigo-500 text-indigo-900'
  ];

  if (!data) return <div className="p-10 text-center font-bold">Chargement de l'histoire...</div>;

  const continents = Object.keys(data);

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-amber-600 mb-2 uppercase">
            Diffusion de l'Hébraïsme
          </h1>
          <p className="text-gray-500 uppercase tracking-widest text-sm font-bold italic">
            Chronologie des diasporas et présences historiques
          </p>
        </header>

        {/* NAVIGATION */}
        <div className="flex justify-between items-center mb-6 px-4">
          <button 
            onClick={() => scroll('left')} 
            className="flex items-center justify-center w-16 h-16 bg-white shadow-xl rounded-full border-2 border-blue-500 text-blue-600 hover:bg-blue-600 hover:text-white transition-all active:scale-95"
          >
            <span className="text-4xl font-bold">←</span>
          </button>

          <button 
            onClick={() => scroll('right')} 
            className="flex items-center justify-center w-16 h-16 bg-white shadow-xl rounded-full border-2 border-blue-500 text-blue-600 hover:bg-blue-600 hover:text-white transition-all active:scale-95"
          >
            <span className="text-4xl font-bold">→</span>
          </button>
        </div>

        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto rounded-xl shadow-2xl border-4 border-white bg-white"
        >
          <table className="border-collapse w-full">
            <thead>
              <tr>
                <th className="sticky left-0 z-20 bg-slate-900 text-white p-5 border-b-2 border-r-4 border-blue-500 text-lg shadow-lg">
                  Période
                </th>
                {continents.map((cont, index) => (
                  <th key={cont} className={`${headerColors[index % headerColors.length]} text-white p-6 border-b-4 border-white min-w-[280px] uppercase text-sm font-black tracking-tight text-center`}>
                    {cont}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dates.map((date) => (
                <tr key={date} className="group hover:bg-blue-50 transition-colors">
                  <td className="sticky left-0 z-10 bg-gray-100 group-hover:bg-blue-100 p-4 border-r-4 border-b border-blue-500 font-black text-gray-800 text-center shadow-inner">
                    {date}
                  </td>
                  {continents.map((cont, index) => {
                    const info = data[cont].find((d: any) => d.periode === date);
                    const colorClass = bodyColors[index % bodyColors.length];
                    
                    return (
                      <td key={cont} className="p-3 border-b border-r border-gray-100">
                        {info ? (
                          <div className={`${colorClass} border-l-[6px] p-4 rounded-r-lg shadow-md hover:shadow-xl transition-all duration-200`}>
                            <h4 className="font-bold text-xs uppercase mb-1 underline">{info.region}</h4>
                            <p className="text-xs font-medium leading-snug tracking-tight">
                              {info.evenement}
                            </p>
                          </div>
                        ) : (
                          <div className="flex justify-center opacity-5 italic text-xs">...</div>
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
        ::-webkit-scrollbar { height: 16px; }
        ::-webkit-scrollbar-track { background: #e2e8f0; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: #1d4ed8; border-radius: 10px; border: 4px solid #e2e8f0; }
        ::-webkit-scrollbar-thumb:hover { background: #1e40af; }
      `}</style>
    </div>
  );
}
