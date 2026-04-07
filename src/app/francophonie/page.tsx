'use client';

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, Loader2, ChevronDown, ChevronUp, Languages, Target } from "lucide-react";

export default function FrancophonieGlobalePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Utilitaire pour les ancres
  const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  // Calcul des totaux
  const totalPopulation = data.reduce((acc, curr) => acc + (curr.population_totale || 0), 0);
  const totalFrancophones = data.reduce((acc, curr) => acc + (curr.nombre_francophones || 0), 0);

  useEffect(() => {
    fetch("/api/francophonie")
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json)) {
          const cleaned = json.map(item => {
            let p = item.population_totale;
            let f = item.nombre_francophones;

            if (item.id === 7) { f = 40000; }
            if (item.id === 8) { f = 100000; }
            if (item.id === 87) { p = 4660000; f = 115000; }
            if (item.id === 88) { p = 515000; f = 67000; }
            if (item.id === 86) { p = 5033000; f = 612000; }
            if (item.id === 85) { p = 2487000; f = 450000; }

            const uniqueName = Array.from(new Set(item.pays.split(' '))).join(' ');
            const pourcentage = p > 0 ? ((f / p) * 100).toFixed(1) : "0";

            return {
              ...item,
              pays: uniqueName,
              population_totale: p,
              nombre_francophones: f,
              pourcentage: pourcentage
            };
          })
          .sort((a, b) => b.population_totale - a.population_totale);

          setData(cleaned);
        }
      });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || data.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (mapInstance.current) return;

      const map = L.map(mapRef.current!).setView([20, 0], 2.5);
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      data.forEach((item, i) => {
        if (item.lat && item.lng && item.population_totale > 0) {
          const size = Math.max(18, Math.log(item.nombre_francophones + 1) * 2.5);
          const color = item.statut === "membre" ? "#2563eb" : "#059669";

          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${color}; color: white; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: ${size > 25 ? '11px' : '9px'}; font-weight: 900; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">${i + 1}</div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
          });

          const marker = L.marker([item.lat, item.lng], { icon: customIcon }).addTo(map);
          marker.bindPopup(`
            <div style="font-family: sans-serif; min-width: 140px; padding: 5px;">
              <div style="font-size: 8px; font-weight: 900; color: ${color}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;">${item.statut}</div>
              <strong style="font-size: 14px; color: #0f172a; display: block; text-transform: uppercase; margin-bottom: 4px;">${item.pays}</strong>
              <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">Taux : <b style="color: #059669;">${item.pourcentage}%</b></div>
              
              <a href="#pays-${slugify(item.pays)}" style="
                display: block;
                background: #1e293b;
                color: white;
                text-decoration: none;
                padding: 6px;
                border-radius: 6px;
                font-size: 9px;
                font-weight: 900;
                text-align: center;
                text-transform: uppercase;
              ">Voir les stats ↓</a>
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
    return () => { if (mapInstance.current) mapInstance.current.remove(); };
  }, [data]);

  return (
    <div className="min-h-screen bg-white p-4 md:p-10 font-sans">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-black uppercase text-[10px] tracking-widest group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour Accueil
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-end mb-8 border-b-8 border-slate-900 pb-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-slate-900 italic flex items-center gap-4">
              <Languages size={48} className="text-blue-600" />
              Francophonie
            </h1>
            <p className="text-blue-600 font-black uppercase tracking-[0.2em] text-xs mt-2">Observatoire Global • Tri par Population</p>
          </div>
          <div className="text-right hidden md:block">
            <span className="text-[10px] font-black text-slate-400 block italic uppercase tracking-widest">Base de données OIF / 2026</span>
          </div>
        </header>

        {/* CARTE */}
        <div className="relative w-full h-[400px] md:h-[600px] bg-slate-100 rounded-[2.5rem] mb-16 shadow-2xl border-4 border-white overflow-hidden z-0">
          <div ref={mapRef} className="h-full w-full" />
          {!isReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 backdrop-blur-sm z-10">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Synchronisation des données géopolitiques...</p>
            </div>
          )}
        </div>

        {/* TABLEAU */}
        <div className="overflow-hidden shadow-2xl rounded-[2rem] border border-slate-200 mb-12 bg-white">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 text-white text-[10px] md:text-[11px] uppercase tracking-widest font-black">
              <tr>
                <th className="p-4 md:p-6 text-center w-16 md:w-24 bg-blue-700 italic">Rang</th>
                <th className="p-4 md:p-6">Pays / Entité</th>
                <th className="p-6 text-center hidden md:table-cell">Statut</th>
                <th className="p-6 text-right hidden md:table-cell">Population Totale</th>
                <th className="p-4 md:p-6 text-right text-blue-300">Francophones</th>
                <th className="p-6 text-center bg-slate-800 hidden md:table-cell">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item, index) => (
                <FrancophonieRow key={item.id} item={item} index={index} slugify={slugify} />
              ))}
            </tbody>
          </table>
        </div>

        {/* STATS BLOCKS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-slate-400 uppercase text-[10px] font-black tracking-widest mb-4">Masse Démographique OIF</p>
              <p className="text-3xl md:text-5xl font-black italic tracking-tighter">{totalPopulation.toLocaleString()}</p>
            </div>
            <Target className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 group-hover:scale-110 transition-transform" />
          </div>
          
          <div className="bg-blue-600 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-blue-200 uppercase text-[10px] font-black tracking-widest mb-4">Locuteurs Recensés</p>
              <p className="text-3xl md:text-5xl font-black italic tracking-tighter">{totalFrancophones.toLocaleString()}</p>
            </div>
            <Languages className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:rotate-12 transition-transform" />
          </div>

          <div className="bg-emerald-600 p-8 rounded-[2rem] text-white shadow-xl text-center flex flex-col justify-center border-b-8 border-emerald-800">
            <p className="text-emerald-100 uppercase text-[10px] font-black tracking-widest mb-4">Taux de Pénétration Moyen</p>
            <p className="text-4xl md:text-6xl font-black italic">{totalPopulation > 0 ? ((totalFrancophones / totalPopulation) * 100).toFixed(1) : 0}%</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-marker { background: none !important; border: none !important; }
        .leaflet-popup-content-wrapper { border-radius: 1rem; border: 1px solid #e2e8f0; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
        .leaflet-container a.leaflet-popup-close-button { font-weight: 900; color: #000; padding: 8px 8px 0 0; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}

function FrancophonieRow({ item, index, slugify }: { item: any, index: number, slugify: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <tr 
        id={`pays-${slugify(item.pays)}`}
        className="hover:bg-blue-50/50 transition-all group text-xs md:text-sm cursor-pointer md:cursor-default scroll-mt-10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <td className="p-4 md:p-6 text-center font-black text-slate-300 group-hover:text-blue-600 border-r border-slate-50 italic text-base">
          {index + 1}
        </td>
        <td className="p-4 md:p-6 font-black text-slate-800 uppercase tracking-tighter italic text-sm md:text-base">
          <div className="flex items-center justify-between">
            <span>{item.pays}</span>
            <span className="md:hidden bg-slate-100 p-1 rounded">
              {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
          </div>
        </td>
        <td className="p-6 text-center text-[10px] font-black italic text-slate-400 uppercase hidden md:table-cell tracking-widest">
          {item.statut}
        </td>
        <td className="p-6 text-right font-mono font-bold text-slate-500 bg-slate-50/30 hidden md:table-cell">
          {item.population_totale.toLocaleString()}
        </td>
        <td className="p-4 md:p-6 text-right font-black text-blue-700 italic text-sm md:text-lg">
          {item.nombre_francophones.toLocaleString()}
        </td>
        <td className="p-6 text-center font-black text-emerald-600 bg-slate-50 hidden md:table-cell italic text-lg">
          {item.pourcentage}%
        </td>
      </tr>

      {/* Mobile Details */}
      {isOpen && (
        <tr className="md:hidden bg-blue-50/30">
          <td colSpan={3} className="p-5 border-b border-blue-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Statut</span>
                <span className="font-black text-slate-700 uppercase italic text-[10px]">{item.statut}</span>
              </div>
