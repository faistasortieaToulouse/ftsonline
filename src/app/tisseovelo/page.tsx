'use client';

import React, { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import Link from "next/link";
import { ArrowLeft, Search, Bike, Loader2, Navigation } from "lucide-react";

export default function VeloToulousePage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);

  const [stations, setStations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // 1. Charger les données
  useEffect(() => {
    fetch('/api/tisseovelo')
      .then(res => res.json())
      .then(data => {
        setStations(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // 2. Initialiser la carte
  useEffect(() => {
    if (isLoading || !mapRef.current || mapInstance.current) return;

    import('leaflet').then((L) => {
      // Correction icônes par défaut Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!).setView([43.6047, 1.4442], 13);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstance.current = map;
      
      // Forcer un premier rendu des marqueurs une fois la carte prête
      renderMarkers(L);
    });
  }, [isLoading]);

  // 3. Fonction pour dessiner les marqueurs
  const renderMarkers = (L: any) => {
    if (!mapInstance.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    const filtered = stations.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.forEach(s => {
      const hasBikes = s.bikes_available > 0;
      const color = hasBikes ? '#10b981' : '#ef4444'; // Vert si dispo, Rouge sinon
      
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 14px; height: 14px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      L.marker([s.lat, s.lon], { icon })
        .bindPopup(`
          <div style="font-family: sans-serif;">
            <strong style="color: #2563eb;">${s.name}</strong><br/>
            <div style="margin-top: 8px; display: flex; gap: 10px;">
              <span>🚲 <b>${s.bikes_available}</b></span>
              <span>⚓ <b>${s.docks_available}</b></span>
            </div>
          </div>
        `)
        .addTo(markersGroupRef.current);
    });
  };

  // 4. Mettre à jour les marqueurs quand la recherche ou les données changent
  useEffect(() => {
    if (mapInstance.current) {
      import('leaflet').then((L) => renderMarkers(L));
    }
  }, [searchQuery, stations]);

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      {/* Pas de GoogleTranslate ici, il est dans le Layout */}

      <aside className="w-80 border-r bg-slate-50 flex flex-col z-20 shadow-lg relative pt-12">
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
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-700"
              placeholder="Chercher une station..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {isLoading ? (
            <div className="flex flex-col items-center p-10 text-slate-400">
              <Loader2 className="animate-spin mb-2" />
              <p className="text-xs font-medium">Chargement des stations...</p>
            </div>
          ) : (
            stations
              .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(s => (
                <button 
                  key={s.id}
                  onClick={() => {
                    mapInstance.current.flyTo([s.lat, s.lon], 16);
                    // On cherche le marqueur pour ouvrir son popup automatiquement
                    markersGroupRef.current.eachLayer((layer: any) => {
                      if (layer.getLatLng().lat === s.lat) layer.openPopup();
                    });
                  }}
                  className="w-full text-left p-3 mb-2 bg-white rounded-xl border border-slate-100 hover:border-emerald-300 transition-all shadow-sm group"
                >
                  <div className="text-sm font-bold text-slate-700 truncate">{s.name}</div>
                  <div className="flex justify-between mt-2 items-center">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${s.bikes_available > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                      {s.bikes_available} vélos
                    </span>
                    <Navigation size={14} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
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
