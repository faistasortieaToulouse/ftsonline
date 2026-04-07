'use client';

import { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, Loader2, Map as MapIcon, Calendar, Info } from "lucide-react";

interface Territoire {
  nom: string;
  statut: string;
  continent: string;
  lat: number;
  lng: number;
  description: string;
  date_debut: number;
  date_fin: number;
  id?: string | number;
}

export default function ColonieEuropePage() {
  const [territoires, setTerritoires] = useState<Territoire[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Utilitaire pour créer des IDs d'ancres propres
  const slugify = (text: string) => 
    text.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

  // 1. Fetch et Tri des données
  useEffect(() => {
    fetch("/api/colonieeurope")
      .then(async (res) => {
        const data = await res.json();
        if (Array.isArray(data)) {
          const sorted = data.sort((a, b) => 
            a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' })
          );
          setTerritoires(sorted);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // 2. Initialisation de Leaflet
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current!).setView([47.5, 7.5], 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      setIsMapReady(true);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 3. Mise à jour des Marqueurs avec ANCRES
  useEffect(() => {
    if (!isMapReady || !mapInstance.current || territoires.length === 0) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;

      // Nettoyage des couches
      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) mapInstance.current.removeLayer(layer);
      });

      territoires.forEach((t, index) => {
        const customIcon = L.divIcon({
          className: "custom-marker",
          html: `<div style="background-color: #1e3a8a; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${index + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const anchorId = `#territoire-${slugify(t.nom)}`;

        L.marker([t.lat, t.lng], { icon: customIcon })
          .addTo(mapInstance.current)
          .bindPopup(`
            <div style="color: black; font-family: sans-serif; min-width: 180px; padding: 5px;">
              <strong style="font-size: 14px; display: block; margin-bottom: 2px;">${t.nom}</strong>
              <span style="color: #b91c1c; font-size: 10px; font-weight: bold;">${t.date_debut} — ${t.date_fin}</span>
              <p style="margin-top: 6px; font-size: 11px; color: #444; line-height: 1.3; margin-bottom: 10px;">
                ${t.description.substring(0, 60)}...
              </p>
              <a href="${anchorId}" 
                 style="display: block; background-color: #1e3a8a; color: white; text-align: center; padding: 7px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 10px; text-transform: uppercase;"
              >
                Consulter la fiche ↓
              </a>
            </div>
          `);
      });
    };

    updateMarkers();
  }, [isMapReady, territoires]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900 scroll-smooth">
      <style jsx global>{`
        html { scroll-behavior: smooth; }
        .custom-marker { background: none !important; border: none !important; }
      `}</style>

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold group uppercase text-[10px] tracking-widest">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-10 text-center md:text-left">
        <h1 className="text-4xl md:text-6xl font-black text-blue-950 uppercase tracking-tighter italic">
          Empire Français : <span className="text-blue-600">Annexions</span>
        </h1>
        <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
            <span className="h-px w-12 bg-blue-600 hidden md:block"></span>
            <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.2em]">L'Europe Napoléonienne (1792 - 1815)</p>
        </div>
      </header>

      {/* --- CARTE --- */}
      <div className="mb-12 border-4 border-white shadow-2xl rounded-[2.5rem] bg-slate-200 overflow-hidden h-[50vh] md:h-[60vh] relative z-0">
        <div ref={mapRef} className="h-full w-full" />
        
        {(loading || !isMapReady) && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100/90 backdrop-blur-md">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="font-black text-blue-950 text-xs uppercase tracking-widest animate-pulse">
                Restauration des frontières historiques...
            </p>
          </div>
        )}
      </div>

      {/* --- GRILLE --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {territoires.map((t, index) => (
          <div 
            key={t.nom} 
            id={`territoire-${slugify(t.nom)}`} // ID POUR L'ANCRE
            className="group p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-600 transition-all duration-500 flex flex-col scroll-mt-10"
          >
            <div className="flex justify-between items-start mb-6">
              <span className="text-5xl font-black text-slate-50 group-hover:text-blue-50 transition-colors">
                {(index + 1).toString().padStart(2, '0')}
              </span>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 text-red-600 font-black text-xs uppercase italic">
                    <Calendar size={14} /> {t.date_debut} — {t.date_fin}
                </div>
              </div>
            </div>

            <h3 className="font-black text-2xl text-blue-950 group-hover:text-blue-700 transition-colors uppercase tracking-tight mb-2">
                {t.nom}
            </h3>
            
            <div className="inline-flex items-center gap-2 mb-6">
                <Info size={14} className="text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.statut}</span>
            </div>

            <p className="text-sm text-slate-600 group-hover:text-slate-800 leading-relaxed font-medium">
                {t.description}
            </p>

            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em]">Archives Impériales</span>
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <MapIcon size={16} />
                </div>
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-24 py-12 border-t border-slate-200 text-center">
        <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.5em]">
          FTS Online — Système de Cartographie Temporelle 2026
        </p>
      </footer>
    </div>
  );
}
