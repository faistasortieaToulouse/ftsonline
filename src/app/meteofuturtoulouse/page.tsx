"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic'; // Pour charger la carte sans SSR
import { Sun, Cloud, CloudRain, CloudLightning, ArrowLeft, Thermometer, MapPin } from 'lucide-react';

// Chargement dynamique du composant Map (on désactive le rendu côté serveur)
const MapWithNoSSR = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-200 animate-pulse rounded-2xl flex items-center justify-center text-slate-400">Chargement de la carte...</div>
});

const icons: Record<number, React.ReactNode> = {
  0: <Sun className="text-orange-400" />,
  1: <Sun className="text-orange-300" />,
  2: <Cloud className="text-gray-400" />,
  3: <Cloud className="text-gray-500" />,
  45: <Cloud className="text-slate-300" />, // Brouillard
  61: <CloudRain className="text-blue-500" />,
  63: <CloudRain className="text-blue-600" />,
  95: <CloudLightning className="text-purple-600" />,
};

export default function MeteoFuturPage() {
  const [ville, setVille] = useState('toulouse');
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation */}
        <Link href="/" className="flex items-center gap-2 text-indigo-600 mb-8 font-bold hover:translate-x-[-4px] transition-transform">
          <ArrowLeft size={18} /> Retour Accueil
        </Link>

        <header className="mb-8">
          <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">
            Météo <span className="text-indigo-600">Occitanie</span>
          </h1>
          <p className="text-slate-500 italic">Prévisions détaillées à 7 jours</p>
        </header>

        {/* Sélecteur de Zone */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-1.5 rounded-2xl shadow-sm w-fit border border-slate-200">
          {['toulouse', 'carcassonne', 'montpellier'].map((v) => (
            <button
              key={v}
              onClick={() => setVille(v)}
              className={`px-6 py-2.5 rounded-xl capitalize font-bold transition-all flex items-center gap-2 ${
                ville === v ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <MapPin size={14} />
              {v === 'carcassonne' ? "L'Aude" : v === 'montpellier' ? 'Hérault' : v}
            </button>
          ))}
        </div>

        {/* SECTION CARTE */}
        <div className="mb-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
          <MapWithNoSSR ville={ville} />
        </div>

        {/* SECTION PRÉVISIONS */}
        {loading ? (
          <div className="text-center py-20 text-indigo-300 animate-pulse font-bold">Récupération des bulletins...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {forecast?.time.map((date: string, i: number) => (
              <div key={date} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center hover:shadow-md transition-shadow">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                </span>
                
                <div className="text-4xl my-5">
                  {icons[forecast.weathercode[i]] || <Cloud className="text-slate-400" />}
                </div>

                <div className="flex flex-col items-center mb-4">
                  <span className="text-2xl font-black text-indigo-950">{Math.round(forecast.temperature_2m_max[i])}°</span>
                  <span className="text-xs font-bold text-indigo-400/70">{Math.round(forecast.temperature_2m_min[i])}°</span>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-50 w-full text-[10px] space-y-1 font-medium text-slate-500">
                  <div className="flex justify-between">
                    <span>Pluie</span>
                    <span className="text-blue-600">{forecast.precipitation_sum[i]}mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Indice UV</span>
                    <span className={forecast.uv_index_max[i] > 5 ? 'text-orange-600 font-bold' : 'text-emerald-600'}>
                      {forecast.uv_index_max[i]}
                    </span>
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
