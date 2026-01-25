"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function FrancophonieGlobalePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Calcul des totaux
  const totalPopulation = data.reduce((acc, curr) => acc + (curr.population_totale || 0), 0);
  const totalFrancophones = data.reduce((acc, curr) => acc + (curr.nombre_francophones || 0), 0);

  // 1. Chargement et nettoyage des données
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

  // 2. Initialisation Leaflet (Méthode OTAN)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || data.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      if (mapInstance.current) return;

      const map = L.map(mapRef.current).setView([20, 0], 2.5);
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      // 3. Placement des marqueurs (Directement via lat/lng)
      data.forEach((item, i) => {
        if (item.lat && item.lng && item.population_totale > 0) {
          const size = Math.max(18, Math.log(item.nombre_francophones + 1) * 2.5);
          const color = item.statut === "membre" ? "#2563eb" : "#059669";

          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="
                background-color: ${color};
                color: white;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                border: 2px solid white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: ${size > 25 ? '11px' : '9px'};
                font-weight: bold;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
              ">
                ${i + 1}
              </div>
            `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
          });

          const marker = L.marker([item.lat, item.lng], { icon: customIcon }).addTo(map);

          marker.bindPopup(`
            <div style="font-family:sans-serif; padding:5px;">
              <strong style="text-transform:uppercase;">${item.pays}</strong><br/>
              <span style="font-size:11px; color:#64748b;">Statut: ${item.statut}</span><br/>
              <div style="margin-top:5px; font-size:12px;">
                Pop: <b>${item.population_totale.toLocaleString()}</b><br/>
                Francophones: <b style="color:#2563eb;">${item.nombre_francophones.toLocaleString()}</b><br/>
                Taux: <b>${item.pourcentage}%</b>
              </div>
            </div>
          `);
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
    <div className="min-h-screen bg-white p-4 md:p-10 font-sans">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto">
        {/* EN-TÊTE */}
        <div className="flex justify-between items-end mb-8 border-b-8 border-slate-900 pb-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-slate-900">Francophonie</h1>
            <p className="text-blue-600 font-bold uppercase tracking-widest text-sm">Espace Global (Tri Population)</p>
          </div>
          <div className="text-right hidden md:block">
            <span className="text-xs font-bold text-slate-400 block italic uppercase">Source : OIF / 2024-2026</span>
          </div>
        </div>

        {/* CARTE */}
        <div className="relative w-full h-[550px] bg-slate-100 rounded-3xl mb-12 shadow-inner border border-slate-200 overflow-hidden z-0">
          <div ref={mapRef} className="h-full w-full" />
          {!isReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10">
                <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                <p className="font-black text-slate-400 uppercase tracking-tighter">Initialisation du globe...</p>
            </div>
          )}
        </div>

        {/* TABLEAU */}
        <div className="overflow-x-auto shadow-2xl rounded-xl border border-slate-200 mb-10">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white text-[11px] uppercase tracking-widest">
              <tr>
                <th className="p-5 text-center w-24 bg-blue-700">Rang</th>
                <th className="p-5">Pays / Entité</th>
                <th className="p-5 text-center">Statut</th>
                <th className="p-5 text-right">Population Totale</th>
                <th className="p-5 text-right text-blue-300">Francophones</th>
                <th className="p-5 text-center bg-slate-800">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group text-sm">
                  <td className="p-4 text-center font-black text-slate-300 group-hover:text-blue-600 border-r border-slate-50">
                    {index + 1}
                  </td>
                  <td className="p-4 font-bold text-slate-800 uppercase">
                    {item.pays}
                  </td>
                  <td className="p-4 text-center text-[10px] font-black italic text-slate-400 uppercase">
                    {item.statut}
                  </td>
                  <td className="p-4 text-right font-mono text-slate-600 bg-slate-50/50">
                    {item.population_totale.toLocaleString()}
                  </td>
                  <td className="p-4 text-right font-black text-blue-700">
                    {item.nombre_francophones.toLocaleString()}
                  </td>
                  <td className="p-4 text-center font-bold text-emerald-600 bg-slate-50">
                    {item.pourcentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* RÉSUMÉ GLOBAL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900 p-8 rounded-2xl text-white shadow-xl text-center">
            <p className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-2">Population Totale OIF</p>
            <p className="text-3xl md:text-4xl font-black">{totalPopulation.toLocaleString()}</p>
          </div>
          <div className="bg-blue-600 p-8 rounded-2xl text-white shadow-xl text-center">
            <p className="text-blue-200 uppercase text-xs font-bold tracking-widest mb-2">Total Francophones</p>
            <p className="text-3xl md:text-4xl font-black">{totalFrancophones.toLocaleString()}</p>
          </div>
          <div className="bg-emerald-600 p-8 rounded-2xl text-white shadow-xl text-center">
            <p className="text-emerald-100 uppercase text-xs font-bold tracking-widest mb-2">Taux Moyen Global</p>
            <p className="text-3xl md:text-4xl font-black">
              {totalPopulation > 0 ? ((totalFrancophones / totalPopulation) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}