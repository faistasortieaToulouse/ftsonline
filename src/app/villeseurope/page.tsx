'use client';

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, MapPin, Users, Calendar, Loader2, ChevronRight } from "lucide-react";
import "leaflet/dist/leaflet.css";

export default function VillesEuropePage() {
  const [data, setData] = useState<any[]>([]);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // Utilitaire pour créer des IDs d'ancres valides
  const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  useEffect(() => {
    fetch("/api/villeseurope")
      .then((res) => res.json())
      .then((villes) => setData(villes))
      .catch((err) => console.error("Erreur:", err));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || mapInstance.current || data.length === 0) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      mapInstance.current = L.map(mapRef.current!).setView([48.5, 10], 4);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapInstance.current);

      data.forEach((ville) => {
        if (ville.lat && ville.lng) {
          const numberedIcon = L.divIcon({
            className: "custom-number-marker",
            html: `<div class="flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-[10px] font-bold rounded-full border-2 border-white shadow-lg hover:bg-slate-900 transition-colors">${ville.rank}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          L.marker([ville.lat, ville.lng], { icon: numberedIcon })
            .addTo(mapInstance.current)
            .bindPopup(`
              <div style="font-family: sans-serif; min-width: 140px; padding: 5px;">
                <h4 style="margin: 0; font-weight: 800; color: #1e293b; font-size: 14px;">${ville.city}</h4>
                <p style="margin: 4px 0; font-size: 11px; color: #64748b; font-weight: 600;">${ville.population} habitants</p>
                <div style="color: #3b82f6; font-size: 10px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px;">Rang: #${ville.rank}</div>
                
                <a href="#ville-${slugify(ville.city)}" style="
                  display: block;
                  background: #f1f5f9;
                  color: #1e293b;
                  text-decoration: none;
                  padding: 6px;
                  border-radius: 8px;
                  font-size: 10px;
                  font-weight: 800;
                  text-align: center;
                  border: 1px solid #e2e8f0;
                  text-transform: uppercase;
                ">Voir les détails ↓</a>
              </div>
            `);
        }
      });

      setTimeout(() => {
        mapInstance.current.invalidateSize();
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
  }, [data]);

  return (
    <div className="p-6 max-w-6xl mx-auto bg-slate-50 min-h-screen font-sans">
      <nav className="mb-8">
        <Link href="/" className="text-blue-700 hover:text-blue-900 flex items-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retour à l'Accueil
        </Link>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-black mb-4 flex items-center gap-3 text-slate-900 uppercase tracking-tighter italic">
          <Building2 className="text-blue-600" size={36} /> 
          Démographie des <span className="text-blue-600">Villes d'Europe</span>
        </h1>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest italic">
          Classement interactif des plus grandes métropoles de l'UE (Données 2026).
        </p>
      </div>

      {/* --- CARTE --- */}
      <div
        ref={mapRef}
        className="mb-12 border-4 border-white shadow-2xl rounded-[2.5rem] bg-slate-200 overflow-hidden h-[45vh] md:h-[65vh] relative z-0"
      >
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/90 z-10 backdrop-blur-md">
            <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-3" />
            <p className="text-slate-900 font-black text-xs uppercase tracking-widest italic animate-pulse">Scan des coordonnées métropolitaines...</p>
          </div>
        )}
      </div>

      {/* Grille des Villes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((ville: any, i: number) => (
          <div 
            key={i}
            id={`ville-${slugify(ville.city)}`} // ID POUR ANCRE
            className="flex flex-col p-6 border border-slate-200 rounded-[2rem] bg-white shadow-sm hover:shadow-xl hover:border-blue-500 transition-all duration-300 group scroll-mt-10"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 bg-slate-100 text-slate-400 text-[10px] font-black rounded-xl border border-slate-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                  {ville.rank}
                </span>
                <h3 className="font-black text-slate-900 text-xl uppercase tracking-tighter">{ville.city}</h3>
              </div>
              <MapPin size={20} className="text-slate-200 group-hover:text-blue-500 transition-colors" />
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">
                  {ville.country}
                </p>
                <div className="flex items-center gap-2 text-slate-900 font-black">
                  <Users size={16} className="text-slate-300" />
                  <span className="text-lg italic tracking-tight">{ville.population} hab.</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  <Calendar size={12} />
                  Données : {ville.date}
                </div>
                <ChevronRight size={16} className="text-slate-200 group-hover:translate-x-1 transition-transform group-hover:text-blue-500" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-20 p-12 bg-slate-900 rounded-[3rem] text-center">
        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">Source : Eurostat & Recensements Nationaux — 2026</p>
      </footer>

      <style jsx global>{`
        .custom-number-marker { background: none !important; border: none !important; }
        
        .leaflet-popup-content-wrapper { 
          border-radius: 1.2rem; 
          border: 1px solid #e2e8f0; 
          background: white;
          box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.1);
          padding: 0;
        }
        .leaflet-popup-tip { background: white; border: 1px solid #e2e8f0; }
        
        /* Croix de fermeture noire sur fond blanc pour la visibilité */
        .leaflet-container a.leaflet-popup-close-button {
          color: #1e293b;
          font-weight: bold;
          padding: 10px 10px 0 0;
        }
        
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
