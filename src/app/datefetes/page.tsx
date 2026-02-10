"use client";
import { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";

const MOIS_COLONNES = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "décembre"];
const JOURS_LIGNES = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

export default function DateFetesPage() {
  const [data, setData] = useState<any>(null);
  const [selectedFete, setSelectedFete] = useState<any>(null);
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

  if (!data) return <div className="p-10 text-center font-bold animate-pulse text-gray-400">Chargement du calendrier...</div>;

  return (
    <div className="min-h-screen bg-gray-100 font-sans relative">
      
      {/* NAVIGATION */}
      <nav className="p-4 md:p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <div className="max-w-7xl mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-2 uppercase tracking-tighter">
            Calendrier des Fêtes
          </h1>
          <div className="h-1 w-20 bg-orange-500 mx-auto rounded-full"></div>
        </header>

        {/* --- VERSION MOBILE : Liste de cartes (Visible uniquement sur petit écran) --- */}
        <div className="md:hidden space-y-6 pb-10">
          {MOIS_COLONNES.map((mois, mIdx) => (
            <div key={mois} className="bg-white rounded-2xl shadow-lg overflow-hidden border-b-4 border-gray-200">
              <div className={`${headerColors[mIdx % headerColors.length]} p-4 text-white flex justify-between items-center`}>
                <h2 className="font-black uppercase tracking-widest">{mois}</h2>
                <CalendarDays size={18} className="opacity-50" />
              </div>
              <div className="divide-y divide-gray-50">
                {data[mois].length > 0 ? (
                  data[mois]
                    .sort((a: any, b: any) => parseInt(a.jour) - parseInt(b.jour))
                    .map((fete: any) => (
                      <div 
                        key={fete.id} 
                        onClick={() => setSelectedFete(fete)}
                        className="p-4 flex items-center gap-4 active:bg-orange-50 cursor-pointer transition-colors"
                      >
                        <div className="bg-gray-100 rounded-lg w-10 h-10 flex items-center justify-center font-black text-gray-700 shrink-0">
                          {fete.jour}
                        </div>
                        <div className="font-bold text-gray-800 uppercase text-xs leading-tight">
                          {fete.evenement}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="p-6 text-center text-xs text-gray-400 italic">Aucun événement ce mois-ci</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* --- VERSION BUREAU : Ton tableau original (Masqué sur mobile) --- */}
        <div className="hidden md:block pb-10">
          <div ref={scrollContainerRef} className="overflow-x-auto rounded-xl shadow-2xl border-4 border-white bg-white">
            <table className="border-collapse w-full table-fixed">
              <thead>
                <tr>
                  <th className="sticky left-0 z-20 bg-gray-900 text-white p-4 border-b-2 border-r-4 border-orange-500 w-20">Jour</th>
                  {MOIS_COLONNES.map((mois, index) => (
                    <th key={mois} className={`${headerColors[index % headerColors.length]} text-white p-5 border-b-4 border-white min-w-[160px] uppercase text-[10px] font-black tracking-widest text-center`}>
                      {mois}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {JOURS_LIGNES.map((jour) => (
                  <tr key={jour} className="group">
                    <td className="sticky left-0 z-10 bg-gray-50 p-3 border-r-4 border-b border-orange-500 font-black text-gray-800 text-center text-sm">
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
                              className={`${colorClass} w-full h-full border-l-[4px] p-2 rounded shadow-sm flex items-center justify-center text-center transition-transform hover:scale-105 active:scale-95`}
                            >
                              <p className="text-[9px] font-extrabold leading-tight uppercase overflow-hidden">
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
      </div>

      {/* --- MODALE (Adaptée pour mobile : s'affiche en bas sur mobile) --- */}
      {selectedFete && (
        <div 
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4"
          onClick={() => setSelectedFete(null)}
        >
          <div 
            className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl p-8 max-w-lg w-full transform transition-all animate-in slide-in-from-bottom md:zoom-in-95 duration-300 border-t-8 border-orange-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-orange-600 font-black uppercase tracking-widest text-xs mb-1">
                  {selectedFete.jour} {selectedFete.mois}
                </p>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight uppercase">
                  {selectedFete.evenement}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedFete(null)}
                className="text-gray-300 hover:text-red-500 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <button 
              onClick={() => setSelectedFete(null)}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold uppercase text-sm hover:bg-orange-600 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
