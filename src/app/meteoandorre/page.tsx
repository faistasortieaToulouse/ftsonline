"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { 
  ArrowLeft, Wind, Thermometer, Sun, Cloud, 
  CloudRain, Snowflake, SunMedium, Eye, Timer 
} from 'lucide-react';

const MapAndorre = dynamic(() => import('@/components/MapAndorre'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-200 animate-pulse rounded-3xl flex items-center justify-center text-slate-400 font-bold uppercase italic text-xs">Chargement de la carte...</div>
});

const icons: Record<number, React.ReactNode> = {
  0: <Sun className="text-orange-400" />,
  1: <Sun className="text-orange-300" />,
  2: <Cloud className="text-gray-400" />,
  3: <Cloud className="text-gray-500" />,
  71: <Snowflake className="text-blue-300 animate-pulse" />, 
  73: <Snowflake className="text-blue-400 animate-pulse" />,
  75: <Snowflake className="text-blue-500 animate-pulse" />,
  95: <CloudRain className="text-indigo-600" />,
};

const PAROISSES_LIST = [
  { id: "andorra-la-vella", name: "Andorra la Vella" },
  { id: "canillo", name: "Canillo" },
  { id: "encamp", name: "Encamp" },
  { id: "escaldes-engordany", name: "Escaldes" },
  { id: "la-massana", name: "La Massana" },
  { id: "ordino", name: "Ordino" },
  { id: "sant-julia-de-loria", name: "Sant Julià" },
];

export default function MeteoAndorrePage() {
  const [ville, setVille] = useState('andorra-la-vella');
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (!isMounted) return;
    async function getMeteo() {
      setLoading(true);
      try {
        const res = await fetch(`/api/meteoandorre?ville=${ville}`);
        const data = await res.json();
        // On s'attend à recevoir 'daily' de l'API Open-Meteo
        if (data && data.daily) setForecast(data.daily);
        else setForecast(null);
      } catch (err) {
        setForecast(null);
      } finally {
        setLoading(false);
      }
    }
    getMeteo();
  }, [ville, isMounted]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-10 flex justify-between items-end">
          <div>
            <Link href="/" className="flex items-center gap-2 text-indigo-600 mb-4 font-bold hover:translate-x-[-4px] transition-transform w-fit uppercase text-[10px] italic">
              <ArrowLeft size={14} /> Retour Accueil
            </Link>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
              Météo <span className="text-indigo-600">Andorre</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase mt-2 tracking-widest">Principales paroisses et stations d'altitude</p>
          </div>
          <div className="hidden md:flex bg-white px-5 py-3 rounded-2xl border border-slate-200 items-center gap-3 text-sm font-black shadow-sm text-slate-700">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </header>

        <div className="mb-10 shadow-2xl rounded-[3rem] overflow-hidden border-4 border-white bg-white h-[400px]">
          <MapAndorre onCityChange={(id: string) => setVille(id)} />
        </div>

        {/* SÉLECTEUR DE PAROISSES */}
        <div className="mb-8 flex flex-wrap gap-2 justify-center">
          {PAROISSES_LIST.map((p) => (
            <button
              key={p.id}
              onClick={() => setVille(p.id)}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all border shadow-sm ${
                ville === p.id 
                ? 'bg-indigo-600 text-white border-indigo-600' 
                : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-200 hover:text-indigo-600'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* SECTION PRÉVISIONS */}
        <section className="bg-white p-4 md:p-8 rounded-[3rem] shadow-xl border border-slate-100">
          <div className="flex items-center justify-between mb-8 px-4">
            <h3 className="text-xl font-black text-slate-800 uppercase flex items-center gap-3 italic">
              <Thermometer className="text-indigo-600" />
              7 jours à {ville.replace(/-/g, ' ')}
            </h3>
            <span className="text-[10px] font-black text-indigo-400 uppercase border-b-2 border-indigo-100 pb-1">Prévisions détaillées</span>
          </div>

          {loading ? (
            <div className="py-20 text-center animate-pulse text-indigo-300 font-black uppercase italic tracking-widest">Analyse des courants de montagne...</div>
          ) : forecast ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
              {forecast.time.map((date: string, i: number) => (
                <div key={date} className={`p-5 rounded-[2.5rem] border transition-all flex flex-col items-center ${
                  i === 0 ? 'bg-indigo-50/50 border-indigo-100 shadow-inner' : 'bg-slate-50/30 border-transparent hover:bg-white hover:border-indigo-100 hover:shadow-lg'
                }`}>
                  
                  <span className="text-[9px] font-black text-slate-400 uppercase mb-4 tracking-tighter">
                    {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                  </span>
                  
                  <div className="text-4xl mb-4 filter drop-shadow-sm">
                    {icons[forecast.weathercode[i]] || <Cloud className="text-slate-300" />}
                  </div>

                  <div className="text-center mb-6 leading-none">
                    <div className="text-2xl font-black text-slate-900 tracking-tighter">{Math.round(forecast.temperature_2m_max[i])}°</div>
                    <div className="text-[10px] font-bold text-indigo-400 mt-1">{Math.round(forecast.temperature_2m_min[i])}°</div>
                  </div>

                  {/* BLOC DONNÉES TECHNIQUES */}
                  <div className="w-full pt-4 border-t border-slate-200/50 space-y-3">
                    {/* VENT */}
                    <div className="flex justify-between items-center text-[9px] font-black uppercase">
                      <div className="flex items-center gap-1.5 text-blue-400"><Wind size={12} /> Vent</div>
                      <span className="text-slate-700">{Math.round(forecast.windspeed_10m_max[i])} <small className="lowercase">km/h</small></span>
                    </div>

                    {/* UV */}
                    <div className="flex justify-between items-center text-[9px] font-black uppercase">
                      <div className="flex items-center gap-1.5 text-orange-500"><SunMedium size={12} /> Indice UV</div>
                      <span className={`px-1.5 py-0.5 rounded ${forecast.uv_index_max[i] > 5 ? 'bg-orange-100 text-orange-600' : 'text-slate-700'}`}>
                        {forecast.uv_index_max[i].toFixed(1)}
                      </span>
                    </div>

                    {/* NEIGE (Si présente) ou VISIBILITÉ */}
                    {forecast.snowfall_sum && forecast.snowfall_sum[i] > 0 ? (
                      <div className="flex justify-between items-center text-[9px] font-black uppercase">
                        <div className="flex items-center gap-1.5 text-cyan-500"><Snowflake size={12} /> Neige</div>
                        <span className="text-cyan-600">{forecast.snowfall_sum[i]}<small className="ml-0.5">cm</small></span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center text-[9px] font-black uppercase">
                        <div className="flex items-center gap-1.5 text-emerald-500"><Eye size={12} /> Visib.</div>
                        <span className="text-slate-700">24<small>km</small></span>
                      </div>
                    )}

                    {/* DURÉE DU JOUR */}
                    <div className="bg-white/60 rounded-xl p-2 flex justify-center items-center gap-1.5 border border-slate-100 shadow-sm mt-2">
                      <Timer size={10} className="text-indigo-300" />
                      <span className="text-[8px] font-black text-slate-400">9h 51min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 font-bold text-red-400 uppercase text-xs">Erreur lors de la récupération des données météo.</div>
          )}
        </section>
      </div>
    </div>
  );
}