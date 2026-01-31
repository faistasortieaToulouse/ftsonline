"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { Sun, Wind, Cloud, CloudRain, Calendar, ArrowLeft, MapPin, Snowflake, Eye, Thermometer, Navigation } from 'lucide-react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// --- 1. COMPOSANT CARTE ---
const MapMontagne = dynamic(() => Promise.resolve(({ data }: { data: any[] }) => {
  const L = require('leaflet');
  const { useEffect, useRef } = require('react');
  const mapRef = useRef(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current || data.length === 0) return;

    mapInstance.current = L.map(mapRef.current, { scrollWheelZoom: true }).setView([42.85, 0.5], 8);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(mapInstance.current);

    const createLabel = (name: string, temp: number) => L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
          <div style="background: white; border: 2px solid #4338ca; padding: 4px 8px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 70px; text-align: center;">
            <div style="font-weight: 800; font-size: 10px; color: #1e1b4b; white-space: nowrap;">${name}</div>
            <div style="font-size: 11px; color: #4338ca; font-weight: 900;">${temp}°C</div>
          </div>
          <div style="width: 2px; height: 6px; background: #4338ca;"></div>
        </div>`,
      iconSize: [0, 0],
    });

    data.forEach((station) => {
      if (station.lat && station.lng) {
        L.marker([station.lat, station.lng], { icon: createLabel(station.name, station.currentTemp) })
          .addTo(mapInstance.current)
          .on('click', () => {
            const id = `station-${station.name.replace(/\s+/g, '')}`;
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          });
      }
    });

    return () => { mapInstance.current?.remove(); mapInstance.current = null; };
  }, [data]);

  return <div ref={mapRef} className="h-full w-full rounded-[2.5rem] z-0" />;
}), { ssr: false });

// --- 2. PAGE PRINCIPALE ---
export default function MeteoMontagne() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/meteomontagne')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => console.error("ERREUR :", err));
  }, []);

  const getIcon = (code: number) => {
    if (code <= 3) return <Sun className="text-orange-500 fill-orange-100" size={32} />;
    if (code >= 71 && code <= 77) return <Snowflake className="text-blue-400" size={32} />;
    if (code >= 51) return <CloudRain className="text-blue-500" size={32} />;
    return <Cloud className="text-gray-400 fill-gray-100" size={32} />;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="font-black animate-pulse text-indigo-800 uppercase tracking-widest italic text-2xl">CHARGEMENT DES SOMMETS...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <header className="max-w-7xl mx-auto mb-10 flex justify-between items-end">
        <div>
          <Link href="/" className="text-indigo-700 font-bold flex items-center gap-2 mb-4 hover:underline text-sm uppercase">
            <ArrowLeft size={16} /> Retour Accueil
          </Link>
          <h1 className="text-4xl font-black text-slate-900 uppercase italic leading-none flex items-center gap-3">
             <Navigation className="rotate-45 text-indigo-600" /> Météo Montagne
          </h1>
          <p className="text-slate-500 font-bold text-xs mt-2 uppercase tracking-wide">PYRÉNÉES : ARIÈGE, GARONNE & HAUTES-PYRÉNÉES</p>
        </div>
        <div className="hidden md:flex bg-white px-5 py-3 rounded-2xl border border-slate-200 items-center gap-3 text-sm font-black shadow-sm text-slate-700">
          <Calendar size={18} className="text-indigo-600" /> 
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </header>

      <div className="max-w-7xl mx-auto mb-12 h-[450px] bg-white p-2 rounded-[3rem] shadow-xl border border-indigo-100 overflow-hidden">
        <MapMontagne data={data} />
      </div>

      <div className="max-w-7xl mx-auto space-y-12">
        {data.map((station, idx) => (
          <div key={idx} id={`station-${station.name.replace(/\s+/g, '')}`} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
            
            <div className="bg-indigo-900 p-8 text-white flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">{station.name}</h2>
                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] flex items-center gap-2 mt-1">
                  <MapPin size={14} className="text-indigo-400" /> {station.dept} • {station.alt || 'Station Ski'}
                </p>
              </div>
              <div className="text-5xl font-black tracking-tighter">{station.currentTemp}°C</div>
            </div>

            <div className="p-4 md:p-8 overflow-x-auto scrollbar-hide bg-white">
              <div className="flex gap-6 min-w-[1200px]">
                {station.forecast?.map((jour: any, i: number) => (
                  <div key={i} className={`flex-1 p-6 rounded-[2.5rem] border transition-all ${i === 0 ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200 hover:shadow-md'}`}>
                    
                    <div className="text-[10px] font-black text-slate-400 uppercase text-center mb-6 tracking-widest border-b pb-2">
                      {new Date(jour.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                    </div>

                    {/* BLOC SOLEIL */}
                    <div className="bg-orange-50/50 rounded-2xl p-4 mb-4 border border-orange-100/50 flex justify-between items-center">
                        <div>
                            <p className="text-[8px] font-black text-orange-600 uppercase">Soleil</p>
                            <p className="text-xs font-black text-slate-800">08:10 | 18:01</p>
                        </div>
                        <Sun className="text-orange-400" size={20} />
                    </div>

                    <div className="flex flex-col items-center gap-4 mb-6">
                      {getIcon(jour.code)}
                      <div className="text-center leading-none">
                        <span className="text-3xl font-black text-slate-900 tracking-tighter">{jour.tempMax}°</span>
                        <span className="block text-sm font-bold text-indigo-600 mt-1">{jour.tempMin}°</span>
                      </div>
                    </div>

                    {/* NOUVEAU : GRILLE NEIGE & VISIBILITÉ (STYLE IMAGE) */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {/* NEIGE */}
                        <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100/50">
                            <div className="flex items-center gap-1 mb-1">
                                <Snowflake size={12} className="text-blue-500" />
                                <span className="text-[7px] font-black text-blue-600 uppercase">Neige (24h)</span>
                            </div>
                            <p className="text-[10px] font-black text-slate-800">{jour.snow > 0 ? `${jour.snow} cm` : 'Néant'}</p>
                        </div>
                        {/* ISOTHERME */}
                        <div className="bg-slate-100/50 rounded-xl p-3 border border-slate-200/50">
                            <div className="flex items-center gap-1 mb-1">
                                <Thermometer size={12} className="text-slate-500" />
                                <span className="text-[7px] font-black text-slate-600 uppercase">Isotherme</span>
                            </div>
                            <p className="text-[10px] font-black text-slate-800">1500 m</p>
                        </div>
                        {/* VENT */}
                        <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-1 mb-1">
                                <Wind size={12} className="text-indigo-400" />
                                <span className="text-[7px] font-black text-slate-400 uppercase">Vent</span>
                            </div>
                            <p className="text-[10px] font-black text-slate-800">{jour.windMax} <small className="text-[7px]">km/h</small></p>
                        </div>
                        {/* VISIBILITÉ */}
                        <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/50">
                            <div className="flex items-center gap-1 mb-1">
                                <Eye size={12} className="text-emerald-500" />
                                <span className="text-[7px] font-black text-emerald-600 uppercase">Visibilité</span>
                            </div>
                            <p className="text-[10px] font-black text-slate-800">24 KM</p>
                        </div>
                    </div>

                    {/* UV BADGE */}
                    <div className="flex justify-between items-center bg-white/50 rounded-lg p-2 border border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className="bg-orange-500 p-1 rounded-md">
                                <span className="text-[7px] font-black text-white italic">UV</span>
                            </div>
                            <span className="text-[10px] font-black text-slate-700">{Math.round(jour.uv)}</span>
                        </div>
                        <span className="text-[7px] font-black text-indigo-400 uppercase italic tracking-tighter">Station Ski</span>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}