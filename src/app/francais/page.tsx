"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function FrancophonieMapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);

  // 1. Charger et nettoyer les données
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
          }).sort((a, b) => b.population_totale - a.population_totale);
          
          setData(cleaned);
        }
      });
  }, []);

  // 2. Initialisation de Leaflet (Méthode OTAN)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || data.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      if (mapInstance.current) return;

      // Création de la carte
      const map = L.map(mapRef.current).setView([15, 10], 3);
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      // 3. Placement des marqueurs (Directement via lat/lng de l'API)
      data.forEach((item, i) => {
        if (item.lat && item.lng) {
          // Calcul de la taille (proportionnelle aux francophones)
          const circleSize = Math.max(20, Math.log(item.nombre_francophones + 1) * 3);

          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="
                background-color: #1d4ed8;
                color: white;
                width: ${circleSize}px;
                height: ${circleSize}px;
                border-radius: 50%;
                border: 2px solid white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: ${circleSize > 30 ? '12px' : '10px'};
                font-weight: bold;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              ">
                ${i + 1}
              </div>
            `,
            iconSize: [circleSize, circleSize],
            iconAnchor: [circleSize / 2, circleSize / 2]
          });

          const marker = L.marker([item.lat, item.lng], { icon: customIcon }).addTo(map);

          marker.bindPopup(`
            <div style="color:#1e293b; padding:4px; font-family:sans-serif; min-width:150px;">
              <div style="font-size:10px; font-weight:900; color:#64748b; text-transform:uppercase;">Rang ${i+1}</div>
              <div style="font-size:16px; font-weight:900; text-transform:uppercase; margin-bottom:4px;">${item.pays}</div>
              <div style="font-size:12px;">Population: <strong>${item.population_totale.toLocaleString()}</strong></div>
              <div style="font-size:12px; color:#2563eb;">Francophones: <strong>${item.nombre_francophones.toLocaleString()}</strong></div>
            </div>
          `);
        }
      });

      // Correctif pour le rendu dans des conteneurs dynamiques
      setTimeout(() => {
        map.invalidateSize();
        setIsReady(true);
      }, 300);
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
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
            Francophonie Mondiale
          </h1>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">
            {data.length} Pays et territoires (Tri par population totale)
          </p>
        </header>

        {/* --- CARTE LEAFLET --- */}
        <div className="relative w-full mb-10 border-8 border-white shadow-2xl rounded-3xl bg-slate-200 overflow-hidden" style={{ height: "600px" }}>
          <div ref={mapRef} className="h-full w-full z-0" />
          {!isReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 z-10">
                <Loader2 className="animate-spin text-blue-600 mb-2" />
                <p className="font-black text-slate-400 tracking-tighter">CHARGEMENT DU GLOBE...</p>
            </div>
          )}
        </div>

        {/* --- TABLEAU --- */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-widest">
                <th className="p-4 border-r border-slate-800 text-center w-20">Rang</th>
                <th className="p-4">Pays / Entité</th>
                <th className="p-4 text-right">Population Totale</th>
                <th className="p-4 text-right bg-blue-900">Francophones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item, index) => (
                <tr key={item.id} className="hover:bg-blue-50 transition-colors group">
                  <td className="p-4 text-center font-black text-slate-400 border-r border-slate-50 group-hover:text-blue-600">
                    {index + 1}
                  </td>
                  <td className="p-4 font-bold text-slate-800 uppercase text-sm">
                    {item.pays}
                  </td>
                  <td className="p-4 text-right font-mono text-sm text-slate-600">
                    {item.population_totale.toLocaleString()}
                  </td>
                  <td className="p-4 text-right font-black text-sm text-blue-700 bg-blue-50/30">
                    {item.nombre_francophones.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}