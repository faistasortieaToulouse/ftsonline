"use client";
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Wind, MapPin, Thermometer, Sun, Cloud, CloudRain, Snowflakes } from 'lucide-react';

// Import dynamique pour éviter l'erreur "window is not defined" au build
const MapAndorre = dynamic(() => import('@/components/MapAndorre'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-200 animate-pulse rounded-3xl" />
});

// Mapping des icônes météo Open-Meteo
const icons: Record<number, React.ReactNode> = {
  0: <Sun className="text-orange-400" />,
  1: <Sun className="text-orange-300" />,
  2: <Cloud className="text-gray-400" />,
  3: <Cloud className="text-gray-500" />,
  71: <Snowflakes className="text-blue-200" />, // Neige (important en Andorre !)
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

  useEffect(() => {
    async function getMeteo() {
      setLoading(true);
      try {
        // L'ID 'ville' envoyé ici doit correspondre aux clés de votre route.ts
        const res = await fetch(`/api/meteoandorre?ville=${ville}`);
        const data = await res.json();
        setForecast(data.daily);
      } catch (err) {
        console.error("Erreur de récupération:", err);
      } finally {
        setLoading(false);
      }
    }
    getMeteo();
  }, [ville]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        <Link href="/" className="flex items-center gap-2 text-indigo-600 mb-6 font-bold hover:translate-x-[-4px] transition-transform w-fit">
          <ArrowLeft size={18} /> Retour Accueil
        </Link>

        <header className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
            Météo <span className="text-indigo-600">Andorre</span>
          </h1>
          <p className="text-slate-500 italic">Sélectionnez une paroisse sur la carte ou via les boutons</p>
        </header>

        {/* 1. LA CARTE INTERACTIVE */}
        <div className="mb-10 shadow-2xl rounded-[2rem] overflow-hidden border-4 border-white">
          <MapAndorre onCityChange={(id) => setVille(id)} />
        </div>

        {/* 2. LE SÉLECTEUR DE COMMUNES (BOUTONS) */}
        <div className="mb-8">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <MapPin size={14} /> Choisir une paroisse :
          </h2>
          <div className="flex flex-wrap gap-2">
            {PAROISSES_LIST.map((p) => (
              <button
                key={p.id}
                onClick={() => setVille(p.id)}
                className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                  ville === p.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-indigo-50'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* 3. AFFICHAGE DES RÉSULTATS */}
        <section className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
          <h3 className="text-2xl font-black text-slate-800 mb-8 capitalize flex items-center gap-3">
            <Thermometer className="text-indigo-600" />
            7 jours à {ville.replace(/-/g, ' ')}
          </h3>

          {loading ? (
            <div className="py-20 text-center animate-pulse text-indigo-300 font-bold italic">
              Analyse des données météo en cours...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              {forecast?.time?.map((date: string, i: number) => (
                <div key={date} className="bg-slate-50/50 p-5 rounded-3xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all flex flex-col items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase mb-4">
                    {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                  </span>
                  
                  <div className="text-4xl mb-4">
                    {icons[forecast.weathercode[i]] || <Cloud className="text-slate-300" />}
                  </div>

                  <div className="text-center mb-4">
                    <div className="text-2xl font-black text-slate-900 leading-none">{Math.round(forecast.temperature_2m_max[i])}°</div>
                    <div className="text-xs font-bold text-indigo-400 mt-1">{Math.round(forecast.temperature_2m_min[i])}°</div>
                  </div>

                  <div className="w-full pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                      <div className="flex items-center gap-1">
                        <Wind size={12} className="text-blue-400" />
                        <span>{Math.round(forecast.windspeed_10m_max[i])} <span className="text-[8px]">km/h</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
