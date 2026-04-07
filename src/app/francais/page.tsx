'use client';

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, Loader2, ChevronDown, ChevronUp, Globe2, MousePointer2 } from "lucide-react";

export default function FrancophonieMapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Utilitaire pour les ancres
  const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  useEffect(() => {
    fetch("/api/francais")
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json)) {
          const cleaned = json.map(item => {
            let p = item.population_totale;
            let f = item.nombre_francophones;
            if (item.id === 49) { p = 4660000; f = 115000; }
            if (item.id === 50) { p = 515000; f = 67000; }
            const uniqueName = Array.from(new Set(item.pays.split(' '))).join(' ');
            return { ...item, pays: uniqueName, population_totale: p, nombre_francophones: f };
          })
          .sort((a, b) => b.nombre_francophones - a.nombre_francophones);
          
          setData(cleaned);
        }
      });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || data.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (mapInstance.current) return;

      const map = L.map(mapRef.current!).setView([15, 10], 3);
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      data.forEach((item, i) => {
        if (item.lat && item.lng) {
          const circleSize = Math.max(22, Math.log(item.nombre_francophones + 1) * 3.5);
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: #1d4ed8; color: white; width: ${circleSize}px; height: ${circleSize}px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: ${circleSize > 30 ? '12px' : '10px'}; font-weight: 900; box-shadow: 0 4px 12px rgba(29, 78, 216, 0.4);">${i + 1}</div>`,
            iconSize: [circleSize, circleSize],
            iconAnchor: [circleSize / 2, circleSize / 2]
          });

          const marker = L.marker([item.lat, item.lng], { icon: customIcon }).addTo(map);
          marker.bindPopup(`
            <div style="font-family: sans-serif; min-width: 160px; padding: 5px;">
              <div style="font-size: 9px; font-weight: 900; color: #1d4ed8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;">Rang Mondial #${i+1}</div>
              <strong style="font-size: 16px; color: #0f172a; display: block; text-transform: uppercase; margin-bottom: 8px; letter-spacing: -0.5px;">${item.pays}</strong>
              
              <div style="background: #f8fafc; border-radius: 8px; padding: 8px; border: 1px solid #e2e8f0; margin-bottom: 10px;">
                <div style="font-size: 11px; color: #64748b;">Pop. Totale: <b style="color: #1e293b;">${item.population_totale.toLocaleString()}</b></div>
                <div style="font-size: 11px; color: #2563eb; margin-top: 2px;">Francophones: <b style="color: #1d4ed8;">${item.nombre_francophones.toLocaleString()}</b></div>
              </div>

              <a href="#pays-${slugify(item.pays)}" style="
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
                background: #1d4ed8;
                color: white;
                text-decoration: none;
                padding: 8px;
                border-radius: 8px;
                font-size: 10px;
                font-weight: 900;
                text-transform: uppercase;
              ">Fiche détaillée ↓</a>
            </div>
          `);
        }
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
  }, [data]);

  return (
    <div className="min-h-screen bg-slate-50 p-3 md:p-8 font-sans">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-black uppercase text-[10px] tracking-[0.2em] group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Accueil
        </Link>
      </nav>
      
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter italic flex items-center gap-3">
              <Globe2 size={40} className="text-blue-600" />
              Francophonie
            </h1>
            <p className="text-slate-500 font-black text-[10px] md:text-xs uppercase tracking-[0.3em] mt-2 italic">
              Rapport mondial des locuteurs de langue française • {data.length} États
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full text-blue-700 text-[10px] font-black uppercase tracking-widest border border-blue-100">
            <MousePointer2 size={14} /> Explorer la carte interactive
          </div>
        </header>

        {/* MAP CONTAINER */}
        <div className="relative w-full mb-16 border-4 md:border-[12px] border-white shadow-2xl rounded-[2.5rem] bg-slate-200 overflow-hidden h-[400px] md:h-[650px] z-0">
          <div ref={mapRef} className="h-full w-full" />
          {!isReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/90 backdrop-blur-md z-10">
                <Loader2 className="animate-spin text-blue-600 mb-4 h-10 w-10" />
                <p className="font-black text-slate-900 tracking-[0.4em] text-[10px] uppercase">Compilation des données linguistiques...</p>
            </div>
          )}
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden mb-20">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-[0.2em]">
                <th className="p-4 md:p-6 border-r border-slate-800 text-center w-12 md:w-24">Rang</th>
                <th className="p-4 md:p-6">Pays & Territoires</th>
                <th className="p-4 md:p-6 text-right hidden md:table-cell">Population Totale</th>
                <th className="p-4 md:p-6 text-right bg-blue-700">Nombre de Francophones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item, index) => (
                <CountryRow key={item.id} item={item} index={index} slugify={slugify} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx global>{`
        .custom-marker { background: none !important; border: none !important; }
        
        .leaflet-popup-content-wrapper { 
          border-radius: 1.2rem; 
          border: 1px solid #e2e8f0; 
          background: white;
          box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.1);
        }
        .leaflet-popup-tip { background: white; border: 1px solid #e2e8f0; }
        
        .leaflet-container a.leaflet-popup-close-button {
          color: #0f172a;
          font-weight: 900;
          padding: 10px 10px 0 0;
        }

        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}

function CountryRow({ item, index, slugify }: { item: any, index: number, slugify: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <tr 
        id={`pays-${slugify(item.pays)}`} // ID POUR ANCRE
        className="hover:bg-blue-50/50 transition-all group cursor-pointer md:cursor-default scroll-mt-10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <td className="p-4 md:p-6 text-center font-black text-slate-300 border-r border-slate-50 text-xs md:text-lg group-hover:text-blue-600">
          {index + 1}
        </td>
        <td className="p-4 md:p-6 font-black text-slate-900 uppercase text-xs md:text-base leading-tight tracking-tighter italic">
          <div className="flex items-center justify-between gap-2">
            <span className="whitespace-normal break-words flex-1 min-w-0">{item.pays}</span>
            <span className="md:hidden text-slate-300 flex-shrink-0 bg-slate-50 p-1 rounded-md">
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </div>
        </td>
        <td className="p-4 md:p-6 text-right font-mono text-slate-500 hidden md:table-cell text-sm font-bold">
          {item.population_totale.toLocaleString()}
        </td>
        <td className="p-4 md:p-6 text-right font-black text-blue-700 bg-blue-50/20 text-xs md:text-lg whitespace-nowrap italic">
          {item.nombre_francophones.toLocaleString()}
        </td>
      </tr>

      {isOpen && (
        <tr className="md:hidden bg-slate-50/50">
          <td colSpan={3} className="p-4 border-b border-slate-200">
            <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Population Totale</span>
              <span className="font-mono text-slate-900 text-xs font-bold">{item.population_totale.toLocaleString()}</span>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
