"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Wind, Sun, Cloud, CloudRain, CloudSun, CloudFog, CloudLightning, Info } from 'lucide-react';

const MapAude = dynamic(() => import('@/components/MapAude'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-200 animate-pulse rounded-3xl flex items-center justify-center text-slate-400 font-bold">Chargement de la carte de l'Aude...</div>
});

const icons: Record<number, React.ReactNode> = {
  0: <Sun className="text-orange-400" size={32} />,
  1: <CloudSun className="text-amber-500" size={32} />,
  2: <CloudSun className="text-amber-500" size={32} />,
  3: <Cloud className="text-slate-400" size={32} />,
  45: <CloudFog className="text-slate-300" size={32} />,
  51: <CloudRain className="text-blue-400" size={32} />,
  61: <CloudRain className="text-blue-500" size={32} />,
  80: <CloudRain className="text-blue-600" size={32} />,
  95: <CloudLightning className="text-indigo-600" size={32} />,
};

const VILLES_LIST = [
  { id: "lezignan", name: "Lézignan" },
  { id: "carcassonne", name: "Carcassonne" },
  { id: "narbonne", name: "Narbonne" },
];

const NORMALES_CLIMAT = {
  carcassonne: { pluie: 640, soleil: 2120, moyAn: "14,5°C" },
  lezignan: { pluie: 580, soleil: 2350, moyAn: "14,8°C" },
  narbonne: { pluie: 550, soleil: 2500, moyAn: "15,4°C" }
};

export default function MeteoAudePage() {
  const [ville, setVille] = useState('lezignan'); 
  const [audeStats, setAudeStats] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (!isMounted) return;

    async function getData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/meteoaude?ville=${ville}`);
        if (!res.ok) throw new Error("Erreur réseau");
        const data = await res.json();
        
        setAudeStats(data.stats);
        setForecast(data.daily);
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    }
    getData();
  }, [ville, isMounted]);

  if (!isMounted) return null;

  const normale = NORMALES_CLIMAT[ville as keyof typeof NORMALES_CLIMAT];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <Link href="/" className="flex items-center gap-2 text-indigo-600 mb-6 font-bold hover:translate-x-[-4px] transition-transform w-fit">
          <ArrowLeft size={18} /> Retour Accueil
        </Link>

        <header className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
            Observatoire <span className="text-indigo-600">Aude</span>
          </h1>
          <p className="text-slate-500 italic font-medium">Données en temps réel — Corbières, Minervois et Littoral</p>
        </header>

        <div className="mb-10 shadow-2xl rounded-[2rem] overflow-hidden border-4 border-white bg-white">
          <MapAude onCityChange={(id: string) => setVille(id)} />
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {VILLES_LIST.map((v) => (
            <button
              key={v.id}
              onClick={() => setVille(v.id)}
              className={`px-6 py-3 rounded-2xl text-sm font-black transition-all border ${
                ville === v.id ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              {v.name}
            </button>
          ))}
        </div>

        <section className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 mb-8">
          <h3 className="text-2xl font-black text-slate-800 capitalize flex items-center gap-3 mb-8">
            <Sun className="text-orange-400" /> Prévisions 7 jours : {ville}
          </h3>

          {loading ? (
            <div className="py-10 text-center animate-pulse text-indigo-300 font-bold">Analyse météo en cours...</div>
          ) : forecast ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              {forecast.time.map((date: string, i: number) => (
                <div key={date} className="bg-slate-50 p-5 rounded-3xl flex flex-col items-center border border-transparent hover:border-indigo-100 transition-all group">
                  <span className="text-[10px] font-black text-slate-400 uppercase mb-3">
                    {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                  </span>
                  
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                    {/* CORRECTION ICI : weather_code avec underscore */}
                    {icons[forecast.weather_code[i]] || <Cloud className="text-slate-300" />}
                  </div>
                  
                  <div className="text-xl font-black text-slate-900 leading-none">
                    {Math.round(forecast.temperature_2m_max[i])}°
                  </div>
                  <div className="text-xs font-bold text-indigo-400 mt-1 mb-4">
                    {Math.round(forecast.temperature_2m_min[i])}°
                  </div>

                  <div className="w-full pt-4 border-t border-slate-200 space-y-2">
                    <div className="flex items-center justify-center gap-1.5">
                      <Wind size={14} className="text-blue-400" />
                      <span className="text-[10px] font-bold text-slate-600">
                        {/* CORRECTION ICI : wind_speed_10m_max */}
                        {Math.round(forecast.wind_speed_10m_max[i])} <span className="opacity-60">km/h</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5">
                      <Sun size={14} className="text-orange-400" />
                      <span className="text-[10px] font-bold text-slate-600 uppercase">
                        UV {Math.round(forecast.uv_index_max[i])}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        {!loading && audeStats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-indigo-900 text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
              <h4 className="text-xs font-black uppercase tracking-widest text-indigo-300 mb-6 flex items-center gap-2">
                <Info size={16} /> Bilan cumulé 2026 : {ville}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                <div>
                  <p className="text-3xl font-black">{audeStats.totalRain}mm</p>
                  <p className="text-[9px] uppercase font-bold text-indigo-300">Pluie / Norm: {normale.pluie}mm</p>
                </div>
                <div>
                  <p className="text-3xl font-black">{audeStats.totalSunshine}h</p>
                  <p className="text-[9px] uppercase font-bold text-indigo-300">Soleil / Norm: {normale.soleil}h</p>
                </div>
                <div>
                  <p className="text-3xl font-black">{audeStats.joursVentes}j</p>
                  <p className="text-[9px] uppercase font-bold text-indigo-300">Jours de Vent Fort</p>
                </div>
                <div>
                  <p className="text-3xl font-black">{audeStats.waterBalance}mm</p>
                  <p className="text-[9px] uppercase font-bold text-indigo-300">Bilan Hydrique Sol</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-[2.5rem] p-8 flex flex-col justify-center border border-slate-200">
               <span className="text-[10px] font-black text-indigo-400 uppercase mb-2 tracking-widest text-center">Climatologie locale</span>
               <p className="text-sm text-slate-600 leading-relaxed italic text-center">
                 {ville === 'lezignan' 
                   ? "Lézignan bénéficie d'un ensoleillement exceptionnel, idéal pour les vignobles du Corbières, mais reste soumise aux vents dominants."
                   : "Ce secteur présente des normales climatiques caractéristiques de l'Aude, entre influences méditerranéennes et vents de terre."
                 }
               </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}