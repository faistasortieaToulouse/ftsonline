'use client';

import { useEffect, useRef, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Map as MapIcon, Navigation, Locate, Loader2, ChevronRight } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface Quartier {
  id: number;
  nom: string;
  lat: number;
  lng: number;
}

export default function QuartiersToulouseMapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<Map<number, any>>(new Map());

  const [quartiers, setQuartiers] = useState<Quartier[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Utilitaire pour créer des IDs d'ancres valides
  const slugify = (text: string) => 
    text.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

  // --- 1. Charger les données ---
  useEffect(() => {
    fetch('/api/quartiertoulouse')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setQuartiers(data);
        }
      })
      .catch(console.error);
  }, []);

  // --- 2. Initialisation de la carte ---
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || quartiers.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (mapInstance.current) return;

      const toulouseCenter: [number, number] = [43.6045, 1.444];
      const map = L.map(mapRef.current!).setView(toulouseCenter, 13);
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      // Ajout des marqueurs
      quartiers.forEach((q, i) => {
        if (typeof q.lat !== 'number' || typeof q.lng !== 'number') return;

        // DESIGN ANCIEN MARQUEUR (LOSANGE)
        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="
            background-color: #1e3a8a; 
            color: white; 
            width: 28px; height: 28px; 
            border-radius: 6px; 
            display: flex; align-items: center; justify-content: center; 
            font-size: 10px; font-weight: 900; 
            border: 2px solid white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
            transform: rotate(45deg);
          "><span style="transform: rotate(-45deg)">${i + 1}</span></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const anchorId = `#secteur-${slugify(q.nom)}`;

        const marker = L.marker([q.lat, q.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: sans-serif; padding: 5px; min-width: 150px;">
              <div style="color: #2563eb; font-weight: 900; font-size: 9px; uppercase; tracking-widest; mb-1">
                SECTEUR RÉPERTORIÉ
              </div>
              <strong style="font-size: 14px; color: #1e293b; display: block; margin-bottom: 8px;">${q.nom}</strong>
              <a href="${anchorId}" 
                 style="display: block; background-color: #1e3a8a; color: white; text-align: center; padding: 8px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 10px; text-transform: uppercase;"
              >
                Fiche Quartier ↓
              </a>
            </div>
          `);
        
        markersRef.current.set(q.id, marker);
      });

      setTimeout(() => {
        map.invalidateSize();
        setIsReady(true);
      }, 500);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [quartiers]);

  const focusQuartier = (q: Quartier) => {
    const marker = markersRef.current.get(q.id);
    if (mapInstance.current && marker) {
      mapInstance.current.flyTo([q.lat, q.lng], 15, { duration: 1.5 });
      marker.openPopup();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans scroll-smooth">
      <style jsx global>{`
        html { scroll-behavior: smooth; }
        .custom-div-icon { background: none !important; border: none !important; }
        .leaflet-popup-content-wrapper { border-radius: 1rem; padding: 0; overflow: hidden; }
        .leaflet-popup-content { margin: 12px; }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <nav className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-black uppercase text-[10px] tracking-[0.2em] transition-all group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            Retour Dashboard
          </Link>
        </nav>

        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2 text-blue-600">
              <MapIcon size={24} />
              <span className="font-black uppercase tracking-[0.3em] text-[10px]">Atlas Urbain</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
              Quartiers <span className="text-blue-600">Toulousains</span>
            </h1>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
             <Locate size={20} className="text-blue-600" />
             <span className="text-sm font-black text-slate-700 uppercase tracking-tighter">{quartiers.length} Secteurs cartographiés</span>
          </div>
        </header>

        {/* ZONE CARTE */}
        <div className="relative group mb-16 border-4 border-white shadow-2xl rounded-[3rem] bg-slate-200 z-0 overflow-hidden h-[50vh] md:h-[65vh]">
          <div ref={mapRef} className="h-full w-full" />
          {!isReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/90 z-10 backdrop-blur-sm">
               <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Synchronisation géodésique...</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mb-8 border-b border-slate-200 pb-4">
          <Navigation className="text-slate-900" size={24} />
          <h2 className="text-2xl font-black uppercase tracking-tighter italic text-slate-800">Index des secteurs</h2> 
        </div>

        {/* GRILLE DES QUARTIERS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {quartiers.map((q, i) => (
            <div 
              key={q.id} 
              id={`secteur-${slugify(q.nom)}`} // ID POUR L'ANCRE
              onClick={() => focusQuartier(q)}
              className="group cursor-pointer p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-2xl hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 scroll-mt-10"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="bg-blue-900 text-white w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transform rotate-45">
                  <span className="-rotate-45">{(i + 1).toString().padStart(2, '0')}</span>
                </span>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                  Ref {q.id}
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-4 group-hover:text-blue-700 transition-colors">
                {q.nom}
              </h3>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                <code className="text-[9px] font-mono text-slate-400">
                  {q.lat.toFixed(3)}°N / {q.lng.toFixed(3)}°E
                </code>
                <div className="bg-slate-50 p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-600" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-20 py-10 border-t border-slate-200 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Urban Data Toulouse — 2026</p>
        </footer>
      </div>
    </div>
  );
}
