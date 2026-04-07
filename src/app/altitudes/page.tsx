"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Mountain, ArrowLeft, Loader2, Navigation, ChevronRight } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface AltitudePoint {
  id: number;
  nom: string;
  altitude: number;
  description: string;
  lat: number;
  lng: number;
}

export default function AltitudesPage() {
  const [points, setPoints] = useState<AltitudePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [L, setL] = useState<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Charger les données et trier
  useEffect(() => {
    fetch("/api/altitudes")
      .then((res) => res.json())
      .then((data) => {
        const sortedData = [...data].sort((a, b) => b.altitude - a.altitude);
        setPoints(sortedData);
      })
      .catch((err) => console.error("Erreur API:", err));
  }, []);

  // 2. Initialisation de la carte avec FIX d'affichage
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const Leaflet = (await import('leaflet')).default;
      setL(Leaflet);

      if (mapInstance.current) return;

      mapInstance.current = Leaflet.map(mapRef.current!).setView([43.6045, 1.4442], 12);

      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);

      markersLayerRef.current = Leaflet.layerGroup().addTo(mapInstance.current);
      
      // Correction du rendu des tuiles (bug grisé)
      setTimeout(() => {
        mapInstance.current?.invalidateSize();
        setIsMapReady(true);
        setLoading(false);
      }, 600);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 3. Mise à jour des marqueurs avec ANCRES
  useEffect(() => {
    if (!L || !markersLayerRef.current || points.length === 0 || !isMapReady) return;

    markersLayerRef.current.clearLayers();

    points.forEach((point, index) => {
      const numero = index + 1;
      const pointId = `alt-${point.id}`;
      
      const customIcon = L.divIcon({
        className: "custom-div-icon",
        html: `
          <div style="
            background-color: #059669; 
            color: white; 
            width: 28px; 
            height: 28px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-weight: 900; 
            font-size: 11px; 
            border: 2px solid white; 
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
          ">
            ${numero}
          </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
      });

      const marker = L.marker([point.lat, point.lng], { icon: customIcon });
      
      marker.bindPopup(`
        <div style="font-family: sans-serif; text-align: center; min-width: 160px;">
          <div style="font-size: 9px; color: #059669; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">POINT HAUT N°${numero}</div>
          <strong style="font-size: 15px; display: block; margin: 4px 0; color: #1e293b;">${point.nom}</strong>
          <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 4px; border-radius: 6px; font-weight: 900; color: #065f46; font-size: 13px; margin-bottom: 8px;">
            ${point.altitude}m
          </div>
          <a href="#${pointId}" style="display: inline-block; background: #1e293b; color: white; padding: 5px 10px; border-radius: 4px; text-decoration: none; font-size: 10px; font-weight: bold; text-transform: uppercase;">Détails quartier ↓</a>
        </div>
      `);

      marker.addTo(markersLayerRef.current);
    });
  }, [L, points, isMapReady]);

  const focusOnPoint = (point: AltitudePoint) => {
    if (mapInstance.current) {
      mapInstance.current.flyTo([point.lat, point.lng], 15, { duration: 1.5 });
      // Remonte vers la carte sur mobile
      if (window.innerWidth < 1024) {
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="flex flex-col h-screen p-4 gap-4 bg-slate-50 font-sans text-slate-900">
      
      <nav className="flex justify-between items-center px-1">
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-900 font-black uppercase text-xs tracking-tighter transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          RETOUR ACCUEIL
        </Link>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Données Topographiques</span>
      </nav>

      <header className="flex items-center gap-4 bg-white p-5 rounded-[2rem] shadow-sm border border-slate-200">
        <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-200">
          <Mountain size={28} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
            Altitudes <span className="text-emerald-600">TOULOUSAINES</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Points culminants par quartier</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden min-h-0">
        
        {/* LISTE CLASSEMENT */}
        <div className="lg:col-span-4 bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-auto custom-scrollbar">
          <div className="p-5 bg-slate-900 text-white flex justify-between items-center sticky top-0 z-20">
             <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Navigation size={14} className="text-emerald-400" /> CLASSEMENT
             </h2>
             <span className="text-[10px] bg-emerald-600 px-2 py-0.5 rounded font-black uppercase italic">Top {points.length}</span>
          </div>

          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-slate-100">
              {points.map((point, index) => (
                <tr
                  key={point.id}
                  id={`alt-${point.id}`}
                  onClick={() => focusOnPoint(point)}
                  className="hover:bg-emerald-50 cursor-pointer transition-all group scroll-mt-24"
                >
                  <td className="p-4 text-center w-16">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 text-slate-400 font-black text-xs group-hover:bg-emerald-600 group-hover:text-white transition-all border border-slate-200">
                      #{index + 1}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-black text-slate-900 uppercase tracking-tighter leading-tight group-hover:text-emerald-700 transition-colors">
                      {point.nom}
                    </div>
                    <p className="text-[11px] text-slate-400 font-bold mt-1 line-clamp-1 italic group-hover:text-slate-600">{point.description}</p>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-black text-emerald-600 font-mono tracking-tighter">
                          {point.altitude}m
                        </span>
                        <ChevronRight size={14} className="text-slate-200 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CARTE */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white relative z-0">
          {loading && (
            <div className="absolute inset-0 z-50 bg-slate-50/90 backdrop-blur-sm flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
              <p className="text-slate-900 font-black text-xs uppercase tracking-widest italic animate-pulse">Analyse topographique en cours...</p>
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
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #10b981; }
        .leaflet-popup-content-wrapper { border-radius: 1rem; border: 2px solid #10b981; }
      `}</style>
    </div>
  );
}
