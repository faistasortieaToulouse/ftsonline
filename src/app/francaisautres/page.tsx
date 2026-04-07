'use client';

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, Loader2, ChevronDown, ChevronUp, Globe, Users2 } from "lucide-react";

export default function FrancaisAutresPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Utilitaire pour les ancres
  const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  const totalPopulation = data.reduce((acc, curr) => acc + (curr.population_totale || 0), 0);
  const totalFrancophones = data.reduce((acc, curr) => acc + (curr.nombre_francophones || 0), 0);
  const totalExpatries = data.reduce((acc, curr) => acc + (curr.expatries_francais || 0), 0);

  useEffect(() => {
    fetch("/api/francaisautres")
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json)) {
          const cleaned = json.map((item) => {
            const p = item.population_totale || 0;
            const f = item.nombre_francophones || 0;
            const calculPourcentage = p > 0 ? ((f / p) * 100).toFixed(2) : "0";

            return {
              ...item,
              pourcentage: item.pourcentage ? item.pourcentage.replace('%', '').trim() : calculPourcentage
            };
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

      const map = L.map(mapRef.current!).setView([20, 0], 2);
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      data.forEach((item, i) => {
        if (item.lat && item.lng && item.nombre_francophones > 0) {
          const size = Math.max(18, Math.log(item.nombre_francophones + 1) * 3.5);
          const customIcon = L.divIcon({
            className: 'custom-marker-red',
            html: `<div style="background-color: #ef4444; color: white; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: ${size > 25 ? '11px' : '9px'}; font-weight: 900; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);">${i + 1}</div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
          });

          const marker = L.marker([item.lat, item.lng], { icon: customIcon }).addTo(map);
          marker.bindPopup(`
            <div style="font-family: sans-serif; min-width: 150px; padding: 5px;">
              <div style="font-size: 9px; font-weight: 900; color: #ef4444; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;">Rang #${i+1}</div>
              <strong style="font-size: 15px; color: #0f172a; display: block; text-transform: uppercase; margin-bottom: 8px;">${item.pays}</strong>
              
              <div style="background: #fff1f2; border-radius: 8px; padding: 8px; border: 1px solid #fecdd3; margin-bottom: 10px;">
                <div style="font-size: 11px; color: #991b1b;">Francophones: <b>${item.nombre_francophones.toLocaleString()}</b></div>
                <div style="font-size: 11px; color: #0f172a; margin-top: 2px;">Taux: <b>${item.pourcentage}%</b></div>
              </div>

              <a href="#pays-${slugify(item.pays)}" style="
                display: block;
                background: #ef4444;
                color: white;
                text-decoration: none;
                padding: 6px;
                border-radius: 6px;
                font-size: 9px;
                font-weight: 900;
                text-align: center;
                text-transform: uppercase;
              ">Consulter les détails ↓</a>
            </div>
          `);
        }
      });

      setTimeout(() => {
        if (mapInstance.current) {
          mapInstance.current.invalidateSize();
          setIsReady(true);
        }
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
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans text-slate-900">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-red-600 font-black uppercase text-[10px] tracking-widest group transition-colors">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour Accueil
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b-8 border-slate-900 pb-6 gap-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none flex items-center gap-4">
              <Globe size={48} className="text-red-600" />
              Hors OIF
            </h1>
            <p className="text-red-600 font-black uppercase tracking-[0.2em] text-xs mt-3">Espaces linguistiques hors cadre officiel</p>
          </div>
          <div className="hidden md:block text-right">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Données consolidées 2026</p>
          </div>
        </header>

        {/* MAP CONTAINER */}
        <div className="relative w-full h-[400px] md:h-[600px] bg-slate-200 rounded-[2.5rem] mb-16 shadow-2xl border-4 border-white overflow-hidden z-0">
          <div ref={mapRef} className="h-full w-full" />
          {!isReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/90 backdrop-blur-sm z-10">
              <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
              <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Cartographie des zones non-membres...</p>
            </div>
          )}
        </div>

        <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3 text-slate-900 italic">
          <span className="w-12 h-2 bg-red-600"></span> 
          Analyse Détaillée
        </h2>

        {/* TABLEAU */}
        <div className="overflow-hidden shadow-2xl rounded-[2rem] border border-slate-200 mb-16 bg-white">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 text-white text-[10px] md:text-[11px] uppercase tracking-widest font-black">
              <tr>
                <th className="p-4 md:p-6 text-center w-16 md:w-24 bg-red-700 italic">Rang</th>
                <th className="p-4 md:p-6">Pays / Territoire</th>
                <th className="p-6 text-right hidden md:table-cell">Population</th>
                <th className="p-4 md:p-6 text-right text-red-400">Francophones</th>
                <th className="p-6 text-right text-blue-400 hidden md:table-cell">Expatriés FR</th>
                <th className="p-6 text-center bg-slate-800 hidden md:table-cell">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item, index) => (
                <OtherCountryRow key={index} item={item} index={index} slugify={slugify} />
              ))}
            </tbody>
          </table>
        </div>

        {/* RÉSUMÉ GLOBAL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl flex flex-col items-center justify-center text-center">
            <p className="text-slate-400 uppercase text-[10px] font-black tracking-widest mb-3">Population Globale Concernée</p>
            <p className="text-3xl font-black italic tracking-tighter">{totalPopulation.toLocaleString()}</p>
          </div>
          <div className="bg-red-600 p-8 rounded-[2rem] text-white shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
            <Users2 className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10" />
            <p className="text-red-200 uppercase text-[10px] font-black tracking-widest mb-3 relative z-10">Total Francophones hors-cadre</p>
            <p className="text-3xl font-black italic tracking-tighter relative z-10">{totalFrancophones.toLocaleString()}</p>
          </div>
          <div className="bg-blue-600 p-8 rounded-[2rem] text-white shadow-xl flex flex-col items-center justify-center text-center">
            <p className="text-blue-200 uppercase text-[10px] font-black tracking-widest mb-3">Communauté Expatriée FR</p>
            <p className="text-3xl font-black italic tracking-tighter">{totalExpatries.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-marker-red { background: none !important; border: none !important; }
        .leaflet-popup-content-wrapper { border-radius: 1.2rem; border: 1px solid #fee2e2; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}

function OtherCountryRow({ item, index, slugify }: { item: any; index: number; slugify: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <tr 
        id={`pays-${slugify(item.pays)}`}
        className="hover:bg-red-50/50 transition-all group text-xs md:text-sm cursor-pointer md:cursor-default scroll-mt-10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <td className="p-4 md:p-6 text-center font-black text-slate-300 group-hover:text-red-600 border-r border-slate-50 italic text-base">
          {index + 1}
        </td>
        <td className="p-4 md:p-6 font-black text-slate-800 uppercase italic tracking-tighter text-sm md:text-base">
          <div className="flex items-center justify-between">
            <span>{item.pays}</span>
            <span className="md:hidden bg-slate-100 p-1 rounded">
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </div>
        </td>
        <td className="p-6 text-right font-mono text-slate-400 hidden md:table-cell font-bold">
          {item.population_totale ? item.population_totale.toLocaleString() : "—"}
        </td>
        <td className="p-4 md:p-6 text-right font-black text-red-600 italic text-sm md:text-lg">
          {item.nombre_francophones.toLocaleString()}
        </td>
        <td className="p-6 text-right font-bold text-blue-600 hidden md:table-cell">
          {item.expatries_francais ? item.expatries_francais.toLocaleString() : "—"}
        </td>
        <td className="p-6 text-center font-black text-slate-900 bg-slate-50 hidden md:table-cell italic text-lg">
          {item.pourcentage}%
        </td>
      </tr>

      {/* Accordéon Mobile */}
      {isOpen && (
        <tr className="md:hidden bg-red-50/30">
          <td colSpan={3} className="p-5 border-b border-red-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-xl border border-slate-100">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Population</span>
                <span className="font-mono text-slate-700 text-[11px]">{item.population_totale?.toLocaleString() || "—"}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Expatriés FR</span>
                <span className="font-black text-blue-600 text-[11px]">{item.expatries_francais?.toLocaleString() || "—"}</span>
              </div>
              <div className="col-span-2 bg-slate-900 p-3 rounded-xl flex justify-between items-center shadow-lg">
                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Part de francophones</span>
                <span className="text-white font-black italic text-sm">{item.pourcentage}%</span>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
