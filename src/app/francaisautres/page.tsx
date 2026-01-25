"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function FrancaisAutresPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Calcul des totaux
  const totalPopulation = data.reduce((acc, curr) => acc + (curr.population_totale || 0), 0);
  const totalFrancophones = data.reduce((acc, curr) => acc + (curr.nombre_francophones || 0), 0);
  const totalExpatries = data.reduce((acc, curr) => acc + (curr.expatries_francais || 0), 0);

  // 1. Charger, nettoyer et trier les données
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

  // 2. Initialisation Leaflet (Méthode OTAN)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || data.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      if (mapInstance.current) return;

      // Création de la carte
      const map = L.map(mapRef.current).setView([20, 0], 2);
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      // 3. Placement des marqueurs (Pas de géocodage, utilise lat/lng)
      data.forEach((item, i) => {
        if (item.lat && item.lng && item.nombre_francophones > 0) {
          
          // Taille proportionnelle au nombre de francophones
          const size = Math.max(18, Math.log(item.nombre_francophones + 1) * 3.5);

          const customIcon = L.divIcon({
            className: 'custom-marker-red',
            html: `
              <div style="
                background-color: #ef4444;
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
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
              ">
                ${i + 1}
              </div>
            `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
          });

          const marker = L.marker([item.lat, item.lng], { icon: customIcon }).addTo(map);

          marker.bindPopup(`
            <div style="font-family: sans-serif; padding: 5px;">
              <strong style="text-transform: uppercase; color: #ef4444;">#${i + 1} ${item.pays}</strong><br/>
              <div style="margin-top: 5px; font-size: 12px;">
                Francophones: <b>${item.nombre_francophones.toLocaleString()}</b><br/>
                Part: <b>${item.pourcentage}%</b>
              </div>
            </div>
          `);
        }
      });

      // Correction de la taille au rendu
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
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto">
        {/* EN-TÊTE */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b-8 border-slate-900 pb-4 gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic leading-none">
              Francophones hors OIF
            </h1>
            <p className="text-red-600 font-bold uppercase tracking-widest text-sm mt-2">Zones non-membres de la francophonie officielle</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 block italic uppercase">Rapport de répartition mondiale</span>
          </div>
        </div>

        {/* CARTE */}
        <div className="relative w-full h-[500px] bg-slate-100 rounded-3xl mb-12 shadow-inner border border-slate-200 overflow-hidden z-0">
           <div ref={mapRef} className="h-full w-full" />
           {!isReady && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10">
                <Loader2 className="animate-spin text-red-600 mb-2" size={32} />
                <p className="font-black text-slate-400 tracking-tighter uppercase">Initialisation du globe...</p>
             </div>
           )}
        </div>

        {/* TABLEAU DE DÉTAILS */}
        <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2 text-slate-700">
          <span className="w-8 h-1 bg-red-600"></span> Détails par pays
        </h2>
        <div className="overflow-x-auto shadow-2xl rounded-xl border border-slate-200 mb-12">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white text-[11px] uppercase tracking-widest">
              <tr>
                <th className="p-5 text-center w-24 bg-red-700">Rang</th>
                <th className="p-5">Pays / Territoire</th>
                <th className="p-5 text-right">Population</th>
                <th className="p-5 text-right text-red-300">Francophones</th>
                <th className="p-5 text-right text-blue-300">Expatriés FR</th>
                <th className="p-5 text-center bg-slate-800">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item, index) => (
                <tr key={index} className="hover:bg-red-50/30 transition-colors group text-sm">
                  <td className="p-4 text-center font-black text-slate-300 group-hover:text-red-600 border-r border-slate-50">
                    {index + 1}
                  </td>
                  <td className="p-4 font-bold text-slate-800 uppercase italic">
                    {item.pays}
                  </td>
                  <td className="p-4 text-right font-mono text-slate-500">
                    {item.population_totale ? item.population_totale.toLocaleString() : "—"}
                  </td>
                  <td className="p-4 text-right font-black text-red-700">
                    {item.nombre_francophones.toLocaleString()}
                  </td>
                  <td className="p-4 text-right font-bold text-blue-700">
                    {item.expatries_francais ? item.expatries_francais.toLocaleString() : "—"}
                  </td>
                  <td className="p-4 text-center font-bold text-slate-900 bg-slate-50">
                    {item.pourcentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* RÉSUMÉ GLOBAL */}
        <div className="border-t-4 border-slate-100 pt-10">
            <h2 className="text-xl font-black uppercase mb-6 text-center text-slate-800 italic underline decoration-red-600 underline-offset-8">
                Synthèse cumulative hors-OIF
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-slate-900 p-8 rounded-2xl text-white shadow-xl flex flex-col items-center text-center">
                    <p className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-2">Population Globale Concernée</p>
                    <p className="text-4xl font-black">{totalPopulation.toLocaleString()}</p>
                </div>
                <div className="bg-red-600 p-8 rounded-2xl text-white shadow-xl flex flex-col items-center text-center">
                    <p className="text-red-200 uppercase text-xs font-bold tracking-widest mb-2">Masse Francophone</p>
                    <p className="text-4xl font-black">{totalFrancophones.toLocaleString()}</p>
                </div>
                <div className="bg-blue-600 p-8 rounded-2xl text-white shadow-xl flex flex-col items-center text-center">
                    <p className="text-blue-100 uppercase text-xs font-bold tracking-widest mb-2">Total Expatriés Français</p>
                    <p className="text-4xl font-black">{totalExpatries.toLocaleString()}</p>
                </div>
            </div>
            <p className="text-center text-xs text-slate-400 uppercase font-bold tracking-widest mb-10 italic">
                Rapport généré via API francaisautres
            </p>
        </div>
      </div>
    </div>
  );
}