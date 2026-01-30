"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { Sun, Wind, Cloud, CloudRain, Navigation, Calendar, ArrowLeft, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// --- 1. COMPOSANT CARTE (RECTANGLES BLANCS) ---
const MapLacs = dynamic(() => Promise.resolve(({ data }: { data: any[] }) => {
  const L = require('leaflet');
  const { useEffect, useRef } = require('react');
  const mapRef = useRef(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current || data.length === 0) return;

    // Centrage sur Toulouse
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
    if (code <= 3) return <Sun className="text-orange-500 fill-orange-100" size={28} />;
    if (code <= 48) return <Cloud className="text-gray-400 fill-gray-100" size={28} />;
    return <CloudRain className="text-blue-500" size={28} />;
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
                <ArrowLeft size={16} /> Retour
            </Link>
            <h1 className="text-4xl font-black text-slate-900 uppercase italic leading-none">Météo des Lacs <span className="text-emerald-600">7 Jours</span></h1>
        </div>
        <div className="hidden md:flex bg-white px-4 py-2 rounded-xl border border-slate-200 items-center gap-2 text-sm font-bold shadow-sm">
          <Calendar size={18} className="text-emerald-600" /> {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
        </div>
      </header>

      {/* LA CARTE */}
      <div className="max-w-7xl mx-auto mb-12 h-[400px] bg-white p-2 rounded-[3rem] shadow-xl border border-emerald-100 overflow-hidden">
        <MapLacs data={data} />
      </div>

      {/* LES CARTES LACS AVEC 7 JOURS */}
      <div className="max-w-7xl mx-auto space-y-12">
        {data.map((lac, idx) => (
          <div key={idx} id={`lac-${lac.name.replace(/\s+/g, '')}`} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-emerald-800 p-6 text-white">
              <h2 className="text-2xl font-black">{lac.name}</h2>
              <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={14} /> {lac.city} ({lac.dept}) • {lac.dist}
              </p>
            </div>

            {/* SCROLL HORIZONTAL 7 JOURS */}
            <div className="p-4 md:p-8 overflow-x-auto scrollbar-hide">
              <div className="flex gap-4 min-w-[900px]">
                {lac.forecast?.map((jour: any, i: number) => (
                  <div key={i} className={`flex-1 p-5 rounded-3xl border transition-all ${i === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200'}`}>
                    <div className="text-[10px] font-black text-slate-400 uppercase text-center mb-4">
                      {new Date(jour.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex flex-col items-center gap-2 mb-4">
                      {getIcon(jour.code)}
                      <div className="text-center leading-tight">
                        <span className="text-2xl font-black text-slate-900">{jour.tempMax}°</span>
                        <span className="block text-xs font-bold text-emerald-600">{jour.tempMin}°</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-200 space-y-2">
                        <div className="flex justify-between text-[9px] font-black">
                            <span className="text-slate-400 uppercase tracking-tighter text-left">Vent</span>
                            <span className="text-slate-800 text-right">{jour.wind} km/h</span>
                        </div>
                        <div className="flex justify-between text-[9px] font-black">
                            <span className="text-slate-400 uppercase tracking-tighter text-left">UV</span>
                            <span className={jour.uv > 6 ? 'text-orange-600' : 'text-emerald-700'}>{Math.round(jour.uv)}</span>
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