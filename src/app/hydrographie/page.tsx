"use client";

import { useEffect, useRef, useState } from "react";
import { Waves, ArrowLeft, Loader2, Navigation, ChevronRight } from "lucide-react";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

interface HydroPoint {
  id: number;
  nom: string;
  categorie: string;
  zone: string;
  lat: number | null;
  lng: number | null;
  desc: string;
}

const TOULOUSE_CENTER: [number, number] = [43.6045, 1.4442];

export default function HydrographiePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);

  const [points, setPoints] = useState<HydroPoint[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // 1. Chargement des données
  useEffect(() => {
    fetch("/api/hydrographie")
      .then((res) => res.json())
      .then((data) => {
        setPoints(data);
        setIsLoadingData(false);
      })
      .catch((err) => {
        console.error("Erreur API:", err);
        setIsLoadingData(false);
      });
  }, []);

  // 2. Initialisation de Leaflet
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData || points.length === 0) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      if (mapInstance.current) return;

      const map = L.map(mapRef.current!, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView(TOULOUSE_CENTER, 13);

      mapInstance.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      // Ajout des marqueurs
      points.forEach((point) => {
        if (point.lat === null || point.lng === null) return;

        const customIcon = L.divIcon({
          className: "custom-div-icon",
          html: `
            <div style="
              background-color: #2563eb;
              color: white;
              width: 30px;
              height: 30px;
              border-radius: 50%;
              border: 3px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 900;
              font-size: 11px;
              box-shadow: 0 4px 10px rgba(37, 99, 235, 0.4);
            ">
              ${point.id}
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const marker = L.marker([point.lat, point.lng], { icon: customIcon }).addTo(map);

        marker.bindPopup(`
          <div style="text-align: center; font-family: sans-serif; min-width: 160px; padding: 5px;">
            <div style="font-size: 9px; color: #2563eb; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">COURS D'EAU #${point.id}</div>
            <strong style="font-size: 15px; display: block; margin: 4px 0; color: #1e293b;">${point.nom}</strong>
            <p style="font-size: 11px; color: #64748b; line-height: 1.4; margin-bottom: 8px;">${point.categorie}</p>
            <a href="#hydro-${point.id}" style="display: inline-block; background: #2563eb; color: white; padding: 5px 12px; border-radius: 6px; text-decoration: none; font-size: 10px; font-weight: bold; text-transform: uppercase;">Détails techniques ↓</a>
          </div>
        `);
      });

      // Fix du bug de rendu (tuiles grises)
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
  }, [isLoadingData, points]);

  const focusOnPoint = (point: HydroPoint) => {
    if (!mapInstance.current || point.lat === null || point.lng === null) return;

    mapInstance.current.flyTo([point.lat, point.lng], 16, {
      duration: 1.5,
    });
    
    // Remonter vers la carte sur mobile
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col h-screen p-4 gap-4 bg-slate-50 font-sans text-slate-900">
      
      <nav className="flex justify-between items-center px-1">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-black uppercase text-xs tracking-widest transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          RETOUR ACCUEIL
        </Link>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Réseau Hydrographique</span>
      </nav>

      <header className="flex items-center gap-4 bg-white p-5 rounded-[2rem] shadow-sm border border-slate-200">
        <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
          <Waves size={28} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
            Zones <span className="text-blue-600">HUMIDES</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Inventaire des cours d'eau & bassins</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden min-h-0">
        
        {/* LISTE DES COURS D'EAU */}
        <div className="lg:col-span-4 bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-auto custom-scrollbar">
          <div className="p-5 bg-slate-900 text-white flex justify-between items-center sticky top-0 z-20">
             <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Navigation size={14} className="text-blue-400" /> LISTE DES SITES
             </h2>
             <span className="text-[10px] bg-blue-600 px-2 py-0.5 rounded font-black uppercase italic">{points.length} Points</span>
          </div>

          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-slate-100">
              {points.map((point) => (
                <tr
                  key={point.id}
                  id={`hydro-${point.id}`}
                  onClick={() => focusOnPoint(point)}
                  className="hover:bg-blue-50/50 cursor-pointer transition-all group scroll-mt-24"
                >
                  <td className="p-4 text-center w-16">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 text-slate-400 font-black text-xs group-hover:bg-blue-600 group-hover:text-white transition-all border border-slate-200">
                      #{point.id}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-black text-slate-900 uppercase tracking-tighter leading-tight group-hover:text-blue-700 transition-colors">
                      {point.nom}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider group-hover:text-slate-600 italic">
                      {point.categorie} — {point.zone}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity">
                      {point.desc}
                    </p>
                  </td>
                  <td className="p-4 text-right">
                    <ChevronRight size={18} className="text-slate-200 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CARTE */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white relative z-0">
          {!isReady && (
            <div className="absolute inset-0 z-50 bg-slate-50/90 backdrop-blur-sm flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-slate-900 font-black text-xs uppercase tracking-widest italic animate-pulse">Cartographie des ressources en eau...</p>
            </div>
          )}

          <div 
            ref={mapRef} 
            className="h-full w-full"
          />
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
        .leaflet-popup-content-wrapper { border-radius: 1.5rem; border: 3px solid #2563eb; }
        .leaflet-popup-tip { background: #2563eb; }
        .custom-div-icon { background: none !important; border: none !important; }
      `}</style>
    </div>
  );
}
