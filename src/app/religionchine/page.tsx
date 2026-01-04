"use client";
import React, { useEffect, useState } from 'react';

interface Pratiquant {
  id: number;
  religion: string;
  nombre: number;
  couleur: string;
}

interface ReligionChineData {
  pays: string;
  annee: number;
  unite: string;
  total_estime_millions: number;
  pratiquants: Pratiquant[];
}

export default function ReligionChinePage() {
  const [data, setData] = useState<ReligionChineData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/religionchine')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center">Chargement des données...</div>;
  if (!data) return <div className="p-10 text-center text-red-500">Erreur de chargement.</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* EN-TÊTE */}
        <div className="mb-12 border-b-4 border-red-600 pb-4">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
            Religions en {data.pays}
          </h1>
          <p className="text-red-600 font-bold tracking-widest uppercase text-sm">
            Estimation {data.annee} — Données exprimées en millions
          </p>
        </div>

        {/* LISTE DES RELIGIONS */}
        <div className="space-y-8 mb-12">
          {data.pratiquants.map((item) => {
            const pourcentage = ((item.nombre / data.total_estime_millions) * 100).toFixed(1);
            return (
              <div key={item.id} className="group">
                <div className="flex justify-between mb-2 items-end">
                  <span className="text-lg font-bold text-slate-800 uppercase italic">
                    {item.religion}
                  </span>
                  <span className="text-slate-500 font-medium">
                    <span className="text-xl font-black text-slate-900">
                      {item.nombre} millions
                    </span> 
                    <span className="ml-2 text-sm">({pourcentage}%)</span>
                  </span>
                </div>
                
                {/* Barre de progression */}
                <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden shadow-inner">
                  <div 
                    className="h-full transition-all duration-1000 ease-out rounded-full"
                    style={{ 
                      width: `${pourcentage}%`, 
                      backgroundColor: item.couleur || '#ef4444' 
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* RÉSUMÉ FINAL */}
        <div className="bg-slate-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-slate-400 uppercase font-bold tracking-[0.3em] text-xs mb-4 text-center">
              Total estimé des pratiquants
            </h2>
            <div className="text-5xl md:text-6xl font-black mb-2 text-center">
              {data.total_estime_millions} <span className="text-2xl text-red-500 italic">millions</span>
            </div>
            <p className="text-slate-500 text-sm italic mt-4">
              Source : Statistiques basées sur les recensements de {data.annee}
            </p>
          </div>
          
          {/* Filigrane décoratif */}
          <div className="absolute top-[-10px] right-[-10px] text-red-600 opacity-5 text-9xl font-black pointer-events-none">
            CHINA
          </div>
        </div>
      </div>
    </main>
  );
}