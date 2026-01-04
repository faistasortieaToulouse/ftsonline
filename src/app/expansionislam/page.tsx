"use client";
import { useEffect, useState, useRef } from 'react';

export default function ExpansionIslamPage() {
  const [data, setData] = useState<any>(null);
  const [dates, setDates] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/expansionislam')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        const allDates = new Set<string>();
        Object.values(json).forEach((pays: any) => {
          pays.forEach((d: any) => allDates.add(d.date));
        });
        setDates(Array.from(allDates).sort((a, b) => parseInt(a) - parseInt(b)));
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
    'bg-emerald-700','bg-blue-700','bg-amber-700',
    'bg-red-700','bg-indigo-700','bg-teal-700','bg-slate-700'
  ];

  const bodyColors = [
    'bg-emerald-100 border-emerald-500 text-emerald-900',
    'bg-blue-100 border-blue-500 text-blue-900',
    'bg-amber-100 border-amber-500 text-amber-900',
    'bg-red-100 border-red-500 text-red-900',
    'bg-indigo-100 border-indigo-500 text-indigo-900',
    'bg-teal-100 border-teal-500 text-teal-900',
    'bg-slate-200 border-slate-500 text-slate-900'
  ];

  if (!data) return <div className="p-10 text-center font-bold">Chargement...</div>;

  const paysListe = Object.keys(data);

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600 mb-2 uppercase">
            Expansion de l’Islam
          </h1>
          <p className="text-gray-500 uppercase tracking-widest text-sm font-bold italic">
            Tableau chronologique par régions
          </p>
        </header>

        {/* NAVIGATION AVEC GRANDES FLÈCHES */}
        <div className="flex justify-between items-center mb-6 px-4">
          <button 
            onClick={() => scroll('left')} 
            className="group flex items-center justify-center w-16 h-16 bg-white shadow-xl rounded-full border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-300 active:scale-95"
            title="Précédent"
          >
            <span className="text-4xl font-bold">←</span>
          </button>

          <div className="flex flex-col items-center">
             <div className="flex gap-2 items-center mb-1">
                <span className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-sm text-gray-600 font-black uppercase tracking-tighter">Défilement actif</span>
             </div>
             <p className="text-[10px] text-gray-400 font-bold italic uppercase">Glissez pour naviguer entre les pays</p>
          </div>

          <button 
            onClick={() => scroll('right')} 
            className="group flex items-center justify-center w-16 h-16 bg-white shadow-xl rounded-full border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-300 active:scale-95"
            title="Suivant"
          >
            <span className="text-4xl font-bold">→</span>
          </button>
        </div>

        {/* TABLEAU */}
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto rounded-xl shadow-2xl border-4 border-white bg-white"
        >
          <table className="border-collapse w-full">
            <thead>
              <tr>
                <th className="sticky left-0 z-20 bg-gray-900 text-white p-5 border-b-2 border-r-4 border-emerald-500 text-lg shadow-lg">
                  Année
                </th>
                {paysListe.map((pays, index) => (
                  <th key={pays} className={`${headerColors[index % headerColors.length]} text-white p-6 border-b-4 border-white min-w-[250px] uppercase text-sm font-black tracking-tight text-center`}>
                    {pays}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dates.map((date) => (
                <tr key={date} className="group hover:bg-yellow-50 transition-colors">
                  <td className="sticky left-0 z-10 bg-gray-100 group-hover:bg-yellow-100 p-4 border-r-4 border-b border-emerald-500 font-black text-gray-800 text-center shadow-inner">
                    {date}
                  </td>
                  {paysListe.map((pays, index) => {
                    const info = data[pays].find((d: any) => d.date === date);
                    const colorClass = bodyColors[index % bodyColors.length];
                    
                    return (
                      <td key={pays} className="p-2 border-b border-r border-gray-100">
                        {info ? (
                          <div className={`${colorClass} border-l-[6px] p-4 rounded-r-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200`}>
                            <p className="text-xs font-black leading-snug uppercase tracking-tight">
                              {info.evenement}
                            </p>
                          </div>
                        ) : (
                          <div className="flex justify-center opacity-10">
                            <span className="h-1 w-6 bg-gray-400 rounded-full"></span>
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
        ::-webkit-scrollbar { height: 16px; }
        ::-webkit-scrollbar-track { background: #e2e8f0; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; border: 4px solid #e2e8f0; }
        ::-webkit-scrollbar-thumb:hover { background: #059669; }
      `}</style>
    </div>
  );
}
