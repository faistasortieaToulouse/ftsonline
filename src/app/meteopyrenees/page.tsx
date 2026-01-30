"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { 
  ArrowLeft, Sun, Info, Cloud, CloudSun, CloudRain, 
  Thermometer, Snowflake, Mountain, Calendar, Wind, SunMedium
} from "lucide-react";
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const NORMALES_CLIMAT = {
  luchon: { neigeAn: 180, joursGel: 90, froid: "3,1°C", chaud: "21,5°C", moyAn: "11,2°C" },
  saintlary: { neigeAn: 220, joursGel: 110, froid: "2,2°C", chaud: "20,1°C", moyAn: "10,5°C" },
  ax: { neigeAn: 200, joursGel: 105, froid: "2,5°C", chaud: "20,8°C", moyAn: "10,8°C" }
};

// --- 1. COMPOSANT CARTE ---
const MapPyrenees = dynamic(() => Promise.resolve(({ data }: { data: any[] }) => {
  const L = require('leaflet');
  const { useEffect, useRef } = require('react');
  const mapRef = useRef(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current || data.length === 0) return;
    mapInstance.current = L.map(mapRef.current, { scrollWheelZoom: true }).setView([42.85, 0.8], 8);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);

    const createLabel = (name: string, temp: number) => L.divIcon({
      className: 'custom-marker',
      html: `<div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
          <div style="background: white; border: 2px solid #1e40af; padding: 4px 8px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; min-width: 70px;">
            <div style="font-weight: 800; font-size: 9px; color: #1e3a8a; white-space: nowrap;">${name}</div>
            <div style="font-size: 11px; color: #1e40af; font-weight: 900;">${temp}°C</div>
          </div>
          <div style="width: 2px; height: 6px; background: #1e40af;"></div>
        </div>`,
      iconSize: [0, 0],
    });

    data.forEach((st) => {
      L.marker([st.lat, st.lng], { icon: createLabel(st.ville, st.currentTemp) })
        .addTo(mapInstance.current)
        .on('click', () => {
          document.getElementById(`station-${st.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });
    return () => { mapInstance.current?.remove(); mapInstance.current = null; };
  }, [data]);

  return <div ref={mapRef} className="h-full w-full rounded-[2.5rem] z-0" />;
}), { ssr: false });

// --- 2. PAGE PRINCIPALE ---
export default function MeteoPyreneesPage() {
  const [pyreneData, setPyreneData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="text-orange-400" size={28} />;
    if (code >= 1 && code <= 3) return <CloudSun className="text-amber-500" size={28} />;
    if (code >= 71 && code <= 77) return <Snowflake className="text-cyan-400 animate-pulse" size={28} />;
    return <CloudRain className="text-blue-400" size={28} />;
  };

  useEffect(() => {
    fetch('/api/meteopyrenees')
      .then(res => res.json())
      .then(data => { setPyreneData(data); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 italic font-black text-blue-900 animate-pulse uppercase">
      🏔️ Analyse de l'enneigement pyrénéen...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <header className="max-w-7xl mx-auto mb-10 flex justify-between items-end">
        <div>
          <Link href="/" className="text-blue-700 font-bold flex items-center gap-2 mb-2 hover:underline text-xs uppercase italic">
            <ArrowLeft size={14} /> Accueil
          </Link>
          <h1 className="text-4xl font-black text-slate-900 uppercase italic">
            Observatoire <span className="text-blue-700">Pyrénées</span>
          </h1>
        </div>
        <div className="hidden md:flex bg-white px-4 py-2 rounded-xl border border-blue-100 items-center gap-2 text-sm font-bold shadow-sm">
          <Calendar size={18} className="text-blue-600" /> {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
        </div>
      </header>

      <div className="max-w-7xl mx-auto mb-12 h-[400px] bg-white p-2 rounded-[3rem] shadow-xl border border-blue-100 overflow-hidden">
        <MapPyrenees data={pyreneData} />
      </div>

      <div className="max-w-7xl mx-auto space-y-16">
        {pyreneData.map((station, idx) => {
          const normale = NORMALES_CLIMAT[station.id as keyof typeof NORMALES_CLIMAT];
          return (
            <div key={idx} id={`station-${station.id}`} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
              
              <div className="bg-blue-900 p-6 text-white flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-3 rounded-2xl"><Mountain size={30} /></div>
                  <div>
                    <h2 className="text-2xl font-black italic uppercase leading-none">{station.ville}</h2>
                    <p className="text-[10px] font-bold text-blue-300 uppercase mt-1">Dpt {station.dept} • {station.isSnowing ? "❄️ Neige en cours" : "Temps stable"}</p>
                  </div>
                </div>
                <div className="flex gap-6 items-center bg-black/20 px-6 py-3 rounded-2xl border border-white/5">
                  <div className="text-center">
                    <p className="text-[8px] font-black uppercase text-blue-300">Temp. Actuelle</p>
                    <p className="text-3xl font-black">{station.currentTemp}°</p>
                  </div>
                  <div className="text-center border-l border-white/10 pl-6">
                    <p className="text-[8px] font-black uppercase text-blue-300 italic">Moy. Annuelle</p>
                    <p className="text-xl font-black">{normale.moyAn}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                
                {/* Stats Gauche */}
                <div className="p-6 bg-slate-50/50 space-y-6">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-3 rounded-xl border border-blue-100 text-center shadow-sm">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1 italic">Record Froid</p>
                      <p className="text-sm font-black text-red-600">{station.stats.recordFroid}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-blue-100 text-center shadow-sm">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Jours de Gel</p>
                      <p className="text-sm font-black text-blue-800">{station.stats.joursGel}j</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                        <span className="text-slate-500 italic">Objectif Neige Annuel</span>
                        <span className="text-blue-700">{station.stats.cumulNeige} / {normale.neigeAn} cm</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" 
                             style={{ width: `${Math.min((station.stats.cumulNeige / normale.neigeAn) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Forecast Droite - Scroll 7 Jours */}
                <div className="lg:col-span-3 p-6 overflow-x-auto scrollbar-hide">
                  <div className="flex gap-4 min-w-[850px]">
                    {station.forecast?.map((jour: any, i: number) => (
                      <div key={i} className={`flex-1 p-4 rounded-3xl border transition-all ${i === 0 ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-blue-100'}`}>
                        <p className="text-[9px] font-black text-slate-400 uppercase text-center mb-3">
                          {new Date(jour.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                        </p>
                        <div className="flex flex-col items-center gap-1 mb-3">
                          {getWeatherIcon(jour.code)}
                          <div className="text-center leading-tight">
                            <span className="text-xl font-black text-slate-900">{jour.tempMax}°</span>
                            <span className="block text-[10px] font-bold text-blue-600">{jour.tempMin}°</span>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-slate-100 space-y-2">
                          <div className="flex justify-between items-center text-[9px] font-black uppercase">
                            <span className="text-cyan-500 flex items-center gap-1"><Snowflake size={10}/> Neige</span>
                            <span className="text-slate-700">{jour.snow} <small>cm</small></span>
                          </div>
                          <div className="flex justify-between items-center text-[9px] font-black uppercase">
                            <span className="text-slate-400 flex items-center gap-1"><Wind size={10}/> Vent</span>
                            <span className="text-slate-700">{jour.windMax || station.currentWind} <small>km/h</small></span>
                          </div>
                          <div className="flex justify-between items-center text-[9px] font-black uppercase">
                            <span className="text-orange-400 flex items-center gap-1"><SunMedium size={10}/> UV</span>
                            <span className={`px-1.5 rounded ${jour.uv > 5 ? 'bg-orange-100 text-orange-600' : 'text-slate-700'}`}>{Math.round(jour.uv)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}