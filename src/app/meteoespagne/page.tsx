"use client";

import React, { useEffect, useState } from 'react';
import { Sun, Cloud, CloudRain, Wind, MapPin, ArrowLeft, CloudLightning, CloudSun, CloudFog } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// --- 1. CONFIGURATION DES VILLES ---
const VILLES = [
  { id: "ainsa", label: "Ainsa" }, { id: "huesca", label: "Huesca" }, { id: "barbastro", label: "Barbastro" },
  { id: "lerida", label: "Lérida" }, { id: "tremp", label: "Tremp" }, { id: "berga", label: "Berga" },
  { id: "ripoll", label: "Ripoll" }, { id: "olot", label: "Olot" }, { id: "figueras", label: "Figueras" },
  { id: "cadaques", label: "Cadaqués" }, { id: "portbou", label: "Portbou" }, { id: "le-perthus", label: "Le Perthus" },
  { id: "pas-de-la-case", label: "Pas de la Case" }, { id: "bossost", label: "Bossòst" }, { id: "st-lary", label: "Saint-Lary" }
];

// --- 2. IMPORT DYNAMIQUE (Correction Zoom Molette incluse dans les props si géré par le composant) ---
const MapWithNoSSR = dynamic(() => import('@/components/MapEspagne'), { 
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-[2rem] flex items-center justify-center text-orange-400 font-bold italic">
      Chargement du radar pyrénéen...
    </div>
  )
});

const icons: Record<number, React.ReactNode> = {
  0: <Sun className="text-amber-400" size={32} />, 
  1: <Sun className="text-amber-300" size={32} />,
  2: <CloudSun className="text-orange-300" size={32} />, 
  3: <Cloud className="text-slate-400" size={32} />,
  45: <CloudFog className="text-slate-300" size={32} />,
  61: <CloudRain className="text-blue-400" size={32} />,
  63: <CloudRain className="text-blue-600" size={32} />,
  95: <CloudLightning className="text-purple-500" size={32} />,
};

export default function MeteoEspagne() {
  const [ville, setVille] = useState('ainsa');
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const currentCityLabel = VILLES.find(v => v.id === ville)?.label || ville;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/meteoespagne?ville=${ville}`)
      .then(res => res.json())
      .then(data => { 
        setForecast(data.daily); 
        setLoading(false); 
      })
      .catch(err => {
        console.error("ERREUR TACTIQUE:", err);
        setLoading(false);
      });
  }, [ville]);

  return (
    <div className="min-h-screen bg-orange-50/30 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER NAVIGATION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link href="/" className="inline-flex items-center gap-2 text-orange-600 font-black hover:translate-x-[-4px] transition-transform text-xs uppercase tracking-widest">
              <ArrowLeft size={16} /> Retour Accueil
            </Link>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">
              Météo <span className="text-orange-600">Espagne</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-3 px-6 rounded-2xl shadow-xl border border-orange-100 animate-in fade-in slide-in-from-top-4">
            <MapPin size={20} className="text-orange-600 animate-bounce" />
            <span className="text-lg font-black text-slate-800 uppercase italic">{currentCityLabel}</span>
          </div>
        </div>

        {/* CARTE INTERACTIVE - ZOOM ACTIVÉ VIA COMPOSANT ENFANT */}
        <div className="bg-white p-2 rounded-[2.5rem] shadow-2xl border border-orange-100 overflow-hidden h-[450px] relative z-0">
          <MapWithNoSSR onCityChange={(id: string) => setVille(id)} />
        </div>

        {/* SÉLECTEUR DE SECTEURS */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-orange-50">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">Postes de surveillance frontaliers</p>
          <div className="flex flex-wrap justify-center gap-2">
            {VILLES.map(v => (
              <button 
                key={v.id} 
                onClick={() => setVille(v.id)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                  ville === v.id 
                  ? 'bg-orange-600 text-white border-orange-600 shadow-lg scale-105 z-10' 
                  : 'bg-slate-50 text-slate-500 border-transparent hover:bg-orange-50 hover:border-orange-200'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* GRILLE TACTIQUE 7 JOURS */}
        <section className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-orange-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none uppercase font-black text-6xl">7 DAYS</div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-8 border-orange-100 border-t-orange-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-orange-600 font-black uppercase tracking-widest text-xs italic">Réception des ondes météo...</p>
            </div>
          ) : forecast ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {forecast.time?.map((date: string, i: number) => (
                <div key={date} className={`p-5 rounded-[2rem] border transition-all flex flex-col items-center group ${i === 0 ? 'bg-orange-50/50 border-orange-200' : 'bg-slate-50 border-transparent hover:bg-white hover:shadow-xl hover:border-slate-100'}`}>
                  <span className="text-[10px] font-black text-slate-400 uppercase mb-5 tracking-tighter">
                    {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                  </span>
                  
                  <div className="mb-5 group-hover:scale-125 transition-transform duration-500">
                    {icons[forecast.weather_code?.[i]] || <Cloud className="text-slate-300" size={32} />}
                  </div>
                  
                  <div className="text-center mb-5">
                    <div className="text-2xl font-black text-slate-900 leading-none">{Math.round(forecast.temperature_2m_max[i])}°</div>
                    <div className="text-xs font-bold text-orange-500 mt-1 uppercase tracking-widest">{Math.round(forecast.temperature_2m_min[i])}°</div>
                  </div>
                  
                  <div className="w-full pt-4 border-t border-slate-200/60 space-y-3">
                    <div className="flex justify-between items-center text-[9px] font-black italic">
                      <span className="text-slate-400 uppercase">UV</span>
                      <span className={forecast.uv_index_max[i] > 6 ? 'text-orange-600' : 'text-emerald-500'}>
                        {Math.round(forecast.uv_index_max[i])}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-black italic">
                      <span className="text-slate-400 uppercase tracking-tighter">Vent</span>
                      <span className="text-slate-700">
                        {Math.round(forecast.wind_speed_10m_max[i])} <small className="text-[7px]">KM/H</small>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 font-black text-slate-300 uppercase italic">Signal météo perdu.</div>
          )}
        </section>

      </div>
    </div>
  );
}