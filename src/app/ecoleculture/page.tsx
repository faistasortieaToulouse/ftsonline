'use client';

import { useEffect, useRef, useState } from "react";
import { Library, MapPin, ArrowLeft, Loader2, Navigation, ExternalLink } from "lucide-react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

interface CulturePoint {
  id: number;
  nom: string;
  adresse: string;
  telephone: string;
  gestionnaire: string;
  siteWeb: string;
  lat: number | null;
  lng: number | null;
  quartier: string;
}

export default function EcoleCulturePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);

  const [points, setPoints] = useState<CulturePoint[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // 1. Récupération des données
  useEffect(() => {
    fetch("/api/ecoleculture")
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

  // 2. Initialisation de Leaflet avec FIX d'affichage
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current!).setView([43.6045, 1.4442], 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap',
        }).addTo(mapInstance.current);

        markersLayer.current = L.layerGroup().addTo(mapInstance.current);

        // FIX : Forcer le calcul de la taille pour éviter les carrés gris
        setTimeout(() => {
          mapInstance.current?.invalidateSize();
          setIsMapReady(true);
        }, 300);
      }
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isLoadingData]);

  // 3. Mise à jour des marqueurs avec LIEN ANCRE
  useEffect(() => {
    if (!isMapReady || !mapInstance.current) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;
      markersLayer.current.clearLayers();

      points.forEach((point) => {
        if (point.lat === null || point.lng === null) return;

        const customIcon = L.divIcon({
          className: "custom-marker",
          html: `<div style="background-color: #4f46e5; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">${point.id}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const popupContent = `
          <div style="color:#1e293b;padding:4px;font-family:sans-serif;min-width:180px;text-align:center;">
            <div style="font-size:10px; font-weight:bold; color:#6366f1; text-transform:uppercase;">${point.quartier}</div>
            <strong style="font-size:14px;color:#1e293b;display:block;margin:4px 0;">${point.nom}</strong>
            <a href="#point-${point.id}" style="display:inline-block; background:#4f46e5; color:white; padding:5px 10px; border-radius:5px; text-decoration:none; font-size:10px; font-weight:bold; margin-top:5px;">
               VOIR DANS LA LISTE ↓
            </a>
          </div>
        `;

        L.marker([point.lat, point.lng], { icon: customIcon })
          .bindPopup(popupContent)
          .addTo(markersLayer.current);
      });
    };

    updateMarkers();
  }, [isMapReady, points]);

  const focusOnPoint = (point: CulturePoint) => {
    if (!mapInstance.current || point.lat === null || point.lng === null) return;
    mapInstance.current.setView([point.lat, point.lng], 16, { animate: true });
    // Sur mobile, on remonte un peu vers la carte quand on clique sur la liste
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col h-screen p-4 gap-4 bg-slate-50 font-sans">
      
      <nav className="mb-2">
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-900 font-black uppercase text-xs transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Portail Toulouse
        </Link>
      </nav>

      <header className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div className="bg-indigo-600 p-3 rounded-xl text-white shadow-lg shadow-indigo-200">
          <Library size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 leading-none uppercase tracking-tighter italic">Écoles <span className="text-indigo-600">& Culture</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Enseignements artistiques de la Ville rose</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden">
        
        {/* LISTE AVEC ANCRES */}
        <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 sticky top-0 z-10 text-white">
              <tr>
                <th className="p-4 text-[10px] uppercase font-black tracking-widest w-16 text-center">N°</th>
                <th className="p-4 text-[10px] uppercase font-black tracking-widest">Établissement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {points.map((point) => (
                <tr
                  key={point.id}
                  id={`point-${point.id}`} // L'id pour l'ancre
                  onClick={() => focusOnPoint(point)}
                  className="hover:bg-indigo-50/50 cursor-pointer transition-all group scroll-mt-20"
                >
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-400 font-black text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors border border-slate-200">
                      {point.id}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-black text-slate-800 text-sm uppercase tracking-tighter leading-tight group-hover:text-indigo-700">{point.nom}</div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold mt-1 uppercase italic tracking-tighter">
                      <MapPin size={10} className="text-indigo-400" /> {point.quartier}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CARTE */}
        <div className="lg:col-span-8 bg-white rounded-2xl overflow-hidden shadow-xl border-4 border-white relative">
          <div ref={mapRef} className="h-full w-full z-0" />
          
          {(!isMapReady || isLoadingData) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-50/90 z-10">
              <Loader2 className="animate-spin h-10 w-10 text-indigo-700 mb-4" />
              <p className="text-indigo-900 font-black text-xs uppercase tracking-widest italic animate-pulse">
                Chargement de la carte...
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6366f1; }
      `}</style>
    </div>
  );
}
