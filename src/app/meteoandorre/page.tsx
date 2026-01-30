"use client";
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Wind, Sun, Cloud, CloudRain } from 'lucide-react';

// IMPORT DYNAMIQUE CRUCIAL POUR ÉVITER L'ERREUR WINDOW
const MapAndorre = dynamic(() => import('@/components/MapAndorre'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-200 animate-pulse rounded-3xl" />
});

export default function MeteoAndorrePage() {
  const [ville, setVille] = useState('andorra-la-vella');
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // On appelle ton route.ts
    fetch(`/api/meteoandorre?ville=${ville}`)
      .then(res => res.json())
      .then(data => {
        setForecast(data.daily);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [ville]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-indigo-600 mb-6 font-bold">
          <ArrowLeft size={18} /> Retour
        </Link>

        <h1 className="text-3xl font-black mb-8 text-slate-800 uppercase">
          Météo <span className="text-indigo-600">Andorre</span>
        </h1>

        <div className="mb-8">
          <MapAndorre onCityChange={(id) => setVille(id)} />
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
          <h2 className="text-xl font-bold mb-6 capitalize text-indigo-900">
            Prévisions : {ville.replace(/-/g, ' ')}
          </h2>

          {loading ? (
            <div className="animate-pulse text-slate-400">Chargement des données pyrénéennes...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
              {forecast?.time?.map((date: string, i: number) => (
                <div key={date} className="flex flex-col items-center p-3 bg-slate-50 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                  </span>
                  <div className="text-xl font-black my-2">{Math.round(forecast.temperature_2m_max[i])}°</div>
                  <div className="flex items-center gap-1 text-[9px] text-blue-500 font-bold">
                    <Wind size={10} /> {forecast.windspeed_10m_max[i]} km/h
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
