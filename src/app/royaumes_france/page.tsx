"use client";

import { useEffect, useState, useRef } from 'react';

interface RoyaumeData {
  id: number;
  date: string;
  royaume: string;
  dirigeant: string;
}

export default function RoyaumesSynchronologiePage() {
  const [data, setData] = useState<{ [key: string]: RoyaumeData[] } | null>(null);
  const [dates, setDates] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/royaumes_france')
      .then((res) => res.json())
      .then((json: RoyaumeData[]) => {
        // 1. Transformation des données : Liste plate -> Groupé par Royaume
        const grouped = json.reduce((acc: any, item) => {
          if (!acc[item.royaume]) acc[item.royaume] = [];
          acc[item.royaume].push(item);
          return acc;
        }, {});

        setData(grouped);

        // 2. Extraction et tri des dates uniques
        const allDates = new Set<string>();
        json.forEach((item) => {
          if (item.date) allDates.add(item.date);
        });
        
        const sortedDates = Array.from(allDates).sort((a, b) => {
          return parseInt(a) - parseInt(b);
        });
        
        setDates(sortedDates);
      })
      .catch(err => console.error("Erreur chargement:", err));
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft } = scrollContainerRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - 500 : scrollLeft + 500;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const headerColors = [
    'bg-blue-800', 'bg-red-800', 'bg-amber-700', 
    'bg-purple-800', 'bg-slate-800', 'bg-indigo-800'
  ];

  const bodyColors = [
    'bg-blue-50 border-blue-500 text-blue-900',
    'bg-red-50 border-red-500 text-red-900',
    'bg-amber-50 border-amber-500 text-amber-900',
    'bg-purple-50 border-purple-500 text-purple-900',
    'bg-slate-100 border-slate-500 text-slate-900',
    'bg-indigo-50 border-indigo-500 text-indigo-900'
  ];

  if (!data) return <div className="p-10 text-center font-bold">Chargement de la chronologie royale...</div>;

  const royaumesListe = Object.keys(data);

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans">
      <div className="max-w-[100vw] mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tighter">
            Synchronologie des Royaumes de France
          </h1>
          <p className="text-slate-500 uppercase tracking-widest text-sm font-bold italic">Tableau de bord de l'histoire de France</p>
        </header>

        {/* NAVIGATION */}
        <div className="flex justify-between items-center mb-6 px-4 max-w-7xl mx-auto">
          <button 
            onClick={() => scroll('left')} 
            className="flex items-center justify-center w-14 h-14 bg-white shadow-lg rounded-full border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white transition-all"
          >
            <span className="text-2xl">←</span>
          </button>
          
          <div className="text-center">
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Utilisez le défilement horizontal</span>
          </div>

          <button 
            onClick={() => scroll('right')} 
            className="flex items-center justify-center w-14 h-14 bg-white shadow-lg rounded-full border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white transition-all"
          >
            <span className="text-2xl">→</span>
          </button>
        </div>

        {/* TABLEAU CROISÉ */}
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto rounded-xl shadow-2xl border bg-white"
        >
          <table className="border-collapse w-full">
            <thead>
              <tr>
                <th className="sticky left-0 z-30 bg-slate-900 text-white p-5 border-b-2 border-r-4 border-blue-600 text-lg shadow-lg">
                  Année
                </th>
                {royaumesListe.map((royaume, index) => (
                  <th key={royaume} className={`${headerColors[index % headerColors.length]} text-white p-6 border-b-4 border-white min-w-[280px] uppercase text-xs font-black tracking-widest text-center`}>
                    {royaume}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dates.map((date) => (
                <tr key={date} className="group hover:bg-slate-50 transition-colors">
                  <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-100 p-4 border-r-4 border-b border-blue-600 font-black text-slate-700 text-center text-sm">
                    {date}
                  </td>
                  {royaumesListe.map((royaume, index) => {
                    const info = data[royaume].find((d) => d.date === date);
                    const colorClass = bodyColors[index % bodyColors.length];
                    
                    return (
                      <td key={royaume} className="p-2 border-b border-r border-slate-50 min-w-[280px]">
                        {info ? (
                          <div className={`${colorClass} border-l-[6px] p-4 rounded-r-lg shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-200`}>
                            <p className="text-xs font-black leading-tight uppercase">
                              {info.dirigeant}
                            </p>
                            {/* Optionnel: petite icône ou label selon le type de dirigeant */}
                            {info.dirigeant === "fin" && <span className="text-[9px] opacity-60">Dissolution / Fin de règne</span>}
                          </div>
                        ) : (
                          <div className="flex justify-center opacity-5">
                            <span className="h-[2px] w-8 bg-slate-400 rounded-full"></span>
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
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 6px; border: 3px solid #f1f5f9; }
        ::-webkit-scrollbar-thumb:hover { background: #0f172a; }
      `}</style>
    </div>
  );
}