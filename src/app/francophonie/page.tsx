'use client';

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, Loader2, ChevronDown, ChevronUp, Globe2, Users } from "lucide-react";

export default function FrancophoniePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);

  const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  useEffect(() => {
    fetch("/api/francophonie")
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
          }).sort((a, b) => b.nombre_francophones - a.nombre_francophones);
          setData(cleaned);
        }
      });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || data.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (mapInstance.current) return;

      const map = L.map(mapRef.current!).setView([10, 10], 2);
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      data.forEach((item, i) => {
        if (item.lat && item.lng) {
          const size = Math.max(18, Math.log(item.nombre_francophones + 1) * 3.5);
          const customIcon = L.divIcon({
            className: 'custom-marker-blue',
            html: `<div style="background-color: #2563eb; color: white; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: ${size > 25 ? '11px' : '9px'}; font-weight: 900; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);">${i + 1}</div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
          });

          const marker = L.marker([item.lat, item.lng], { icon: customIcon }).addTo(map);
          marker.bindPopup(`
            <div style="font-family: sans-serif; min-width: 160px;">
              <strong style="font-size: 14px; text-transform: uppercase;">${item.pays}</strong><br/>
              <div style="margin-top: 5px; color: #2563eb; font-weight: bold;">${item.nombre_francophones.toLocaleString()} locuteurs</div>
              <a href="#pays-${slugify(item.pays)}" style="display: block; margin-top: 8px; background: #2563eb; color: white; text-align: center; padding: 5px; border-radius: 4px; text-decoration: none; font-size: 10px; font-weight: bold;">VOIR DÉTAILS</a>
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
    <div className="min-h-screen bg-slate-50 p-4 md:p-10">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-black uppercase text-[10px] tracking-widest transition-colors">
          <ArrowLeft size={16} /> Retour Accueil
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto">
        <header className="mb-10 border-b-8 border-slate-900 pb-6">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none flex items-center gap-4 text-slate-900">
            <Globe2 size={48} className="text-blue-600" /> Espace OIF
          </h1>
          <p className="text-blue-600 font-black uppercase tracking-[0.2em] text-xs mt-3">Membres et observateurs de la francophonie</p>
        </header>

        <div className="relative w-full h-[400px] md:h-[600px] bg-slate-200 rounded-[2.5rem] mb-16 shadow-2xl border-4 border-white overflow-hidden z-0">
          <div ref={mapRef} className="h-full w-full" />
          {!isReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/90 z-10">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
              <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Chargement des données OIF...</p>
            </div>
          )}
        </div>

        <div className="overflow-hidden shadow-2xl rounded-[2rem] border border-slate-200 mb-16 bg-white">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 text-white text-[10px] uppercase tracking-widest font-black">
              <tr>
                <th className="p-4 md:p-6 text-center w-16 md:w-24 bg-blue-700 italic">Rang</th>
                <th className="p-4 md:p-6">Pays</th>
                <th className="p-6 text-right hidden md:table-cell">Population</th>
                <th className="p-4 md:p-6 text-right text-blue-400">Francophones</th>
                <th className="p-6 text-center bg-slate-800 hidden md:table-cell">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item, index) => (
                <CountryRow key={index} item={item} index={index} slugify={slugify} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style jsx global>{`
        .custom-marker-blue { background: none !important; border: none !important; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}

// LE COMPOSANT LIGNE (Assure-toi qu'il est bien FERMÉ ici)
function CountryRow({ item, index, slugify }: { item: any; index: number; slugify: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <tr 
        id={`pays-${slugify(item.pays)}`}
        className="hover:bg-blue-50/50 transition-all group cursor-pointer md:cursor-default"
        onClick={() => setIsOpen(!isOpen)}
      >
        <td className="p-4 md:p-6 text-center font-black text-slate-300 group-hover:text-blue-600 italic text-lg border-r border-slate-50">
          {index + 1}
        </td>
        <td className="p-4 md:p-6 font-black text-slate-800 uppercase italic italic tracking-tighter">
          <div className="flex items-center justify-between">
            <span>{item.pays}</span>
            <span className="md:hidden">{isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
          </div>
        </td>
        <td className="p-6 text-right font-mono text-slate-400 hidden md:table-cell font-bold">
          {item.population_totale?.toLocaleString() || "—"}
        </td>
        <td className="p-4 md:p-6 text-right font-black text-blue-600 italic text-lg">
          {item.nombre_francophones.toLocaleString()}
        </td>
        <td className="p-6 text-center font-black text-slate-900 bg-slate-50 hidden md:table-cell italic text-lg">
          {item.pourcentage}%
        </td>
      </tr>
      {isOpen && (
        <tr className="md:hidden bg-blue-50/30">
          <td colSpan={3} className="p-5 border-b border-blue-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-xl border border-slate-100">
                <span className="block text-[8px] font-black text-slate-400 uppercase mb-1">Population</span>
                <span className="font-mono text-slate-700 text-[11px]">{item.population_totale?.toLocaleString()}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100">
                <span className="block text-[8px] font-black text-slate-400 uppercase mb-1">Part</span>
                <span className="font-black text-blue-600 text-[11px]">{item.pourcentage}%</span>
              </div>
              <div className="col-span-2 bg-slate-900 p-3 rounded-xl flex justify-between items-center text-white">
                <span className="text-[10px] font-black uppercase">Statut OIF</span>
                <span className="font-black italic text-[10px] uppercase">{item.statut || "Membre"}</span>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
