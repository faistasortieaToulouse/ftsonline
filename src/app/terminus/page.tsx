"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp, MapPin, Calendar, Hash, Loader2, Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface Terminus {
  geo_point: { lon: number; lat: number };
  geo_shape: { type: string; geometry: { coordinates: [number, number]; type: string }; properties: {} };
  annee_reference: string;
  ref: string;
  nom: string;
  x_wgs84: number;
  y_wgs84: number;
}

export default function TerminusPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  
  const [terminus, setTerminus] = useState<Terminus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    fetch("/api/terminus")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a: Terminus, b: Terminus) => {
          const nameCompare = (a.nom ?? "").localeCompare(b.nom ?? "");
          if (nameCompare !== 0) return nameCompare;
          const aYear = a.annee_reference === "SPECIAL" ? Infinity : parseInt(a.annee_reference);
          const bYear = b.annee_reference === "SPECIAL" ? Infinity : parseInt(b.annee_reference);
          return aYear - bYear;
        });
        setTerminus(sorted);
        setIsLoading(false);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoading) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      if (mapInstance.current) return;

      const map = L.map(mapRef.current!).setView([43.6045, 1.444], 12);
      mapInstance.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap',
      }).addTo(map);

      // FIX : Force le rendu pour éviter les tuiles manquantes
      setTimeout(() => {
        map.invalidateSize();
        setIsMapReady(true);
      }, 500);

      terminus.forEach((t, index) => {
        const key = `${t.ref}-${t.annee_reference}-${index}`;
        const customIcon = L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color: #7c3aed; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; border: 3px solid white; font-size: 11px; box-shadow: 0 4px 10px rgba(124, 58, 237, 0.3);">${index + 1}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
          popupAnchor: [0, -15]
        });

        const marker = L.marker([t.geo_point.lat, t.geo_point.lon], { icon: customIcon })
          .bindPopup(`
            <div style="font-family: sans-serif; text-align: center; padding: 5px;">
              <div style="font-size: 9px; color: #7c3aed; font-weight: 900; text-transform: uppercase;">Terminus #${index + 1}</div>
              <strong style="font-size: 14px; display: block; margin: 4px 0; color: #1e293b;">${t.nom}</strong>
              <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">Réf: ${t.ref} • ${t.annee_reference}</div>
              <button onclick="window.scrollTo({top: 800, behavior: 'smooth'})" style="background: #7c3aed; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer;">VOIR FICHE ↓</button>
            </div>
          `)
          .addTo(map);

        markersRef.current.set(key, marker);
      });
    };

    initMap();
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [terminus, isLoading]);

  const handleRowClick = (t: Terminus, index: number) => {
    const key = `${t.ref}-${t.annee_reference}-${index}`;
    const marker = markersRef.current.get(key);
    if (mapInstance.current && marker) {
      mapInstance.current.flyTo(marker.getLatLng(), 15, { duration: 1.5 });
      marker.openPopup();
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <nav className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-900 font-black uppercase text-[10px] tracking-widest transition-all group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            Portail Toulouse
          </Link>
        </nav>

        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
              Réseau <span className="text-purple-600">Terminus</span>
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Inventaire des points de retournement Tisséo</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
             <Navigation size={20} className="text-purple-600" />
             <span className="text-sm font-black text-slate-700 uppercase tracking-tighter">{terminus.length} Stations répertoriées</span>
          </div>
        </header>

        {/* CARTE */}
        <div className="relative group mb-10">
          <div
            ref={mapRef}
            className="h-[45vh] md:h-[60vh] w-full border-4 border-white shadow-2xl rounded-[2.5rem] bg-slate-200 z-0 overflow-hidden relative" 
          />
          {(!isMapReady || isLoading) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/80 rounded-[2.5rem] z-10 backdrop-blur-sm">
               <Loader2 className="animate-spin text-purple-600 mb-2" size={32} />
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Initialisation de la carte...</p>
            </div>
          )}
        </div>

        {/* TABLEAU / LISTE */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-left text-[10px] uppercase font-black tracking-widest">
                <th className="p-5 w-16 text-center">#</th>
                <th className="p-5">Nom du Terminus</th>
                <th className="p-5 text-center hidden md:table-cell">Période Référence</th>
                <th className="p-5 hidden md:table-cell">Référence Technique</th>
                <th className="p-5 md:hidden">Infos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {terminus.map((t, index) => (
                <TerminusRow 
                  key={`${t.ref}-${t.annee_reference}-${index}`} 
                  t={t} 
                  index={index} 
                  onClick={() => handleRowClick(t, index)} 
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style jsx global>{`
        .custom-div-icon { background: none !important; border: none !important; }
        .leaflet-popup-content-wrapper { border-radius: 1.5rem; border: 3px solid #7c3aed; }
        .leaflet-popup-tip { background: #7c3aed; }
      `}</style>
    </div>
  );
}

function TerminusRow({ t, index, onClick }: { t: Terminus; index: number; onClick: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <tr
        className="hover:bg-purple-50 cursor-pointer transition-all border-b border-slate-50 group"
        onClick={() => {
          setIsOpen(!isOpen);
          onClick();
        }}
      >
        <td className="p-5 text-center">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-400 font-black text-[10px] group-hover:bg-purple-600 group-hover:text-white transition-all">
            {index + 1}
          </span>
        </td>
        <td className="p-5">
          <div className="font-black text-slate-800 uppercase tracking-tighter text-sm group-hover:text-purple-700 transition-colors">
            {t.nom}
          </div>
        </td>
        <td className="p-5 text-center hidden md:table-cell">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600">
            <Calendar size={12} className="text-purple-500" /> {t.annee_reference}
          </div>
        </td>
        <td className="p-5 hidden md:table-cell">
          <div className="flex items-center gap-2 text-slate-400 italic text-xs">
            <Hash size={12} /> {t.ref}
          </div>
        </td>
        <td className="p-5 md:hidden text-right">
          <div className="text-purple-400">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </td>
      </tr>

      {/* Accordéon Mobile Style Card */}
      {isOpen && (
        <tr className="md:hidden">
          <td colSpan={3} className="p-4 bg-purple-50/30">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-2xl border border-purple-100 shadow-sm">
                <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1">Période</p>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Calendar size={14} className="text-purple-500" /> {t.annee_reference}
                </div>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-purple-100 shadow-sm">
                <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1">Code Réf</p>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Hash size={14} className="text-purple-500" /> {t.ref}
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                className="col-span-2 bg-purple-600 text-white p-3 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2"
              >
                <MapPin size={14} /> Voir sur la carte
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
