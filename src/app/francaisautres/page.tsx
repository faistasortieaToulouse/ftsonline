"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, Loader2, ChevronDown, ChevronUp } from "lucide-react";

export default function FrancaisAutresPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);

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

      const map = L.map(mapRef.current).setView([20, 0], 2);
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      data.forEach((item, i) => {
        if (item.lat && item.lng && item.nombre_francophones > 0) {
          const size = Math.max(18, Math.log(item.nombre_francophones + 1) * 3.5);
          const customIcon = L.divIcon({
            className: 'custom-marker-red',
            html: `<div style="background-color: #ef4444; color: white; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: ${size > 25 ? '11px' : '9px'}; font-weight: bold; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">${i + 1}</div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
          });

          const marker = L.marker([item.lat, item.lng], { icon: customIcon }).addTo(map);
          marker.bindPopup(`<strong>#${i + 1} ${item.pays}</strong><br/>Francophones: ${item.nombre_francophones.toLocaleString()}`);
        }
      });

      setTimeout(() => {
        map.invalidateSize();
        setIsReady(true);
      }, 400);
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
    <div className="min-h-screen bg-white p-4 md:p-10 font-sans text-slate-900">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1" /> Retour à l'accueil
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b-8 border-slate-900 pb-4 gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic leading-none">Francophones hors OIF</h1>
            <p className="text-red-600 font-bold uppercase tracking-widest text-sm mt-2">Zones non-membres officielles</p>
          </div>
        </header>

        <div className="relative w-full h-[400px] md:h-[500px] bg-slate-100 rounded-3xl mb-12 shadow-inner border border-slate-200 overflow-hidden z-0">
          <div ref={mapRef} className="h-full w-full" />
          {!isReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10">
              <Loader2 className="animate-spin text-red-600 mb-2" size={32} />
              <p className="font-black text-slate-400 uppercase">Initialisation...</p>
            </div>
          )}
        </div>

        <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2 text-slate-700">
          <span className="w-8 h-1 bg-red-600"></span> Détails par pays
        </h2>

        <div className="overflow-hidden shadow-2xl rounded-xl border border-slate-200 mb-12 bg-white">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 text-white text-[10px] md:text-[11px] uppercase tracking-widest">
              <tr>
                <th className="p-3 md:p-5 text-center w-16 md:w-24 bg-red-700">Rang</th>
                <th className="p-3 md:p-5">Pays / Territoire</th>
                <th className="p-5 text-right hidden md:table-cell">Population</th>
                <th className="p-3 md:p-5 text-right text-red-300">Francophones</th>
                <th className="p-5 text-right text-blue-300 hidden md:table-cell">Expatriés FR</th>
                <th className="p-5 text-center bg-slate-800 hidden md:table-cell">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item, index) => (
                <OtherCountryRow key={index} item={item} index={index} />
              ))}
            </tbody>
          </table>
        </div>

        {/* RÉSUMÉ GLOBAL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl text-center">
            <p className="text-slate-400 uppercase text-[10px] font-bold mb-2">Population Globale</p>
            <p className="text-2xl font-black">{totalPopulation.toLocaleString()}</p>
          </div>
          <div className="bg-red-600 p-6 rounded-2xl text-white shadow-xl text-center">
            <p className="text-red-200 uppercase text-[10px] font-bold mb-2">Masse Francophone</p>
            <p className="text-2xl font-black">{totalFrancophones.toLocaleString()}</p>
          </div>
          <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-xl text-center">
            <p className="text-blue-100 uppercase text-[10px] font-bold mb-2">Total Expatriés</p>
            <p className="text-2xl font-black">{totalExpatries.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function OtherCountryRow({ item, index }: { item: any; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <tr 
        className="hover:bg-red-50/30 transition-colors group text-xs md:text-sm cursor-pointer md:cursor-default"
        onClick={() => setIsOpen(!isOpen)}
      >
        <td className="p-3 md:p-4 text-center font-black text-slate-300 group-hover:text-red-600 border-r border-slate-50">
          {index + 1}
        </td>
        <td className="p-3 md:p-4 font-bold text-slate-800 uppercase italic">
          <div className="flex items-center justify-between">
            <span>{item.pays}</span>
            <span className="md:hidden">
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </div>
        </td>
        <td className="p-4 text-right font-mono text-slate-500 hidden md:table-cell">
          {item.population_totale ? item.population_totale.toLocaleString() : "—"}
        </td>
        <td className="p-3 md:p-4 text-right font-black text-red-700">
          {item.nombre_francophones.toLocaleString()}
        </td>
        <td className="p-4 text-right font-bold text-blue-700 hidden md:table-cell">
          {item.expatries_francais ? item.expatries_francais.toLocaleString() : "—"}
        </td>
        <td className="p-4 text-center font-bold text-slate-900 bg-slate-50 hidden md:table-cell">
          {item.pourcentage}%
        </td>
      </tr>

      {/* Accordéon Mobile */}
      {isOpen && (
        <tr className="md:hidden bg-slate-50">
          <td colSpan={3} className="p-4 border-b border-slate-200">
            <div className="grid grid-cols-2 gap-4 text-[11px]">
              <div>
                <span className="block font-black text-slate-400 uppercase tracking-tighter">Population</span>
                <span className="font-mono text-slate-700">{item.population_totale?.toLocaleString() || "—"}</span>
              </div>
              <div>
                <span className="block font-black text-slate-400 uppercase tracking-tighter">Expatriés FR</span>
                <span className="font-bold text-blue-700">{item.expatries_francais?.toLocaleString() || "—"}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="font-black text-slate-400 uppercase tracking-tighter">Part de francophones</span>
                <span className="bg-slate-900 text-white px-2 py-0.5 rounded font-bold">{item.pourcentage}%</span>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}