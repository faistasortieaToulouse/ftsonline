'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Anchor, Shield, MapPin, ChevronRight } from "lucide-react";

interface MembreOTAN {
  pays: string;
  capitale: string;
  date_admission: string;
  population: number;
  lat: number;
  lng: number;
}

interface OTANData {
  nom_liste: string;
  total: number;
  otan_membres: MembreOTAN[];
}

export default function OTANPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [data, setData] = useState<OTANData | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Utilitaire pour créer des IDs d'ancres valides
  const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  useEffect(() => {
    fetch("/api/OTAN")
      .then((res) => res.json())
      .then((json) => {
        if (json.otan_membres) setData(json);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current!).setView([45, -15], 3);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);

      setIsReady(true);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isReady || !mapInstance.current || !data) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      
      data.otan_membres.forEach((p, index) => {
        if (p.lat && p.lng) {
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color:#1e3a8a; color:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-weight:900; border:2px solid white; box-shadow:0 4px 10px rgba(0,0,0,0.3); font-size:10px;">${index + 1}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const marker = L.marker([p.lat, p.lng], { icon: customIcon });
          
          marker.bindPopup(`
            <div style="font-family: sans-serif; min-width: 160px; padding: 5px;">
              <div style="font-size: 9px; font-weight: 900; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;">Alliance Atlantique</div>
              <strong style="font-size: 16px; color: #1e3a8a; display: block; margin-bottom: 4px;">${p.pays}</strong>
              <div style="font-size: 12px; color: #475569;">🏠 <b>Capitale:</b> ${p.capitale}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">📅 Adhésion : ${p.date_admission}</div>
              
              <a href="#membre-${slugify(p.pays)}" style="
                display: block;
                background: #1e3a8a;
                color: white;
                text-decoration: none;
                padding: 8px;
                border-radius: 10px;
                font-size: 10px;
                font-weight: 900;
                text-align: center;
                margin-top: 10px;
                text-transform: uppercase;
              ">Fiche technique ↓</a>
            </div>
          `);

          marker.addTo(mapInstance.current);
        }
      });
    };

    updateMarkers();
  }, [isReady, data]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-black uppercase text-[10px] tracking-widest transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Portail de Défense
        </Link>
      </nav>

      <header className="mb-8 border-b-4 border-blue-900 pb-8">
        <h1 className="text-4xl md:text-6xl font-black text-blue-950 flex items-center gap-4 italic uppercase tracking-tighter">
          <Shield size={48} className="text-blue-900" />
          {data?.nom_liste || "Membres de l'OTAN"}
        </h1>
        <p className="mt-4 text-slate-500 font-bold text-xs md:text-sm uppercase tracking-widest flex items-center gap-2">
          <Anchor size={16} /> Organisation du Traité de l'Atlantique Nord — Database 2026
        </p>
      </header>

      {/* CARTE */}
      <div className="relative h-[45vh] md:h-[65vh] w-full mb-12 border-4 border-white shadow-2xl rounded-[3rem] bg-slate-200 overflow-hidden z-0">
        <div ref={mapRef} className="h-full w-full" />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100/90 z-10 backdrop-blur-md">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-900 animate-pulse">Initialisation du réseau sécurisé...</p>
            </div>
          </div>
        )}
      </div>

      {/* GRILLE DES MEMBRES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data?.otan_membres.map((p, index) => (
          <div 
            key={index} 
            id={`membre-${slugify(p.pays)}`} // ID POUR ANCRE
            className="group relative p-6 bg-white rounded-[2rem] shadow-sm border border-slate-200 hover:bg-blue-950 hover:border-blue-950 transition-all duration-500 flex flex-col gap-4 scroll-mt-10"
          >
            <div className="flex justify-between items-start">
              <span className="text-2xl font-black text-slate-100 group-hover:text-blue-500/30 transition-colors">
                {(index + 1).toString().padStart(2, '0')}
              </span>
              <MapPin size={18} className="text-slate-200 group-hover:text-blue-400 transition-colors" />
            </div>
            
            <div className="overflow-hidden">
              <h3 className="font-black text-blue-900 group-hover:text-white text-xl transition-colors uppercase tracking-tighter truncate leading-none mb-1">
                {p.pays}
              </h3>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-500 group-hover:text-blue-300 transition-colors">
                {p.capitale}
              </p>
              
              <div className="mt-6 pt-4 border-t border-slate-50 group-hover:border-blue-900 flex justify-between items-center">
                <p className="text-[11px] font-bold text-slate-400 group-hover:text-blue-200">Adhésion {p.date_admission.split(' ').pop()}</p>
                <ChevronRight size={14} className="text-slate-200 group-hover:text-white transition-all group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-24 p-12 bg-blue-950 rounded-[3rem] text-center overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-900 rounded-full blur-3xl opacity-20"></div>
          <p className="relative z-10 text-blue-400 font-black text-[10px] uppercase tracking-[0.5em]">NATO Strategic Data Center — 2026</p>
      </footer>

      <style jsx global>{`
        .custom-marker { background: none !important; border: none !important; }
        
        .leaflet-popup-content-wrapper { 
          border-radius: 1.5rem; 
          border: 1px solid #e2e8f0; 
          background: white;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          padding: 0;
        }
        .leaflet-popup-tip { background: white; border: 1px solid #e2e8f0; }
        
        .leaflet-container a.leaflet-popup-close-button {
          color: #1e3a8a;
          font-weight: 900;
          padding: 12px 12px 0 0;
        }

        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
