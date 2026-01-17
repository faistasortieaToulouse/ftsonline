"use client";
import { useEffect, useState, useRef } from 'react';

export default function ExpansionHebraismeSimplePage() {
  const [data, setData] = useState<any>(null);
  const [dates, setDates] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<{ region: string, event: string, date: string } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/expansionhebraisme')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        const allDates = new Set<string>();
        Object.values(json).forEach((items: any) => {
          items.forEach((d: any) => allDates.add(d.periode));
        });
        // On conserve l'ordre du JSON pour les périodes historiques
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
    'bg-blue-900', 'bg-amber-700', 'bg-indigo-900', 
    'bg-slate-800', 'bg-cyan-900', 'bg-yellow-800'
  ];

  const dotColors = [
    'bg-blue-500 shadow-blue-200',
    'bg-amber-500 shadow-amber-200',
    'bg-indigo-500 shadow-indigo-200',
    'bg-slate-500 shadow-slate-200',
    'bg-cyan-500 shadow-cyan-200',
    'bg-yellow-600 shadow-yellow-200'
  ];

  if (!data) return <div className="p-10 text-center font-bold animate-pulse">Chargement de la chronologie...</div>;

  const categoriesListe = Object.keys(data);

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-amber-700 mb-2 uppercase">
            Diffusion de l'Hébraïsme
          </h1>
          <p className="text-gray-500 uppercase tracking-widest text-xs font-bold italic">Matrice chronologique des présences historiques</p>
        </header>

        {/* MODAL AU CLIC */}
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setSelectedEvent(null)}>
            <div className="bg-white p-8 rounded-3xl shadow-2xl border-t-8 border-blue-600 max-w-sm w-full animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
              <p className="text-blue-600 font-black uppercase text-[10px] mb-2 tracking-[0.2em]">{selectedEvent.region} — {selectedEvent.date}</p>
              <h2 className="text-xl font-bold text-slate-800 leading-tight mb-6">{selectedEvent.event}</h2>
              <button onClick={() => setSelectedEvent(null)} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors">Fermer</button>
            </div>
          </div>
        )}

        {/* NAVIGATION */}
        <div className="flex flex-col items-center mb-6 px-4">
          <div className="flex justify-between w-full items-center">
            <button onClick={() => scroll('left')} className="group flex items-center justify-center w-14 h-14 bg-white shadow-xl rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all active:scale-90">
              <span className="text-3xl font-bold">←</span>
            </button>
            
            <button onClick={() => scroll('right')} className="group flex items-center justify-center w-14 h-14 bg-white shadow-xl rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all active:scale-90">
              <span className="text-3xl font-bold">→</span>
            </button>
          </div>
          <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-tighter italic">Cliquez sur un point pour explorer l'événement</p>
        </div>

        {/* TABLEAU MATRICIEL */}
        <div ref={scrollContainerRef} className="overflow-x-auto rounded-2xl shadow-2xl border-4 border-white bg-white">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-20 bg-slate-900 text-white p-4 border-b-2 border-r-4 border-blue-600 text-sm min-w-[120px]">
                  Période
                </th>
                {categoriesListe.map((cat, index) => (
                  <th key={cat} className={`${headerColors[index % headerColors.length]} text-white border-b-4 border-white min-w-[70px] h-44 relative`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="whitespace-nowrap -rotate-90 font-black text-[10px] tracking-[0.2em] uppercase">
                        {cat}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dates.map((date) => (
                <tr key={date} className="group hover:bg-slate-50 transition-colors">
                  <td className="sticky left-0 z-10 bg-slate-100 group-hover:bg-blue-50 p-3 border-r-4 border-b border-blue-600 font-black text-slate-700 text-center shadow-inner text-[10px] whitespace-nowrap">
                    {date}
                  </td>
                  {categoriesListe.map((cat, index) => {
                    const info = data[cat].find((d: any) => d.periode === date);
                    const dotClass = dotColors[index % dotColors.length];
                    
                    return (
                      <td key={cat} className="p-0 border-b border-r border-slate-50 text-center w-[70px] h-[60px] relative">
                        {info ? (
                          <div className="flex flex-col items-center justify-center group/dot">
                            <button 
                              onClick={() => setSelectedEvent({ region: info.region, event: info.evenement, date })}
                              className={`${dotClass} w-4 h-4 rounded-full shadow-md hover:scale-[1.8] transition-transform mx-auto active:ring-4 ring-blue-100`}
                            />
                            {/* Tooltip ultra-léger */}
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[8px] px-1 rounded opacity-0 group-hover/dot:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
                              {info.region}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-200 text-[10px] opacity-20">.</span>
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
        ::-webkit-scrollbar-thumb { background: #1e3a8a; border-radius: 10px; border: 3px solid #f1f5f9; }
        ::-webkit-scrollbar-thumb:hover { background: #1e40af; }
      `}</style>
    </div>
  );
}