'use client';

import React, { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import Link from "next/link";
import { ArrowLeft, Search, Bike, Loader2, Navigation } from "lucide-react";

export default function VeloToulousePage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any>(null);

  const [stations, setStations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tisseovelo')
      .then(res => res.json())
      .then(data => {
        setStations(Array.isArray(data) ? data : []);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (isLoading || !mapRef.current || mapInstance.current) return;

    import('leaflet').then((L) => {
      const map = L.map(mapRef.current!).setView([43.6047, 1.4442], 14);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
      markersRef.current = L.layerGroup().addTo(map);
      mapInstance.current = map;
    });
  }, [isLoading]);

  // Filtrage et affichage des marqueurs
  useEffect(() => {
    if (!mapInstance.current) return;

    import('leaflet').then((L) => {
      markersRef.current.clearLayers();
      
      stations
        .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .forEach(s => {
          const color = s.bikes_available > 0 ? '#10b981' : '#ef4444'; // Vert si vélos dispos, rouge sinon
          
          const icon = L.divIcon({
            className: 'custom-bike-icon',
            html: `<div style="background-color: ${color}; border: 2px solid white; width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            iconSize: [12, 12]
          });

          L.marker([s.lat, s.lon], { icon })
            .bindPopup(`
              <div class="font-sans p-1">
                <b class="text-blue-600">${s.name}</b><br/>
                <div class="mt-2 flex gap-4">
                  <span>🚲 <b>${s.bikes_available}</b> vélos</span>
                  <span>⚓ <b>${s.docks_available}</b> places</span>
                </div>
              </div>
            `)
            .addTo(markersRef.current);
        });
    });
  }, [searchQuery, stations]);

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
    
      <aside className="w-80 border-r bg-slate-50 flex flex-col z-20 shadow-lg mt-10">
        <div className="p-6 bg-white border-b">
          <nav className="mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-900 font-bold transition-all text-sm group">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Retour à l'accueil
            </Link>
          </nav>

          <div className="flex items-center gap-2 mb-4">
            <Bike className="text-emerald-600" size={24} />
            <h1 className="text-xl font-bold text-slate-800 uppercase tracking-tighter">VélôToulouse</h1>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
            <input 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              placeholder="Nom de la station..."
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <p className="text-[11px] text-slate-500 italic mt-3">
            Sélectionne une station pour voir les vélos disponibles.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {isLoading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-emerald-600" /></div>
          ) : (
            stations
              .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(s => (
                <button 
                  key={s.id}
                  onClick={() => mapInstance.current.flyTo([s.lat, s.lon], 17)}
                  className="w-full text-left p-3 mb-2 bg-white rounded-xl border border-slate-100 hover:border-emerald-300 transition-all shadow-sm group"
                >
                  <div className="text-sm font-bold text-slate-700 truncate">{s.name}</div>
                  <div className="flex justify-between mt-2">
                    <span className={`text-xs font-bold ${s.bikes_available > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {s.bikes_available} vélos dispos
                    </span>
                    <Navigation size={12} className="text-slate-300 group-hover:text-emerald-500" />
                  </div>
                </button>
              ))
          )}
        </div>
      </aside>

      <main className="flex-1 relative">
        <div ref={mapRef} className="h-full w-full z-10" />
      </main>
    </div>
  );
}
