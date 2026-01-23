"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Library, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface CulturePoint {
  id: number;
  nom: string;
  adresse: string;
  telephone: string;
  gestionnaire: string;
  siteWeb: string;
  lat: number | null;
  lng: number | null;
  quartier: string;
}

export default function EcoleCulturePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const [points, setPoints] = useState<CulturePoint[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetch("/api/ecoleculture")
      .then((res) => res.json())
      .then(setPoints)
      .catch((err) => console.error("Erreur API:", err));
  }, []);

  useEffect(() => {
    if (!isReady || !mapRef.current || mapInstance.current) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 13,
      center: { lat: 43.6045, lng: 1.4442 },
      styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
    });
  }, [isReady]);

  useEffect(() => {
    if (!mapInstance.current) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    points.forEach((point) => {
      if (point.lat === null || point.lng === null) return;

      const marker = new google.maps.Marker({
        map: mapInstance.current!,
        position: { lat: point.lat, lng: point.lng },
        // Ajout du numéro sur le marqueur
        label: {
          text: point.id.toString(),
          color: "white",
          fontWeight: "bold",
          fontSize: "12px"
        },
        title: point.nom,
      });

      const infowindow = new google.maps.InfoWindow({
        content: `
          <div style="color:#1e293b;padding:8px;font-family:sans-serif;max-width:200px;">
            <div style="font-size:10px; font-weight:bold; color:#6366f1;">#${point.id} - ${point.quartier}</div>
            <strong style="font-size:14px;color:#1e293b;display:block;margin-bottom:4px;">${point.nom}</strong>
            <div style="color:#64748b; font-size:12px; margin-bottom:4px;">${point.adresse}</div>
            <div style="font-size:12px; font-weight:bold;">Tel: ${point.telephone}</div>
          </div>
        `,
      });

      marker.addListener("click", () => infowindow.open(mapInstance.current, marker));
      markersRef.current.push(marker);
    });
  }, [points]);

  const focusOnPoint = (point: CulturePoint) => {
    if (!mapInstance.current || point.lat === null || point.lng === null) return;
    mapInstance.current.setZoom(17);
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
        <div className="bg-indigo-600 p-2 rounded-lg text-white">
          <Library size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 leading-none">Toulouse Culture</h1>
          <p className="text-xs text-slate-500 mt-1">Écoles et lieux d'enseignement</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden">
        {/* LISTE TRIÉE PAR QUARTIER */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="p-4 border-b text-[10px] text-slate-400 uppercase font-black w-16 text-center">N°</th>
                <th className="p-4 border-b text-[10px] text-slate-400 uppercase font-black">Établissement / Quartier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {points.map((point) => (
                <tr
                  key={point.id}
                  onClick={() => focusOnPoint(point)}
                  className="hover:bg-indigo-50/50 cursor-pointer transition-colors group"
                >
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors border border-slate-200">
                      {point.id}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-800 text-sm">{point.nom}</div>
                    <div className="flex items-center gap-1 text-[11px] text-indigo-500 font-medium mt-0.5">
                      <MapPin size={10} /> {point.quartier}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CARTE */}
        <div className="lg:col-span-8 bg-white rounded-xl overflow-hidden shadow-sm border relative">
          <div ref={mapRef} className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}
