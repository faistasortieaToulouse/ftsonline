"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Wind, Sun, Cloud, CloudRain, CloudSun, CloudFog, CloudLightning, Info, Droplets, Thermometer, Calendar, Zap, Compass, MapPin } from 'lucide-react';

const MapAude = dynamic(() => import('@/components/MapAude'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-200 animate-pulse rounded-[2.5rem] flex items-center justify-center text-slate-400 font-bold">Chargement de la carte de l'Aude...</div>
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
  { id: "lezignan", name: "Lézignan-Corbières" },
  { id: "carcassonne", name: "Carcassonne" },
  { id: "narbonne", name: "Narbonne" },
];

const NORMALES_CLIMAT = {
  carcassonne: { pluie: 640, soleil: 2120, moyAn: "14,5°C", moyJan: "6,8°C", moyEte: "23,2°C", ventNorm: 75, joursChauds: 85 },
  lezignan: { pluie: 580, soleil: 2350, moyAn: "14,8°C", moyJan: "7,0°C", moyEte: "23,5°C", ventNorm: 95, joursChauds: 95 },
  narbonne: { pluie: 550, soleil: 2500, moyAn: "15,4°C", moyJan: "8,2°C", moyEte: "23,8°C", ventNorm: 120, joursChauds: 105 }
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
        const data = await res.json();
        setAudeStats(data.stats);
        setForecast(data.daily);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    getData();
  }, [ville, isMounted]);

  if (!isMounted) return null;
  const normale = NORMALES_CLIMAT[ville as keyof typeof NORMALES_CLIMAT];

  return (
    <div className="min-h-screen bg-[#f4f7ff] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        <Link href="/" className="flex items-center gap-2 text-indigo-600 mb-6 font-bold hover:underline w-fit uppercase text-xs">
          <ArrowLeft size={16} /> Retour à l'accueil
        </Link>

        {/* HEADER */}
        <header className="bg-indigo-600 rounded-[2.5rem] p-10 text-center text-white mb-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10"><Sun size={120} /></div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-2">
            Observatoire de l'Aude
          </h1>
          <p className="text-indigo-100 font-bold opacity-80 uppercase tracking-widest text-sm">
            Météo, Cumuls et Vents Régionaux
          </p>
        </header>

        {/* CARTE */}
        <div className="mb-10 shadow-2xl rounded-[3rem] overflow-hidden border-[12px] border-white bg-white">
          <MapAude onCityChange={(id: string) => setVille(id)} />
        </div>

        {/* SÉLECTEUR DE VILLES (NAVIGATION) */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {VILLES_LIST.map((v) => (
            <button
              key={v.id}
              onClick={() => setVille(v.id)}
              className={`px-6 py-3 rounded-full font-black uppercase text-xs tracking-widest transition-all flex items-center gap-2 shadow-sm ${
                ville === v.id 
                ? 'bg-indigo-600 text-white scale-105 shadow-indigo-200' 
                : 'bg-white text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-100'
              }`}
            >
              <MapPin size={14} />
              {v.name}
            </button>
          ))}
        </div>

        {/* DASHBOARD PRINCIPAL */}
        <div className={`bg-[#eef2ff] rounded-[3rem] p-8 border border-indigo-100 shadow-sm space-y-8 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
          
          {/* HEADER VILLE */}
          <div className="flex flex-col md:flex-row justify-between items-center px-4">
             <div className="flex flex-col">
                <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tight italic">
                  {VILLES_LIST.find(v => v.id === ville)?.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                   {icons[forecast?.weather_code[0]] || <Cloud className="text-slate-300" size={24} />}
                   <span className="text-indigo-600 font-black uppercase text-[10px]">Aujourd'hui</span>
                </div>
             </div>
             <div className="text-right flex items-baseline gap-4">
                <span className="text-7xl font-black text-indigo-700">{forecast ? Math.round(forecast.temperature_2m_max[0]) : '--'}°</span>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Moy. Annuelle</p>
                  <p className="text-sm font-black text-slate-600 tracking-tighter">{normale.moyAn}</p>
                </div>
             </div>
          </div>

          {/* STATS RAPIDES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex justify-around items-center">
              <div className="text-center">
                <p className="text-[9px] font-black text-blue-500 uppercase mb-1">Moy. Janvier</p>
                <p className="text-xl font-black text-slate-800">{normale.moyJan}</p>
              </div>
              <div className="h-8 w-[1px] bg-slate-100"></div>
              <div className="text-center">
                <p className="text-[9px] font-black text-orange-400 uppercase mb-1">Moy. Été</p>
                <p className="text-xl font-black text-slate-800">{normale.moyEte}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex justify-around items-center">
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Vent {'>'} 57 km/h</p>
                <p className="text-2xl font-black text-indigo-700">{audeStats?.joursVentes || 0}j</p>
                <p className="text-[8px] font-bold text-slate-300 uppercase leading-none tracking-tight">Normal: {normale.ventNorm}j</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Jours {'>'} 25°C</p>
                <p className="text-2xl font-black text-orange-500">0j</p>
                <p className="text-[8px] font-bold text-slate-300 uppercase leading-none tracking-tight">Normal: {normale.joursChauds}j</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 text-center flex flex-col justify-center">
              <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Record 2026</p>
              <p className="text-2xl font-black text-red-500">{forecast ? Math.max(...forecast.temperature_2m_max) : '--'}°C</p>
              <p className="text-[8px] font-bold text-slate-300 uppercase">Max Hebdomadaire</p>
            </div>
          </div>

          {/* PRÉVISIONS 7 JOURS */}
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
            {forecast?.time.map((date: string, i: number) => (
              <div key={date} className="bg-white p-5 rounded-[2.5rem] shadow-sm flex flex-col items-center border-2 border-transparent hover:border-indigo-100 transition-all">
                <span className="text-[10px] font-black text-slate-400 uppercase mb-3">
                  {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                </span>
                <div className="mb-3">
                  {icons[forecast.weather_code[i]] || <Cloud className="text-slate-300" size={32} />}
                </div>
                <div className="text-2xl font-black text-slate-800">{Math.round(forecast.temperature_2m_max[i])}°</div>
                <div className="text-xs font-bold text-indigo-400 mb-4">{Math.round(forecast.temperature_2m_min[i])}°</div>
                <div className="w-full pt-3 border-t border-slate-50 space-y-2">
                   <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400">
                      <span className="flex items-center gap-1"><Wind size={10} className="text-blue-300"/> Vent</span>
                      <span className="text-slate-700">{Math.round(forecast.wind_speed_10m_max[i])} <small className="lowercase">km/h</small></span>
                   </div>
                </div>
              </div>
            ))}
          </div>

          {/* BILAN CUMULÉ */}
          {!loading && audeStats && (
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-indigo-50">
               <h4 className="font-black text-indigo-900 uppercase tracking-tighter flex items-center gap-2 italic mb-1">
                 <Calendar size={18} className="text-indigo-400" /> Bilan Annuel 2026
               </h4>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 ml-7">
                 Depuis le 1er janvier
               </p>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <Sun className="text-orange-400" size={28} />
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase">Ensoleillement</p>
                        <p className="text-2xl font-black text-indigo-900">{audeStats.totalSunshine}h</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Normal: {normale.soleil}h</p>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-orange-400" style={{ width: `${Math.min((audeStats.totalSunshine / normale.soleil) * 100, 100)}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <Droplets className="text-blue-500" size={28} />
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase">Cumul Pluie</p>
                        <p className="text-2xl font-black text-indigo-900">{audeStats.totalRain} mm</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Normal: {normale.pluie} mm</p>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-blue-500" style={{ width: `${Math.min((audeStats.totalRain / normale.pluie) * 100, 100)}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-[2rem] flex flex-col justify-between">
                     <p className="text-[10px] font-black text-emerald-600 uppercase">Bilan Hydrique Sol</p>
                     <p className="text-3xl font-black text-emerald-700">+{audeStats.waterBalance} mm</p>
                     <span className="text-[8px] font-black text-emerald-500 bg-white px-2 py-1 rounded-full border border-emerald-100 w-fit uppercase italic">Stable</span>
                  </div>
               </div>
            </div>
          )}

          {/* SECTION ROSE DES VENTS */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 opacity-10 -rotate-12 translate-x-4 -translate-y-4">
                <Compass size={200} />
             </div>
             
             <h4 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3 mb-8">
               <Wind className="text-blue-400" /> Rose des Vents de l'Aude
             </h4>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-4">
                   <p className="text-xs font-black text-blue-400 uppercase tracking-widest border-b border-blue-400/30 pb-2">Vents Dominants</p>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                         <p className="text-lg font-black italic text-orange-400">Le Cers</p>
                         <p className="text-[10px] text-slate-300 leading-tight mt-1">NW : sec et froid en hiver, il dégage le ciel. C'est le vent maître.</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                         <p className="text-lg font-black italic text-blue-400">L'Autan</p>
                         <p className="text-[10px] text-slate-300 leading-tight mt-1">SE : turbulent et chaud, surnommé le "vent des fous".</p>
                      </div>
                   </div>
                   <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                      <p className="text-lg font-black italic text-emerald-400">Le Marin</p>
                      <p className="text-[10px] text-slate-300 leading-tight mt-1">Vent de mer apportant humidité, entrées maritimes et pluie.</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <p className="text-xs font-black text-indigo-400 uppercase tracking-widest border-b border-indigo-400/30 pb-2">Vents Régionaux</p>
                   <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                         <p className="text-xs font-bold text-indigo-300">Le Grec (Grégal)</p>
                         <p className="text-[9px] text-slate-400">Nord-Est. Tempêtes en mer.</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                         <p className="text-xs font-bold text-indigo-300">Le Ponant</p>
                         <p className="text-[9px] text-slate-400">Ouest. Rare et chaud.</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                         <p className="text-xs font-bold text-indigo-300">Le Labech</p>
                         <p className="text-[9px] text-slate-400">Sud-Ouest (Garbin).</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                         <p className="text-xs font-bold text-indigo-300">Vent d'Espagne</p>
                         <p className="text-[9px] text-slate-400">Sud. Annonce le changement.</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}