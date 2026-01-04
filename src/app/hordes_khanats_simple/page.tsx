'use client';
import { useEffect, useState, useRef } from 'react';

interface Event {
  id: number;
  date: string;
  region: string;
  information: string;
}

export default function HordesKhanatsPage() {
  const [data, setData] = useState<Record<string, Event[]> | null>(null);
  const [dates, setDates] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/hordes_khanats')
      .then(res => res.json())
      .then((json: Event[]) => {
        // Transformer les données en objet par région
        const grouped: Record<string, Event[]> = {};
        const allDates = new Set<string>();

        json.forEach(e => {
          if (!grouped[e.region]) grouped[e.region] = [];
          grouped[e.region].push(e);
          allDates.add(e.date);
        });

        setData(grouped);
        setDates(Array.from(allDates).sort((a, b) => parseInt(a) - parseInt(b)));
      })
      .catch(err => console.error("Erreur fetch:", err));
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft } = scrollContainerRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - 500 : scrollLeft + 500;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const headerColors = [
    'bg-emerald-700', 'bg-blue-700', 'bg-amber-700',
    'bg-red-700', 'bg-indigo-700', 'bg-teal-700', 'bg-slate-700'
  ];

  const dotColors = [
    'bg-emerald-500 shadow-emerald-200',
    'bg-blue-500 shadow-blue-200',
    'bg-amber-500 shadow-amber-200',
    'bg-red-500 shadow-red-200',
    'bg-indigo-500 shadow-indigo-200',
    'bg-teal-500 shadow-teal-200',
    'bg-slate-500 shadow-slate-200'
  ];

  if (!data) return <div className="p-10 text-center font-bold">Chargement...</div>;

  const regions = Object.keys(data);

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600 mb-2 uppercase">
            Hordes & Khanats
          </h1>
          <p className="text-gray-500 uppercase tracking-widest text-sm font-bold italic">
            Tableau croisé temporel par points
          </p>
        </header>

        {/* Modal */}
        {selectedEvent && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <div
              className="bg-white p-8 rounded-3xl shadow-2xl border-t-8 border-emerald-500 max-w-sm w-full animate-in zoom-in duration-200"
              onClick={e => e.stopPropagation()}
            >
              <p className="text-emerald-600 font-black uppercase text-xs mb-2 tracking-widest">
                {selectedEvent.region} — {selectedEvent.date}
              </p>
              <h2 className="text-2xl font-black text-gray-900 leading-tight mb-6">
                {selectedEvent.information}
              </h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Flèches */}
        <div className="flex justify-between items-center mb-6 px-4">
          <button
            onClick={() => scroll('left')}
            className="group flex items-center justify-center w-16 h-16 bg-white shadow-xl rounded-full border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-300 active:scale-95"
          >
            <span className="text-4xl font-bold">←</span>
          </button>
          <div className="text-center">
            <p className="text-xs text-gray-400 font-bold uppercase italic">
              Cliquez sur un point pour voir le nom et utilisez les flèches pour naviguer
            </p>
          </div>
          <button
            onClick={() => scroll('right')}
            className="group flex items-center justify-center w-16 h-16 bg-white shadow-xl rounded-full border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-300 active:scale-95"
          >
            <span className="text-4xl font-bold">→</span>
          </button>
        </div>

        {/* Tableau */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto rounded-xl shadow-2xl border-4 border-white bg-white"
        >
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-20 bg-gray-900 text-white p-5 border-b-2 border-r-4 border-emerald-500 text-lg min-w-[100px]">
                  Année
                </th>
                {regions.map((region, i) => (
                  <th
                    key={region}
                    className={`${headerColors[i % headerColors.length]} text-white border-b-4 border-white min-w-[60px] h-48 relative`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="whitespace-nowrap -rotate-90 font-black text-xs tracking-widest uppercase">
                        {region}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dates.map(date => (
                <tr key={date} className="group hover:bg-yellow-50 transition-colors">
                  <td className="sticky left-0 z-10 bg-gray-100 group-hover:bg-yellow-100 p-3 border-r-4 border-b border-emerald-500 font-black text-gray-800 text-center shadow-inner text-sm">
                    {date}
                  </td>
                  {regions.map((region, i) => {
                    const event = data[region].find(e => e.date === date);
                    const dotClass = dotColors[i % dotColors.length];

                    return (
                      <td key={region} className="p-0 border-b border-r border-gray-100 text-center w-[60px] h-[60px]">
                        {event ? (
                          <button
                            onClick={() => setSelectedEvent(event)}
                            className={`${dotClass} w-5 h-5 rounded-full shadow-lg hover:scale-150 transition-transform mx-auto block active:ring-4 ring-white`}
                            title="Voir la dynastie"
                          />
                        ) : (
                          <span className="text-gray-200 text-[10px] opacity-20">.</span>
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
        ::-webkit-scrollbar {
          height: 16px;
        }
        ::-webkit-scrollbar-track {
          background: #e2e8f0;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 10px;
          border: 4px solid #e2e8f0;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #059669;
        }
      `}</style>
    </div>
  );
}
