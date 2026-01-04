"use client";
import { useEffect, useState, useRef } from 'react';

const MOIS_COLONNES = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "décembre"];
const JOURS_LIGNES = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

export default function DateFetesPage() {
  const [data, setData] = useState<any>(null);
  const [selectedFete, setSelectedFete] = useState<any>(null); // Pour la fenêtre modale
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/datefetes')
      .then((res) => res.json())
      .then((json) => {
        const grouped: any = {};
        MOIS_COLONNES.forEach(m => grouped[m] = []);
        if (Array.isArray(json)) {
          json.forEach((item: any) => {
            if (grouped[item.mois]) grouped[item.mois].push(item);
          });
        }
        setData(grouped);
      });
  }, []);

  const headerColors = ['bg-emerald-700', 'bg-blue-700', 'bg-amber-700', 'bg-red-700', 'bg-indigo-700', 'bg-teal-700'];
  const bodyColors = [
    'hover:bg-emerald-200 bg-emerald-50 border-emerald-500 text-emerald-900',
    'hover:bg-blue-200 bg-blue-50 border-blue-500 text-blue-900',
    'hover:bg-amber-200 bg-amber-50 border-amber-500 text-amber-900'
  ];

  if (!data) return <div className="p-10 text-center font-bold">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans relative">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2 uppercase tracking-tighter">
            Calendrier des Fêtes
          </h1>
        </header>

        <div ref={scrollContainerRef} className="overflow-x-auto rounded-xl shadow-2xl border-4 border-white bg-white">
          <table className="border-collapse w-full table-fixed">
            <thead>
              <tr>
                <th className="sticky left-0 z-20 bg-gray-900 text-white p-4 border-b-2 border-r-4 border-orange-500 w-20">Jour</th>
                {MOIS_COLONNES.map((mois, index) => (
                  <th key={mois} className={`${headerColors[index % headerColors.length]} text-white p-5 border-b-4 border-white min-w-[180px] uppercase text-[10px] font-black tracking-widest text-center`}>
                    {mois}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {JOURS_LIGNES.map((jour) => (
                <tr key={jour} className="group transition-colors">
                  <td className="sticky left-0 z-10 bg-gray-50 p-3 border-r-4 border-b border-orange-500 font-black text-gray-800 text-center">
                    {jour}
                  </td>
                  {MOIS_COLONNES.map((mois, index) => {
                    const fete = data[mois].find((f: any) => f.jour === jour);
                    const colorClass = bodyColors[index % bodyColors.length];
                    
                    return (
                      <td key={mois} className="p-1 border-b border-r border-gray-100 h-20">
                        {fete ? (
                          <button 
                            onClick={() => setSelectedFete(fete)}
                            className={`${colorClass} w-full h-full border-l-[4px] p-2 rounded shadow-sm flex items-center justify-center text-center transition-transform active:scale-95`}
                          >
                            <p className="text-[10px] font-extrabold leading-tight uppercase overflow-hidden">
                              {fete.evenement}
                            </p>
                          </button>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- FENÊTRE MODALE (ZOOM) --- */}
      {selectedFete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedFete(null)} // Ferme en cliquant à côté
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full transform transition-all animate-in zoom-in-95 duration-200 border-t-8 border-orange-500"
            onClick={(e) => e.stopPropagation()} // Empêche de fermer si on clique sur le texte
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-orange-600 font-black uppercase tracking-widest text-sm">
                  {selectedFete.jour} {selectedFete.mois}
                </p>
                <h2 className="text-3xl font-black text-gray-900 leading-tight mt-1 uppercase">
                  {selectedFete.evenement}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedFete(null)}
                className="text-gray-400 hover:text-red-500 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setSelectedFete(null)}
                className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold uppercase text-sm hover:bg-orange-600 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}