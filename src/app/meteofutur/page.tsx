"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sun, Cloud, CloudRain, CloudLightning, Wind, Thermometer, MapPin, ArrowLeft } from 'lucide-react';

const icons: Record<number, React.ReactNode> = {
  0: <Sun className="text-orange-400" />, 1: <Sun className="text-orange-300" />,
  2: <Cloud className="text-gray-400" />, 3: <Cloud className="text-gray-500" />,
  61: <CloudRain className="text-blue-500" />, 95: <CloudLightning className="text-purple-600" />,
};

export default function MeteoToulouseAvenir() {
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/meteofutur')
      .then(res => res.json())
      .then(data => {
        setForecast(data.daily);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <nav className="mb-6 mt-4">
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* En-tête Toulouse */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            <MapPin size={12} /> Haute-Garonne
          </div>
          <h1 className="text-4xl font-black text-slate-900 uppercase">Toulouse <span className="text-indigo-600">Avenir</span></h1>
          <p className="text-slate-500 font-medium text-sm italic">Prévisions locales précises à 7 jours</p>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center animate-pulse text-indigo-600 font-bold">Chargement...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {forecast?.time?.map((date: string, i: number) => (
              <div key={date} className="bg-white p-5 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col items-center hover:scale-105 transition-transform duration-300">
                <span className="text-[10px] font-black text-slate-400 uppercase mb-3">
                  {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                </span>
                
                <div className="text-4xl mb-4">
                  {icons[forecast.weathercode[i]] || <Cloud className="text-slate-300" />}
                </div>

                <div className="text-2xl font-black text-slate-900">{Math.round(forecast.temperature_2m_max[i])}°</div>
                <div className="text-xs font-bold text-indigo-500 mb-4">{Math.round(forecast.temperature_2m_min[i])}°</div>

                <div className="w-full pt-4 border-t border-slate-50 space-y-2 text-[10px] font-bold uppercase">
                  <div className="flex justify-between">
                    <span className="text-slate-400">UV</span>
                    <span className={forecast.uv_index_max[i] > 5 ? 'text-orange-500' : 'text-emerald-500'}>{forecast.uv_index_max[i]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pluie</span>
                    <span className="text-blue-500">{forecast.precipitation_sum[i]}mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vent</span>
                    <span className="text-slate-700">{Math.round(forecast.windspeed_10m_max[i])}km/h</span>
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
