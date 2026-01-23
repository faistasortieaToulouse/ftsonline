"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Waves } from "lucide-react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface HydroPoint {
  id: number;
  nom: string;
  categorie: string;
  zone: string;
  lat: number | null;
  lng: number | null;
  desc: string;
}

export default function HydrographiePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const [points, setPoints] = useState<HydroPoint[]>([]);
  const [isReady, setIsReady] = useState(false);

  /* ===============================
     1. Chargement des données
     =============================== */
  useEffect(() => {
    fetch("/api/hydrographie")
      .then((res) => res.json())
      .then(setPoints)
      .catch((err) => console.error("Erreur API:", err));
  }, []);

  /* ===============================
     2. Initialisation de la carte
     =============================== */
  useEffect(() => {
    if (!isReady || !mapRef.current || mapInstance.current) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 12,
      center: { lat: 43.6045, lng: 1.4442 },
      gestureHandling: "greedy",
      styles: [
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
      ]
    });
  }, [isReady]);

  /* ===============================
     3. Marqueurs
     =============================== */
  useEffect(() => {
    if (!mapInstance.current) return;

    // Nettoyage anciens marqueurs
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    points.forEach((point) => {
      if (point.lat === null || point.lng === null) return;

      const marker = new google.maps.Marker({
        map: mapInstance.current!,
        position: { lat: point.lat, lng: point.lng },
        label: {
          text: point.id.toString(),
          color: "white",
          fontWeight: "bold",
        },
        title: point.nom,
      });

      const infowindow = new google.maps.InfoWindow({
        content: `
          <div style="color:#1e293b;padding:6px;font-family:sans-serif;">
            <strong style="font-size:14px;color:#2563eb;">${point.nom}</strong><br/>
            <div style="font-weight:bold; color:#64748b; margin: 4px 0;"> ${point.categorie} - ${point.zone}</div>
            <p style="font-size:12px;color:#334155;margin-top:4px;">${point.desc}</p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infowindow.open(mapInstance.current, marker);
      });

      markersRef.current.push(marker);
    });
  }, [points]);

  /* ===============================
     4. Focus tableau → carte
     =============================== */
  const focusOnPoint = (point: HydroPoint) => {
    if (!mapInstance.current || point.lat === null || point.lng === null) return;

    mapInstance.current.setZoom(16);
    mapInstance.current.panTo({ lat: point.lat, lng: point.lng });
  };

  return (
    <div className="flex flex-col h-screen p-4 gap-4 bg-slate-50">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <header className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <Waves size={20} />
        </div>
        <h1 className="text-xl font-bold text-slate-800">
          Hydrographie de Toulouse
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden">
        {/* TABLEAU */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border overflow-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="p-4 border-b text-xs text-slate-400 uppercase font-bold text-center">
                  #
                </th>
                <th className="p-4 border-b text-xs text-slate-400 uppercase font-bold">
                  Cours d'eau
                </th>
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
                    <div className="font-semibold text-slate-700">
                      {point.nom}
                    </div>
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
        <div className="lg:col-span-8 bg-white rounded-xl overflow-hidden shadow-sm border">
          <div ref={mapRef} className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}
