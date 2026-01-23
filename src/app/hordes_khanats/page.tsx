'use client';
import { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface EventData {
  id: number;
  date: string;
  region: string;
  information: string;
}

export default function HordesKhanatsPage() {
  const [data, setData] = useState<Record<string, EventData[]>>({});
  const [dates, setDates] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Récupération des données depuis l'API
  useEffect(() => {
    fetch('/api/hordes_khanats')
      .then((res) => res.json())
      .then((json: EventData[]) => {
        // Grouper par région
        const grouped: Record<string, EventData[]> = {};
        json.forEach((item) => {
          if (!grouped[item.region]) grouped[item.region] = [];
          grouped[item.region].push(item);
        });
        setData(grouped);

        // Extraire toutes les dates uniques
        const allDates = new Set<string>();
        json.forEach((item) => allDates.add(item.date));
        setDates(Array.from(allDates).sort((a, b) => {
          // Trier les dates numériques si possible, sinon lexicographique
          const na = parseInt(a.replace(/\D/g, '')) || 0;
          const nb = parseInt(b.replace(/\D/g, '')) || 0;
          return na - nb;
        }));
      });
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollTo = direction === 'left'
        ? scrollContainerRef.current.scrollLeft - 500
        : scrollContainerRef.current.scrollLeft + 500;
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

  if (!data || Object.keys(data).length === 0) {
    return <div className="p-10 text-center font-bold">Chargement...</div>;
  }

  const regions = Object.keys(data);

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
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600 mb-2 uppercase">
            Hordes et Khanats
          </h1>
          <p className="text-gray-500 uppercase tracking-widest text-sm font-bold italic">
            Tableau chronologique par régions
          </p>
        </header>

        {/* GRANDES FLÈCHES */}
        <div className="flex justify-between items-center mb-2 px-4">
          <button 
            onClick={() => scroll('left')} 
            className="group flex items-center justify-center w-20 h-20 bg-white shadow-xl rounded-full border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-300 active:scale-95"
            title="Précédent"
          >
            <span className="text-5xl font-bold">←</span>
          </button>

          <button 
            onClick={() => scroll('right')} 
            className="group flex items-center justify-center w-20 h-20 bg-white shadow-xl rounded-full border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-300 active:scale-95"
            title="Suivant"
          >
            <span className="text-5xl font-bold">→</span>
          </button>
        </div>

        {/* INSTRUCTIONS SOUS LES FLÈCHES */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex gap-2 items-center mb-1">
            <span className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-600 font-black uppercase tracking-tighter">Défilement actif</span>
          </div>
          <p className="text-[10px] text-gray-400 font-bold italic uppercase text-center">
            Cliquez sur un point pour voir le nom et utilisez les flèches pour défiler entre les pays
          </p>
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
                {regions.map((region, index) => (
                  <th key={region} className={`${headerColors[index % headerColors.length]} text-white p-6 border-b-4 border-white min-w-[250px] uppercase text-sm font-black tracking-tight text-center`}>
                    {region}
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
                  {regions.map((region, index) => {
                    const event = data[region].find((e) => e.date === date);
                    const colorClass = bodyColors[index % bodyColors.length];
                    return (
                      <td key={region} className="p-2 border-b border-r border-gray-100">
                        {event ? (
                          <div
                            className={`${colorClass} border-l-[6px] p-4 rounded-r-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 cursor-pointer`}
                            title={event.information}
                          >
                            <p className="text-xs font-black leading-snug uppercase tracking-tight">
                              {event.information}
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
