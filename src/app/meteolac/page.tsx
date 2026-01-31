"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { Sun, Wind, Cloud, CloudRain, Calendar, ArrowLeft, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// --- 1. COMPOSANT CARTE ---
const MapLacs = dynamic(() => Promise.resolve(({ data }: { data: any[] }) => {
  const L = require('leaflet');
  const { useEffect, useRef } = require('react');
  const mapRef = useRef(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current || data.length === 0) return;

    mapInstance.current = L.map(mapRef.current, { scrollWheelZoom: true }).setView([43.60, 1.44], 8);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(mapInstance.current);

    const createLabel = (name: string, dist: string) => L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="background: white; border: 2px solid #059669; padding: 4px 8px; border-radius: 6px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); min-width: 80px; text-align: center;">
            <div style="font-weight: 800; font-size: 10px; color: #064e3b; white-space: nowrap;">${name}</div>
            <div style="font-size: 8px; color: #10b981; font-weight: bold;">${dist}</div>
          </div>
          <div style="width: 2px; height: 6px; background: #059669;"></div>
        </div>`,
      iconSize: [0, 0],
    });

    data.forEach((lac) => {
      if (lac.lat && lac.lng) {
        L.marker([lac.lat, lac.lng], { icon: createLabel(lac.name, lac.dist) })
          .addTo(mapInstance.current)
          .on('click', () => {
            const id = `lac-${lac.name.replace(/\s+/g, '')}`;
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          });
      }
    });

    return () => { mapInstance.current?.remove(); mapInstance.current = null; };
  }, [data]);

  return <div ref={mapRef} className="h-full w-full rounded-[2.5rem] z-0" />;
}), { ssr: false });

// --- 2. PAGE PRINCIPALE ---
export default function MeteoLac() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/meteolac')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => console.error("ERREUR TACTIQUE :", err));
  }, []);

  const getIcon = (code: number) => {
    if (code <= 3) return <Sun className="text-orange-500 fill-orange-100" size={32} />;
    if (code <= 48) return <Cloud className="text-gray-400 fill-gray-100" size={32} />;
    return <CloudRain className="text-blue-500" size={32} />;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
      <p className="font-black animate-pulse text-emerald-800 uppercase tracking-widest">Initialisation du réseau...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <header className="max-w-7xl mx-auto mb-10 flex justify-between items-end">
        <div>
            <Link href="/" className="text-emerald-700 font-bold flex items-center gap-2 mb-4 hover:underline text-sm uppercase">
                <ArrowLeft size={16} /> Retour Accueil
            </Link>
            <h1 className="text-4xl font-black text-slate-900 uppercase italic leading-none">Météo des Lacs</h1>
            <p className="text-slate-500 font-bold text-xs mt-2 uppercase tracking-wide">Baignades et bases de loisirs autour de Toulouse</p>
        </div>
        <div className="hidden md:flex bg-white px-5 py-3 rounded-2xl border border-slate-200 items-center gap-3 text-sm font-black shadow-sm text-slate-700">
          <Calendar size={18} className="text-emerald-600" /> 
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </header>

      {/* LA CARTE */}
      <div className="max-w-7xl mx-auto mb-12 h-[400px] bg-white p-2 rounded-[3rem] shadow-xl border border-emerald-100 overflow-hidden">
        <MapLacs data={data} />
      </div>

      {/* LES CARTES LACS */}
      <div className="max-w-7xl mx-auto space-y-12">
        {data.map((lac, idx) => (
          <div key={idx} id={`lac-${lac.name.replace(/\s+/g, '')}`} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-emerald-800 p-8 text-white">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">{lac.name}</h2>
              <p className="text-[10px] font-black text-emerald-300 uppercase tracking-[0.2em] flex items-center gap-2 mt-1">
                <MapPin size={14} className="text-emerald-400" /> {lac.city} ({lac.dept}) • {lac.dist}
              </p>
            </div>

            {/* SCROLL HORIZONTAL 7 JOURS */}
            <div className="p-4 md:p-8 overflow-x-auto scrollbar-hide bg-white">
              <div className="flex gap-6 min-w-[1000px]">
                {lac.forecast?.map((jour: any, i: number) => (
                  <div key={i} className={`flex-1 p-6 rounded-[2rem] border transition-all ${i === 0 ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200 hover:shadow-md'}`}>
                    
                    <div className="text-[10px] font-black text-slate-400 uppercase text-center mb-6 tracking-widest border-b pb-2">
                      {new Date(jour.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                    </div>

                    <div className="flex flex-col items-center gap-4 mb-8">
                      {getIcon(jour.code)}
                      <div className="text-center leading-none">
                        <span className="text-4xl font-black text-slate-900 tracking-tighter">{jour.tempMax}°</span>
                        <span className="block text-sm font-bold text-emerald-600 mt-1">{jour.tempMin}°</span>
                      </div>
                    </div>

                    {/* BLOCS INFOS (VENT & UV) STYLE IMAGE */}
                    <div className="space-y-3">
                        {/* VENT */}
                        <div className="bg-white/80 rounded-xl p-3 flex items-center justify-between border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2">
                                <Wind size={14} className="text-emerald-500" />
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Vent</span>
                            </div>
                            <span className="text-[11px] font-black text-slate-800">{jour.wind} <small className="text-[8px] lowercase font-bold">km/h</small></span>
                        </div>

                        {/* UV */}
                        <div className="bg-white/80 rounded-xl p-3 flex items-center justify-between border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="bg-orange-500 p-1 rounded-md">
                                    <span className="text-[8px] font-black text-white">UV</span>
                                </div>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Indice</span>
                            </div>
                            <span className="text-[11px] font-black text-slate-800">{jour.uv.toFixed(1)}</span>
                        </div>
                    </div>

                    <div className="mt-4 text-center">
                        <span className="text-[9px] font-black text-emerald-700/50 uppercase italic tracking-widest">Ciel Variable</span>
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