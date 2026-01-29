"use client";
import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Sun, Cloud, CloudRain, CloudLightning, ArrowLeft, Thermometer, MapPin, Wind } from 'lucide-react';

// --- (Gardez vos définitions de VILLES_PAR_DEPT, getCityLabel et icons ici) ---

const MapWithNoSSR = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-3xl flex items-center justify-center text-slate-400 font-bold">Chargement de la carte...</div>
});

export default function MeteoFuturPage() {
  const [ville, setVille] = useState('toulouse');
  const [activeDept, setActiveDept] = useState("Haute-Garonne (31)");
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const departements = useMemo(() => Object.keys(VILLES_PAR_DEPT), []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/meteofuturtoulouse?ville=${ville}`)
      .then(res => res.json())
      .then(data => {
        setForecast(data.daily);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur API:", err);
        setLoading(false);
      });
  }, [ville]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER COMPACT */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:translate-x-[-2px] transition-transform text-sm">
              <ArrowLeft size={16} /> Retour
            </Link>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              Météo <span className="text-indigo-600">Occitanie</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-3 px-5 rounded-2xl shadow-sm border border-slate-200">
            <MapPin size={20} className="text-indigo-600" />
            <span className="text-lg font-bold text-slate-800">{getCityLabel(ville)}</span>
          </div>
        </div>

        {/* CARTE (Plus compacte) */}
        <div className="bg-white p-2 rounded-[2rem] shadow-lg border border-slate-100 overflow-hidden">
          <MapWithNoSSR onCityChange={(id: string) => setVille(id)} />
        </div>

        {/* NOUVELLE STRUCTURE SANS VIDE */}
        <div className="space-y-4">
          {/* 1. SÉLECTEUR DE DÉPARTEMENT (Horizontal Scroll) */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Choisir un département</h2>
            <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar no-scrollbar">
              {departements.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setActiveDept(dept)}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    activeDept === dept 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                    : 'bg-slate-50 text-slate-600 border-transparent hover:border-slate-200'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* 2. SÉLECTEUR DE VILLE (Compact) */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Villes disponibles</h2>
            <div className="flex flex-wrap gap-2">
              {VILLES_PAR_DEPT[activeDept].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVille(v.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    ville === v.id 
                    ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION PRÉVISIONS (Remontée) */}
        <section className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-indigo-600 rounded-full"></div>
            <h3 className="text-2xl font-black text-slate-800">Prévisions 7 jours</h3>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {forecast?.time?.map((date: string, i: number) => {
                const windSpeed = Math.round(forecast?.windspeed_10m_max?.[i] || 0);
                return (
                  <div key={date} className="bg-slate-50/50 p-4 rounded-2xl border border-transparent hover:bg-white hover:shadow-lg transition-all flex flex-col items-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase mb-4 text-center">
                      {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                    </span>
                    <div className="text-3xl mb-4">
                      {icons[forecast.weathercode[i]] || <Cloud className="text-slate-300" />}
                    </div>
                    <div className="text-center mb-4">
                      <div className="text-xl font-black text-slate-900 leading-none">{Math.round(forecast.temperature_2m_max[i])}°</div>
                      <div className="text-xs font-bold text-indigo-400 mt-1">{Math.round(forecast.temperature_2m_min[i])}°</div>
                    </div>
                    <div className="w-full pt-3 border-t border-slate-200/60 space-y-2">
                       <div className="flex justify-between items-center text-[9px] font-bold">
                        <span className="text-slate-400">PLUIE</span>
                        <span className="text-blue-500">{forecast.precipitation_sum[i]}mm</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-bold">
                        <span className="text-slate-400 flex items-center gap-1"><Wind size={10} /> VENT</span>
                        <span className="text-slate-700">{windSpeed}km/h</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
