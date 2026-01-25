"use client";

import { useEffect, useRef, useState } from "react";
import { Waves, ArrowLeft, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

interface HydroPoint {
  id: number;
  nom: string;
  categorie: string;
  zone: string;
  lat: number | null;
  lng: number | null;
  desc: string;
}

const TOULOUSE_CENTER: [number, number] = [43.6045, 1.4442];

export default function HydrographiePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);

  const [points, setPoints] = useState<HydroPoint[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  /* ===============================
     1. Chargement des données
     =============================== */
  useEffect(() => {
    fetch("/api/hydrographie")
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

  /* ===============================
     2. Initialisation de Leaflet (OTAN)
     =============================== */
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData || points.length === 0) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      if (mapInstance.current) return;

      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView(TOULOUSE_CENTER, 13);

      mapInstance.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Ajout des marqueurs
      points.forEach((point) => {
        if (point.lat === null || point.lng === null) return;

        const customIcon = L.divIcon({
          className: "custom-div-icon",
          html: `
            <div style="
              background-color: #2563eb;
              color: white;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              border: 2px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 11px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            ">
              ${point.id}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([point.lat, point.lng], { icon: customIcon }).addTo(map);

        marker.bindPopup(`
          <div style="color:#1e293b;padding:2px;font-family:sans-serif;min-width:180px;">
            <strong style="font-size:14px;color:#2563eb;">${point.nom}</strong><br/>
            <div style="font-weight:bold; color:#64748b; margin: 4px 0; font-size:11px;"> 
              ${point.categorie} - ${point.zone}
            </div>
            <p style="font-size:12px;color:#334155;margin-top:4px;line-height:1.4;">${point.desc}</p>
          </div>
        `);
      });

      // Correction de la taille au rendu
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
  }, [isLoadingData, points]);

  /* ===============================
     3. Focus tableau → carte
     =============================== */
  const focusOnPoint = (point: HydroPoint) => {
    if (!mapInstance.current || point.lat === null || point.lng === null) return;

    mapInstance.current.setView([point.lat, point.lng], 16, {
      animate: true,
      duration: 1,
    });
  };

  return (
    <div className="flex flex-col h-screen p-4 gap-4 bg-slate-50">
      <nav>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Retour à l'accueil
        </Link>
      </nav>

      <header className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <Waves size={20} />
        </div>
        <h1 className="text-xl font-bold text-slate-800">Hydrographie de Toulouse</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden">
        {/* TABLEAU (Mise en page conservée) */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border overflow-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="p-4 border-b text-xs text-slate-400 uppercase font-bold text-center">#</th>
                <th className="p-4 border-b text-xs text-slate-400 uppercase font-bold">Cours d'eau</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {points.map((point) => (
                <tr
                  key={point.id}
                  onClick={() => focusOnPoint(point)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors group"
                >
                  <td className="p-4 text-center">
                    <span className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white font-bold text-xs transition-colors">
                      {point.id}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-700">{point.nom}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">
                      {point.categorie} — {point.zone}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CARTE */}
        <div className="lg:col-span-8 bg-white rounded-xl overflow-hidden shadow-sm border relative">
          <div ref={mapRef} className="h-full w-full z-0" />
          {!isReady && (
            <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center z-10">
              <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
              <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">
                Chargement de la carte...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}