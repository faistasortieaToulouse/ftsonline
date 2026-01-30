"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { Sun, Wind, Cloud, CloudRain, Calendar, ArrowLeft, MapPin, Snowflake, Eye } from 'lucide-react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// --- 1. COMPOSANT CARTE (RECTANGLES BLANCS AVEC LIEN) ---
const MapMontagne = dynamic(() => Promise.resolve(({ data }: { data: any[] }) => {
  const L = require('leaflet');
  const { useEffect, useRef } = require('react');
  const mapRef = useRef(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current || data.length === 0) return;

    // Centrage sur les Pyrénées
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
            // L'ID doit correspondre exactement à celui défini dans le render plus bas
            const id = `station-${station.name.replace(/\s+/g, '')}`;
            const element = document.getElementById(id);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
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
    if (code <= 3) return <Sun className="text-orange-500 fill-orange-100" size={28} />;
    if (code >= 71 && code <= 77) return <Snowflake className="text-blue-400" size={28} />;
    if (code >= 51) return <CloudRain className="text-blue-500" size={28} />;
    return <Cloud className="text-gray-400 fill-gray-100" size={28} />;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="font-black animate-pulse text-indigo-800 uppercase tracking-widest italic text-2xl">MÉTÉO SOMMETS...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <header className="max-w-7xl mx-auto mb-10 flex justify-between items-end">
        <div>
          <Link href="/" className="text-indigo-700 font-bold flex items-center gap-2 mb-4 hover:underline text-sm uppercase">
            <ArrowLeft size={16} /> Retour
          </Link>
          <h1 className="text-4xl font-black text-slate-900 uppercase italic leading-none">
            Météo Sommets <span className="text-indigo-600">7 Jours</span>
          </h1>
        </div>
        <div className="hidden md:flex bg-white px-4 py-2 rounded-xl border border-slate-200 items-center gap-2 text-sm font-bold shadow-sm">
          <Calendar size={18} className="text-indigo-600" /> {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
        </div>
      </header>

      {/* LA CARTE */}
      <div className="max-w-7xl mx-auto mb-12 h-[450px] bg-white p-2 rounded-[3rem] shadow-xl border border-indigo-100 overflow-hidden">
        <MapMontagne data={data} />
      </div>

      {/* LES CARTES STATIONS */}
      <div className="max-w-7xl mx-auto space-y-12">
        {data.map((station, idx) => (
          <div 
            key={idx} 
            id={`station-${station.name.replace(/\s+/g, '')}`} 
            className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="bg-indigo-900 p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black italic uppercase">{station.name}</h2>
                <div className="flex gap-6 mt-1 opacity-90">
                  <p className="text-[10px] font-bold uppercase flex items-center gap-1">
                    <Eye size={12} /> Visibilité: {station.currentVisibility} km
                  </p>
                  <p className="text-[10px] font-bold uppercase flex items-center gap-1">
                    <Wind size={12} /> Vent act.: {station.currentWind} km/h
                  </p>
                </div>
              </div>
              <div className="text-4xl font-black">{station.currentTemp}°</div>
            </div>

            {/* SCROLL HORIZONTAL 7 JOURS */}
            <div className="p-4 md:p-8 overflow-x-auto scrollbar-hide">
              <div className="flex gap-4 min-w-[1000px]">
                {station.forecast?.map((jour: any, i: number) => (
                  <div key={i} className={`flex-1 p-5 rounded-3xl border transition-all ${i === 0 ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200'}`}>
                    <div className="text-[10px] font-black text-slate-400 uppercase text-center mb-4">
                      {new Date(jour.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                    </div>
                    
                    <div className="flex flex-col items-center gap-2 mb-4">
                      {getIcon(jour.code)}
                      <div className="text-center leading-tight">
                        <span className="text-2xl font-black text-slate-900">{jour.tempMax}°</span>
                        <span className="block text-xs font-bold text-indigo-600">{jour.tempMin}°</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 space-y-2">
                      <div className="flex justify-between text-[9px] font-black uppercase">
                        <span className="text-slate-400">Vent Max</span>
                        <span className={jour.windMax > 40 ? 'text-red-500' : 'text-slate-800'}>{jour.windMax} km/h</span>
                      </div>
                      <div className="flex justify-between text-[9px] font-black uppercase">
                        <span className="text-slate-400">Neige</span>
                        <span className="text-blue-600 font-bold">{jour.snow} cm</span>
                      </div>
                      <div className="flex justify-between text-[9px] font-black uppercase">
                        <span className="text-slate-400">UV</span>
                        <span className={jour.uv > 6 ? 'text-orange-600' : 'text-indigo-800'}>{Math.round(jour.uv)}</span>
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