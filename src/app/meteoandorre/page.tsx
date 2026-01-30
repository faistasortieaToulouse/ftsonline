"use client";
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Wind, Thermometer, Sun, Cloud, CloudRain, Snowflake, SunMedium } from 'lucide-react';

const MapAndorre = dynamic(() => import('@/components/MapAndorre'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-200 animate-pulse rounded-3xl flex items-center justify-center text-slate-400 font-bold">Chargement de la carte des Pyrénées...</div>
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
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-indigo-600 mb-6 font-bold hover:translate-x-[-4px] transition-transform w-fit uppercase text-xs">
          <ArrowLeft size={16} /> Retour Accueil
        </Link>

        <header className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">
            Météo <span className="text-indigo-600">Andorre</span>
          </h1>
        </header>

        <div className="mb-10 shadow-2xl rounded-[2rem] overflow-hidden border-4 border-white bg-white">
          <MapAndorre onCityChange={(id: string) => setVille(id)} />
        </div>

        {/* SÉLECTEUR */}
        <div className="mb-8 flex flex-wrap gap-2">
          {PAROISSES_LIST.map((p) => (
            <button
              key={p.id}
              onClick={() => setVille(p.id)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase transition-all border ${
                ville === p.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-indigo-50'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* PRÉVISIONS */}
        <section className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <h3 className="text-xl font-black text-slate-800 uppercase flex items-center gap-3 mb-8 italic">
            <Thermometer className="text-indigo-600" />
            7 jours à {ville.replace(/-/g, ' ')}
          </h3>

          {loading ? (
            <div className="py-20 text-center animate-pulse text-indigo-300 font-bold uppercase italic">Analyse des sommets...</div>
          ) : forecast ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              {forecast.time.map((date: string, i: number) => (
                <div key={date} className="bg-slate-50/50 p-4 rounded-3xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all flex flex-col items-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase mb-3">
                    {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                  </span>
                  
                  <div className="text-3xl mb-3">
                    {icons[forecast.weathercode[i]] || <Cloud className="text-slate-300" />}
                  </div>

                  <div className="text-center mb-4">
                    <div className="text-xl font-black text-slate-900">{Math.round(forecast.temperature_2m_max[i])}°</div>
                    <div className="text-[10px] font-bold text-indigo-400">{Math.round(forecast.temperature_2m_min[i])}°</div>
                  </div>

                  {/* NOUVEAUX BLOCS : VENT, UV, NEIGE */}
                  <div className="w-full pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-bold">
                      <div className="flex items-center gap-1 text-blue-400"><Wind size={10} /> Vent</div>
                      <span className="text-slate-700">{Math.round(forecast.windspeed_10m_max[i])}</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-bold">
                      <div className="flex items-center gap-1 text-orange-400"><SunMedium size={10} /> UV</div>
                      <span className="text-slate-700">{Math.round(forecast.uv_index_max[i])}</span>
                    </div>
                    {forecast.snowfall_sum[i] > 0 && (
                      <div className="flex justify-between items-center text-[9px] font-bold">
                        <div className="flex items-center gap-1 text-cyan-500"><Snowflake size={10} /> Neige</div>
                        <span className="text-cyan-600 font-black">{forecast.snowfall_sum[i]}<small className="text-[7px] ml-0.5">cm</small></span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}