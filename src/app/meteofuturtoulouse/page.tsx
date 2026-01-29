"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sun, Cloud, CloudRain, CloudLightning, ArrowLeft, Thermometer } from 'lucide-react';

const icons: Record<number, React.ReactNode> = {
  0: <Sun className="text-orange-400" />,
  1: <Sun className="text-orange-300" />,
  2: <Cloud className="text-gray-400" />,
  3: <Cloud className="text-gray-500" />,
  61: <CloudRain className="text-blue-500" />,
  95: <CloudLightning className="text-purple-600" />,
};

export default function MeteoFuturPage() {
  const [ville, setVille] = useState('toulouse');
  const [forecast, setForecast] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/meteofuturtoulouse?ville=${ville}`)
      .then(res => res.json())
      .then(data => setForecast(data.daily));
  }, [ville]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <Link href="/" className="flex items-center gap-2 text-indigo-600 mb-8 font-bold">
          <ArrowLeft size={18} /> Retour Accueil
        </Link>

        <h1 className="text-3xl font-black text-slate-800 mb-6 uppercase">
          Prévisions <span className="text-indigo-600">7 Jours</span>
        </h1>

        {/* Sélecteur de Zone */}
        <div className="flex gap-2 mb-8 bg-white p-1 rounded-xl shadow-sm w-fit border border-slate-200">
          {['toulouse', 'carcassonne', 'montpellier'].map((v) => (
            <button
              key={v}
              onClick={() => setVille(v)}
              className={`px-6 py-2 rounded-lg capitalize font-bold transition-all ${
                ville === v ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {v === 'carcassonne' ? 'L\'Aude' : v === 'montpellier' ? 'Occitanie Est' : v}
            </button>
          ))}
        </div>

        {/* Grille des prévisions */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {forecast?.time.map((date: string, i: number) => (
            <div key={date} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase">
                {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
              </span>
              
              <div className="text-3xl my-4">
                {icons[forecast.weathercode[i]] || <Cloud />}
              </div>

              <div className="flex flex-col items-center">
                <span className="text-lg font-black text-indigo-900">{Math.round(forecast.temperature_2m_max[i])}°</span>
                <span className="text-xs text-slate-400">{Math.round(forecast.temperature_2m_min[i])}°</span>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 w-full text-[9px] text-center text-slate-500">
                <p>Pluie : {forecast.precipitation_sum[i]}mm</p>
                <p>UV : {forecast.uv_index_max[i]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
