"use client";
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Wind, MapPin, Thermometer, Sun, Cloud, CloudRain, Snowflake } from 'lucide-react';

// Import dynamique strict pour Leaflet
const MapAndorre = dynamic(() => import('@/components/MapAndorre'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-200 animate-pulse rounded-3xl flex items-center justify-center text-slate-400 font-bold">Chargement de la carte des Pyrénées...</div>
});

const icons: Record<number, React.ReactNode> = {
  0: <Sun className="text-orange-400" />,
  1: <Sun className="text-orange-300" />,
  2: <Cloud className="text-gray-400" />,
  3: <Cloud className="text-gray-500" />,
  71: <Snowflake className="text-blue-200" />, 
  73: <Snowflake className="text-blue-300" />,
  75: <Snowflake className="text-blue-400" />,
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    async function getMeteo() {
      setLoading(true);
      try {
        const res = await fetch(`/api/meteoandorre?ville=${ville}`);
        if (!res.ok) throw new Error("Erreur réseau");
        const data = await res.json();
        
        // Vérification si les données daily existent bien
        if (data && data.daily) {
            setForecast(data.daily);
        } else {
            setForecast(null);
        }
      } catch (err) {
        console.error("Erreur de récupération:", err);
        setForecast(null);
      } finally {
        setLoading(false);
      }
    }
    getMeteo();
  }, [ville, isMounted]);

  if (!isMounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <Link href="/" className="flex items-center gap-2 text-indigo-600 mb-6 font-bold hover:translate-x-[-4px] transition-transform w-fit">
          <ArrowLeft size={18} /> Retour Accueil
        </Link>

        <header className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
            Météo <span className="text-indigo-600">Andorre</span>
          </h1>
          <p className="text-slate-500 italic font-medium">Cliquez sur une paroisse pour actualiser les prévisions</p>
        </header>

        {/* SECTION CARTE */}
        <div className="mb-10 shadow-2xl rounded-[2rem] overflow-hidden border-4 border-white bg-white">
          <MapAndorre onCityChange={(id: string) => setVille(id)} />
        </div>

        {/* SÉLECTEUR DE COMMUNES */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {PAROISSES_LIST.map((p) => (
              <button
                key={p.id}
                onClick={() => setVille(p.id)}
                className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all border ${
                  ville === p.id 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION PRÉVISIONS */}
        <section className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden relative">
          <h3 className="text-2xl font-black text-slate-800 capitalize flex items-center gap-3 mb-8">
            <Thermometer className="text-indigo-600" />
            7 jours à {ville.replace(/-/g, ' ')}
          </h3>

          {loading ? (
            <div className="py-20 text-center flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-indigo-300 font-bold italic animate-pulse">Calcul des prévisions en altitude...</p>
            </div>
          ) : forecast ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              {forecast.time.map((date: string, i: number) => (
                <div key={date} className="bg-slate-50/50 p-5 rounded-3xl border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-md transition-all flex flex-col items-center group">
                  <span className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-tighter">
                    {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                  </span>
                  
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {icons[forecast.weathercode[i]] || <Cloud className="text-slate-300" />}
                  </div>

                  <div className="text-center mb-4">
                    <div className="text-2xl font-black text-slate-900 leading-none">{Math.round(forecast.temperature_2m_max[i] ?? 0)}°</div>
                    <div className="text-xs font-bold text-indigo-400 mt-1">{Math.round(forecast.temperature_2m_min[i] ?? 0)}°</div>
                  </div>

                  <div className="w-full pt-4 border-t border-slate-100">
                    <div className="flex justify-center items-center gap-2 text-[10px] font-bold text-slate-500">
                        <Wind size={12} className="text-blue-400" />
                        <span>{Math.round(forecast.windspeed_10m_max[i] ?? 0)} <span className="text-[8px] opacity-60 uppercase">km/h</span></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
                <p className="text-slate-400 italic">Données météo momentanément indisponibles pour cette paroisse.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}