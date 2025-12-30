"use client";
import { useEffect, useState, useRef } from 'react';

export default function DynastieTablePage() {
  const [data, setData] = useState<any>(null);
  const [dates, setDates] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/dynastieislam')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        // Extraire toutes les dates uniques et les trier
        const allDates = new Set<string>();
        Object.values(json).forEach((pays: any) => {
          pays.forEach((d: any) => allDates.add(d.date));
        });
        setDates(Array.from(allDates).sort((a, b) => parseInt(a) - parseInt(b)));
      });
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - 300 : scrollLeft + 300;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!data) return <div className="p-10 text-center">Chargement du tableau comparatif...</div>;

  const paysListe = Object.keys(data);

  return (
    <div className="min-h-screen bg-white p-4">
      <h1 className="text-2xl font-bold mb-6 text-center text-slate-800">
        Tableau Comparatif des Dynasties Musulmanes
      </h1>

      {/* Boutons de navigation pour ordinateur */}
      <div className="flex justify-between mb-2">
        <button onClick={() => scroll('left')} className="bg-slate-800 text-white px-4 py-2 rounded-l hover:bg-slate-700"> ← Gauche </button>
        <span className="text-sm text-slate-500 self-center">Faites glisser le tableau horizontalement</span>
        <button onClick={() => scroll('right')} className="bg-slate-800 text-white px-4 py-2 rounded-r hover:bg-slate-700"> Droite → </button>
      </div>

      {/* Conteneur du tableau avec défilement horizontal */}
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto border border-slate-200 rounded-lg shadow-xl"
      >
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-slate-100">
              {/* Colonne Date fixée visuellement */}
              <th className="sticky left-0 z-10 bg-slate-200 p-3 border-b border-r border-slate-300 text-left min-w-[100px]">
                Année
              </th>
              {/* En-têtes des pays */}
              {paysListe.map((pays) => (
                <th key={pays} className="p-3 border-b border-slate-300 text-center min-w-[200px] text-sm font-bold text-emerald-900">
                  {pays}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dates.map((date) => (
              <tr key={date} className="hover:bg-slate-50 transition-colors">
                <td className="sticky left-0 z-10 bg-slate-100 p-3 border-r border-b border-slate-300 font-mono font-bold text-emerald-700">
                  {date}
                </td>
                {paysListe.map((pays) => {
                  // Trouver si une dynastie existe pour cette date dans ce pays
                  const info = data[pays].find((d: any) => d.date === date);
                  return (
                    <td key={pays} className="p-3 border-b border-r border-slate-200 text-xs text-center align-middle">
                      {info ? (
                        <span className="inline-block bg-emerald-50 text-emerald-800 p-2 rounded border border-emerald-100 w-full">
                          {info.evenement}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
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
  );
}