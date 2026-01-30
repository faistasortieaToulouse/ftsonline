"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { Sun, Wind, Cloud, CloudRain, Navigation, Timer, Calendar, ArrowLeft, Eye, MapPin } from 'lucide-react';
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

    // Centrage sur le littoral Occitan (Narbonne / Agde)
    mapInstance.current = L.map(mapRef.current, { scrollWheelZoom: true }).setView([43.15, 3.15], 9);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);

    const createLabel = (name: string, temp: number) => L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
          <div style="background: white; border: 2px solid #0284c7; padding: 4px 8px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">
            <div style="font-weight: 800; font-size: 10px; color: #0c4a6e; white-space: nowrap;">${name}</div>
            <div style="font-size: 11px; color: #0284c7; font-weight: 900;">${temp}°C</div>
          </div>
          <div style="width: 2px; height: 6px; background: #0284c7;"></div>
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
    if (code <= 3) return <Sun className="text-orange-500 fill-orange-50" size={28} />;
    if (code >= 51) return <CloudRain className="text-blue-500" size={28} />;
    return <Cloud className="text-slate-400 fill-slate-50" size={28} />;
  };

  const calculerDureeJour = (sunrise: string, sunset: string) => {
    if (!sunrise || !sunset) return "--";
    const [h1, m1] = sunrise.split(':').map(Number);
    const [h2, m2] = sunset.split(':').map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    return `${Math.floor(diff / 60)}h ${(diff % 60).toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-black text-blue-900 uppercase animate-pulse italic">
      Chargement du littoral...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <header className="max-w-7xl mx-auto mb-10 flex justify-between items-end">
        <div>
          <Link href="/" className="text-blue-700 font-bold flex items-center gap-2 mb-2 hover:underline text-xs uppercase">
            <ArrowLeft size={14} /> Accueil
          </Link>
          <h1 className="text-4xl font-black text-slate-900 uppercase italic">
            Météo <span className="text-blue-600">Plages</span>
          </h1>
        </div>
        <div className="hidden md:flex bg-white px-4 py-2 rounded-xl border border-slate-200 items-center gap-2 text-sm font-bold shadow-sm font-mono uppercase">
          <Calendar size={18} className="text-blue-600" /> {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
        </div>
      </header>

      {/* LA CARTE */}
      <div className="max-w-7xl mx-auto mb-12 h-[400px] bg-white p-2 rounded-[3rem] shadow-xl border border-blue-100 overflow-hidden">
        <MapPlages data={data} />
      </div>

      {/* LES PLAGES */}
      <div className="max-w-7xl mx-auto space-y-12">
        {data.map((plage, idx) => (
          <div 
            key={idx} 
            id={`plage-${plage.name.replace(/['\s]+/g, '')}`} 
            className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden"
          >
            {/* Header Plage */}
            <div className="bg-blue-700 p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black italic uppercase">{plage.name}</h2>
                <div className="flex gap-4 mt-1 opacity-80">
                  <p className="text-[10px] font-bold uppercase flex items-center gap-1">
                    <Eye size={12} /> Visibilité: {plage.currentVisibility} km
                  </p>
                  <p className="text-[10px] font-bold uppercase flex items-center gap-1">
                    <Wind size={12} /> Vent act.: {plage.currentWind} km/h
                  </p>
                </div>
              </div>
              <div className="text-4xl font-black">{plage.currentTemp}°</div>
            </div>

            {/* Scroll 7 Jours */}
            <div className="p-4 md:p-8 overflow-x-auto scrollbar-hide">
              <div className="flex gap-4 min-w-[1100px]">
                {plage.forecast?.map((jour: any, i: number) => (
                  <div key={i} className={`flex-1 p-5 rounded-3xl border transition-all ${i === 0 ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200'}`}>
                    <div className="text-[10px] font-black text-slate-400 uppercase text-center mb-4">
                      {new Date(jour.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                    </div>
                    
                    <div className="flex flex-col items-center gap-2 mb-4">
                      {getIcon(jour.code)}
                      <div className="text-center leading-tight">
                        <span className="text-2xl font-black text-slate-900">{jour.tempMax}°</span>
                        <span className="block text-xs font-bold text-blue-600">{jour.tempMin}°</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 space-y-3">
                      <div className="flex justify-between text-[9px] font-black uppercase">
                        <span className="text-slate-400">Vent Max</span>
                        <span className="text-slate-800">{jour.windMax} km/h</span>
                      </div>
                      <div className="flex justify-between text-[9px] font-black uppercase">
                        <span className="text-slate-400">Indice UV</span>
                        <span className={jour.uv > 6 ? 'text-orange-600' : 'text-blue-800'}>{Math.round(jour.uv)}</span>
                      </div>
                      <div className="bg-white/50 p-2 rounded-xl border border-slate-100 mt-2">
                        <div className="text-[8px] font-bold text-slate-400 uppercase mb-1">Éphéméride</div>
                        <div className="text-[9px] font-black text-slate-700 flex justify-between">
                          <span>{jour.sunrise}</span>
                          <span className="text-orange-400 italic">{calculerDureeJour(jour.sunrise, jour.sunset)}</span>
                          <span>{jour.sunset}</span>
                        </div>
                      </div>
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