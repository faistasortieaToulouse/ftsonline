"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Wind, Sun, Cloud, CloudRain, CloudSun, CloudFog, 
  CloudLightning, Droplets, Calendar, Compass, MapPin 
} from 'lucide-react'; // Correction de l'import ici

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

const NORMALE_TOULOUSE = {
  pluie: 638,
  soleil: 2031,
  moyAn: "13.8°C",
  moyJan: "6.3°C",
  moyEte: "22.5°C",
  ventNorm: 65, 
  joursChauds: 78
};

export default function MeteoToulousePage() {
  const [forecast, setForecast] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Utilitaire pour la couleur et le libellé de l'UV
  const getUvStatus = (uv: number) => {
    if (uv <= 2) return { label: 'Faible', color: 'bg-emerald-100 text-emerald-700' };
    if (uv <= 5) return { label: 'Modéré', color: 'bg-amber-100 text-amber-700' };
    if (uv <= 7) return { label: 'Élevé', color: 'bg-orange-100 text-orange-700' };
    return { label: 'Très Élevé', color: 'bg-rose-100 text-rose-700' };
  };

  useEffect(() => {
    async function getData() {
      setLoading(true);
      try {
        const res = await fetch('/api/meteofutur');
        const data = await res.json();
        setForecast(data.daily);
        setStats(data.stats); 
      } catch (err) {
        console.error("Erreur chargement Toulouse:", err);
      } finally {
        setLoading(false);
      }
    }
    getData();
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f7ff] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        <Link href="/" className="flex items-center gap-2 text-indigo-600 mb-6 font-bold hover:underline w-fit uppercase text-xs">
          <ArrowLeft size={16} /> Retour à l'accueil
        </Link>

        {/* HEADER */}
        <header className="bg-pink-500 rounded-[2.5rem] p-10 text-center text-white mb-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10"><Sun size={120} /></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
               <MapPin size={12} /> Haute-Garonne
            </div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-2">
              Météo Toulouse
            </h1>
            <p className="text-rose-100 font-bold opacity-80 uppercase tracking-widest text-sm">
              Prévisions et Vents de la Ville Rose
            </p>
          </div>
        </header>

        {/* DASHBOARD PRINCIPAL */}
        <div className={`bg-[#eef2ff] rounded-[3rem] p-8 border border-indigo-100 shadow-sm space-y-8 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
          
          <div className="flex flex-col md:flex-row justify-between items-center px-4">
             <div className="flex flex-col">
                <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tight italic">
                  Toulouse
                </h2>
                <div className="flex items-center gap-2 mt-1">
                   {forecast && icons[forecast.weathercode[0]]}
                   <span className="text-indigo-600 font-black uppercase text-[10px]">Aujourd'hui</span>
                </div>
             </div>
             <div className="text-right flex items-baseline gap-4">
                <span className="text-7xl font-black text-indigo-700">
                  {forecast ? Math.round(forecast.temperature_2m_max[0]) : '--'}°
                </span>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Moy. Annuelle</p>
                  <p className="text-sm font-black text-slate-600 tracking-tighter">{NORMALE_TOULOUSE.moyAn}</p>
                </div>
             </div>
          </div>

          {/* STATS RAPIDES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex justify-around items-center">
              <div className="text-center">
                <p className="text-[9px] font-black text-blue-500 uppercase mb-1">Moy. Janvier</p>
                <p className="text-xl font-black text-slate-800">{NORMALE_TOULOUSE.moyJan}</p>
              </div>
              <div className="h-8 w-[1px] bg-slate-100"></div>
              <div className="text-center">
                <p className="text-[9px] font-black text-orange-400 uppercase mb-1">Moy. Été</p>
                <p className="text-xl font-black text-slate-800">{NORMALE_TOULOUSE.moyEte}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex justify-around items-center">
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Indice UV Max</p>
                <p className="text-2xl font-black text-indigo-700">{forecast ? Math.max(...forecast.uv_index_max) : '--'}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Jours {'>'} 25°C</p>
                <p className="text-2xl font-black text-orange-500">Normal: {NORMALE_TOULOUSE.joursChauds}j</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 text-center flex flex-col justify-center">
              <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Max de la semaine</p>
              <p className="text-2xl font-black text-red-500">{forecast ? Math.max(...forecast.temperature_2m_max) : '--'}°C</p>
              <p className="text-[8px] font-bold text-slate-300 uppercase">Record local 2026</p>
            </div>
          </div>

          {/* PRÉVISIONS 7 JOURS */}
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
            {forecast?.time.map((date: string, i: number) => {
              const uvValue = forecast.uv_index_max[i];
              const uvStatus = getUvStatus(uvValue);

              return (
                <div key={date} className="bg-white p-5 rounded-[2.5rem] shadow-sm flex flex-col items-center border-2 border-transparent hover:border-indigo-100 transition-all">
                  <span className="text-[10px] font-black text-slate-400 uppercase mb-3">
                    {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                  </span>
                  <div className="mb-3">
                    {icons[forecast.weathercode[i]] || <Cloud className="text-slate-300" size={32} />}
                  </div>
                  <div className="text-2xl font-black text-slate-800">{Math.round(forecast.temperature_2m_max[i])}°</div>
                  <div className="text-xs font-bold text-indigo-400 mb-3">{Math.round(forecast.temperature_2m_min[i])}°</div>
                  
                  {/* BADGE UV AJOUTÉ ICI */}
                  <div className={`mb-4 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${uvStatus.color}`}>
                    UV {Math.round(uvValue)} • {uvStatus.label}
                  </div>

                  <div className="w-full pt-3 border-t border-slate-50 space-y-2">
                     <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400">
                        <span className="flex items-center gap-1"><Wind size={10} className="text-blue-300"/> Vent</span>
                        <span className="text-slate-700">{Math.round(forecast.windspeed_10m_max[i])} <small className="lowercase">km/h</small></span>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* BILAN ANNUEL DYNAMIQUE (Section restée identique) */}
          {!loading && stats && (
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-indigo-50">
                <h4 className="font-black text-indigo-900 uppercase tracking-tighter flex items-center gap-2 italic mb-1">
                  <Calendar size={18} className="text-indigo-400" /> Bilan Annuel 2026
                </h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 ml-7">
                  Depuis le 1er janvier (Données Blagnac en temps réel)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                   <div className="space-y-2">
                     <div className="flex items-center gap-4">
                       <Sun className="text-orange-400" size={28} />
                       <div>
                         <p className="text-sm font-black text-slate-800 uppercase">Ensoleillement</p>
                         <p className="text-2xl font-black text-indigo-900">{stats.totalSunshine || '--'} h</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Normal: {NORMALE_TOULOUSE.soleil}h</p>
                       </div>
                     </div>
                     <div className="h-2 bg-slate-50 rounded-full overflow-hidden mt-2">
                       <div className="h-full bg-orange-400 transition-all duration-1000" style={{ width: `${Math.min(((stats.totalSunshine || 0) / NORMALE_TOULOUSE.soleil) * 100, 100)}%` }}></div>
                     </div>
                   </div>

                   <div className="space-y-2">
                     <div className="flex items-center gap-4">
                       <Droplets className="text-blue-500" size={28} />
                       <div>
                         <p className="text-sm font-black text-slate-800 uppercase">Cumul Pluie</p>
                         <p className="text-2xl font-black text-indigo-900">{stats.totalRain || '--'} mm</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Normal: {NORMALE_TOULOUSE.pluie} mm</p>
                       </div>
                     </div>
                     <div className="h-2 bg-slate-50 rounded-full overflow-hidden mt-2">
                       <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${Math.min(((stats.totalRain || 0) / NORMALE_TOULOUSE.pluie) * 100, 100)}%` }}></div>
                     </div>
                   </div>

                   <div className="bg-rose-50 border border-rose-100 p-5 rounded-[2rem] flex flex-col justify-between">
                      <p className="text-[10px] font-black text-rose-600 uppercase">Bilan Hydrique</p>
                      <p className="text-3xl font-black text-rose-700">+{stats.waterBalance || 0} mm</p>
                      <span className="text-[8px] font-black text-rose-500 bg-white px-2 py-1 rounded-full border border-rose-100 w-fit uppercase italic tracking-tighter">Stable 2026</span>
                   </div>
                </div>
            </div>
          )}

          {/* ROSE DES VENTS (Section restée identique) */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 opacity-10 -rotate-12 translate-x-4 -translate-y-4">
                <Compass size={200} />
             </div>
             
             <h4 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3 mb-8">
               <Wind className="text-blue-400" /> Rose des Vents Toulousaine
             </h4>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-4">
                   <p className="text-xs font-black text-blue-400 uppercase tracking-widest border-b border-blue-400/30 pb-2">Vents Majeurs</p>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                         <p className="text-lg font-black italic text-orange-400">Vent d'Autan</p>
                         <p className="text-[10px] text-slate-300 leading-tight mt-1">E / SE : Le vent "fou". Sec et chaud, souvent turbulent.</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                         <p className="text-lg font-black italic text-blue-400">Vent d'Ouest</p>
                         <p className="text-[10px] text-slate-300 leading-tight mt-1">W : Vent de Cers. Apporte l'humidité océanique.</p>
                      </div>
                   </div>
                   <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                      <p className="text-lg font-black italic text-emerald-400">Le Marin</p>
                      <p className="text-[10px] text-slate-300 leading-tight mt-1">Sud-Est : Humide, il apporte souvent les entrées maritimes.</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <p className="text-xs font-black text-indigo-400 uppercase tracking-widest border-b border-indigo-400/30 pb-2">Vents Secondaires</p>
                   <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                         <p className="text-xs font-bold text-indigo-300">Tramontane</p>
                         <p className="text-[9px] text-slate-400">NW. Froid et sec en hiver.</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                         <p className="text-xs font-bold text-indigo-300">La Bise</p>
                         <p className="text-[9px] text-slate-400">Nord. Vent glacial de secteur N.</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                         <p className="text-xs font-bold text-indigo-300">Vent du Sud</p>
                         <p className="text-[9px] text-slate-400">Vent des Pyrénées (Foehn).</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                         <p className="text-xs font-bold text-indigo-300">Vent d'Espagne</p>
                         <p className="text-[9px] text-slate-400">S/SW. Annonce les orages.</p>
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