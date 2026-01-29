"use client";
import React, { useEffect, useState } from 'react';
import { Sun, Cloud, CloudRain, Wind, MapPin, ArrowLeft, Navigation } from 'lucide-react';
import Link from 'next/link';

const VILLES = [
  { id: "ainsa", label: "Ainsa" }, { id: "huesca", label: "Huesca" }, { id: "barbastro", label: "Barbastro" },
  { id: "lerida", label: "Lérida" }, { id: "tremp", label: "Tremp" }, { id: "berga", label: "Berga" },
  { id: "ripoll", label: "Ripoll" }, { id: "olot", label: "Olot" }, { id: "figueras", label: "Figueras" },
  { id: "cadaques", label: "Cadaqués" }, { id: "portbou", label: "Portbou" }, { id: "le-perthus", label: "Le Perthus" },
  { id: "pas-de-la-case", label: "Pas de la Case" }, { id: "bossost", label: "Bossòst" }, { id: "st-lary", label: "Saint-Lary" }
];

const icons: Record<number, React.ReactNode> = {
  0: <Sun className="text-amber-400" />, 1: <Sun className="text-amber-300" />,
  2: <Cloud className="text-slate-400" />, 3: <Cloud className="text-slate-500" />,
  61: <CloudRain className="text-blue-500" />,
};

export default function MeteoEspagne() {
  const [ville, setVille] = useState('ainsa');
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/meteoespagne?ville=${ville}`)
      .then(res => res.json())
      .then(data => { setForecast(data.daily); setLoading(false); });
  }, [ville]);

  return (
    <div className="min-h-screen bg-orange-50/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <Link href="/" className="text-orange-600 font-bold flex items-center gap-2 mb-4">
          <ArrowLeft size={18} /> Retour
        </Link>

        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
          Météo <span className="text-orange-600">Espagne & Frontière</span>
        </h1>

        {/* Sélecteur de villes */}
        <div className="flex flex-wrap gap-2 bg-white p-4 rounded-2xl shadow-sm">
          {VILLES.map(v => (
            <button 
              key={v.id} 
              onClick={() => setVille(v.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${ville === v.id ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-orange-100'}`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Grille de prévisions */}
        {loading ? (
          <div className="text-center py-20 font-bold text-orange-600 animate-pulse">Chargement de la météo espagnole...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {forecast?.time?.map((date: string, i: number) => (
              <div key={date} className="bg-white p-4 rounded-[2rem] shadow-lg border border-orange-100 flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase mb-3">
                  {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                </span>
                
                <div className="text-3xl mb-3">{icons[forecast.weathercode[i]] || <Cloud />}</div>
                
                <div className="text-xl font-black">{Math.round(forecast.temperature_2m_max[i])}°</div>
                
                <div className="w-full mt-4 pt-3 border-t border-slate-50 space-y-2 text-[9px] font-bold uppercase">
                  <div className="flex justify-between items-center text-orange-600">
                    <span>UV</span>
                    <span>{forecast.uv_index_max[i]}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1"><Wind size={10}/> Vent</span>
                    <span>{Math.round(forecast.windspeed_10m_max[i])}km/h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
