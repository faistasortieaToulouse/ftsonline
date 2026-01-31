"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { Sun, Wind, Cloud, CloudRain, Calendar, ArrowLeft, Eye, MapPin, Navigation, Timer } from 'lucide-react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// --- 1. COMPOSANT CARTE ---
const MapPlages = dynamic(() => Promise.resolve(({ data }: { data: any[] }) => {
  const L = require('leaflet');
  const { useEffect, useRef } = require('react');
  const mapRef = useRef(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current || data.length === 0) return;

    mapInstance.current = L.map(mapRef.current, { scrollWheelZoom: true }).setView([43.15, 3.15], 9);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);

    const createLabel = (name: string, temp: number) => L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
          <div style="background: white; border: 2px solid #2563eb; padding: 4px 8px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">
            <div style="font-weight: 800; font-size: 10px; color: #1e3a8a; white-space: nowrap;">${name}</div>
            <div style="font-size: 11px; color: #2563eb; font-weight: 900;">${temp}°C</div>
          </div>
          <div style="width: 2px; height: 6px; background: #2563eb;"></div>
        </div>`,
      iconSize: [0, 0],
    });

    data.forEach((plage) => {
      if (plage.lat && plage.lng) {
        L.marker([plage.lat, plage.lng], { icon: createLabel(plage.name, plage.currentTemp) })
          .addTo(mapInstance.current)
          .on('click', () => {
            const id = `plage-${plage.name.replace(/['\s]+/g, '')}`;
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          });
      }
    });

    return () => { mapInstance.current?.remove(); mapInstance.current = null; };
  }, [data]);

  return <div ref={mapRef} className="h-full w-full rounded-[2.5rem] z-0" />;
}), { ssr: false });

// --- 2. PAGE PRINCIPALE ---
export default function MeteoPlage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/meteoplage')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(err => console.error("Erreur:", err));
  }, []);

  const getIcon = (code: number) => {
    if (code <= 3) return <Sun className="text-orange-500 fill-orange-50" size={32} />;
    if (code >= 51) return <CloudRain className="text-blue-500" size={32} />;
    return <Cloud className="text-slate-400 fill-slate-50" size={32} />;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-black text-blue-900 uppercase animate-pulse italic text-2xl">
      Chargement du littoral...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <header className="max-w-7xl mx-auto mb-10 flex justify-between items-end">
        <div>
          <Link href="/" className="text-blue-700 font-bold flex items-center gap-2 mb-4 hover:underline text-xs uppercase">
            <ArrowLeft size={14} /> Retour Accueil
          </Link>
          <h1 className="text-4xl font-black text-slate-900 uppercase italic leading-none flex items-center gap-3">
             <Navigation className="rotate-45 text-blue-600 fill-blue-600" size={28} /> Météo des Plages
          </h1>
          <p className="text-slate-500 font-bold text-xs mt-2 uppercase tracking-wide">État du ciel et durée d'ensoleillement en temps réel</p>
        </div>
        <div className="hidden md:flex bg-white px-5 py-3 rounded-2xl border border-slate-200 items-center gap-3 text-sm font-black shadow-sm text-slate-700">
          <Calendar size={18} className="text-blue-600" /> 
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </header>

      {/* CARTE */}
      <div className="max-w-7xl mx-auto mb-12 h-[400px] bg-white p-2 rounded-[3rem] shadow-xl border border-blue-100 overflow-hidden">
        <MapPlages data={data} />
      </div>

      {/* LISTE DES PLAGES */}
      <div className="max-w-7xl mx-auto space-y-12">
        {data.map((plage, idx) => (
          <div key={idx} id={`plage-${plage.name.replace(/['\s]+/g, '')}`} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
            
            {/* Header style image */}
            <div className="bg-blue-600 p-8 text-white flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">{plage.name}</h2>
                <div className="flex gap-6 mt-1">
                   <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={14} className="text-blue-300" /> Littoral Occitan
                  </p>
                </div>
              </div>
              <div className="text-5xl font-black tracking-tighter">{plage.currentTemp}°C</div>
            </div>

            {/* Scroll 7 Jours */}
            <div className="p-4 md:p-8 overflow-x-auto scrollbar-hide">
              <div className="flex gap-6 min-w-[1200px]">
                {plage.forecast?.map((jour: any, i: number) => (
                  <div key={i} className={`flex-1 p-6 rounded-[2.5rem] border transition-all ${i === 0 ? 'bg-blue-50/50 border-blue-100' : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200'}`}>
                    
                    <div className="text-[10px] font-black text-slate-400 uppercase text-center mb-6 tracking-widest border-b pb-2">
                      {new Date(jour.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                    </div>

                    {/* Bloc Soleil */}
                    <div className="bg-orange-50/50 rounded-2xl p-4 mb-8 border border-orange-100/50 flex justify-between items-center">
                        <div>
                            <p className="text-[8px] font-black text-orange-600 uppercase">Soleil</p>
                            <p className="text-xs font-black text-slate-800">{jour.sunrise || '08:04'} | {jour.sunset || '17:56'}</p>
                            <p className="text-[8px] font-bold text-orange-400 mt-1 italic leading-none flex items-center gap-1">
                                <Timer size={10}/> Jour : 9h 52min
                            </p>
                        </div>
                        {getIcon(jour.code)}
                    </div>

                    <div className="flex flex-col items-center gap-4 mb-10 leading-none">
                        <span className="text-4xl font-black text-slate-900 tracking-tighter">{jour.tempMax}°</span>
                        <span className="text-sm font-bold text-blue-600">{jour.tempMin}°</span>
                    </div>

                    {/* Blocs Vent & UV Style Image */}
                    <div className="space-y-3">
                        {/* VENT */}
                        <div className="bg-white/80 rounded-xl p-3 flex items-center justify-between border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2">
                                <Wind size={14} className="text-blue-500" />
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Vent</span>
                            </div>
                            <span className="text-[11px] font-black text-slate-800">{jour.windMax || jour.wind || '0'} <small className="text-[8px] lowercase font-bold">km/h</small></span>
                        </div>

                        {/* UV */}
                        <div className="bg-white/80 rounded-xl p-3 flex items-center justify-between border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="bg-orange-500 p-1 rounded-md">
                                    <span className="text-[8px] font-black text-white italic">UV</span>
                                </div>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Indice</span>
                            </div>
                            <span className="text-[11px] font-black text-slate-800">
                                {jour.uv ? jour.uv.toFixed(2) : '0.00'}
                            </span>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-between items-center border-t pt-4">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">État du ciel</span>
                        <span className="text-[9px] font-black text-slate-700 italic">Partiellement Couvert</span>
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