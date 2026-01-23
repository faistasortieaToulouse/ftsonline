"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { Mountain, ArrowLeft } from "lucide-react";

interface AltitudePoint {
  id: number;
  nom: string;
  altitude: number;
  description: string;
  lat: number;
  lng: number;
}

export default function AltitudesPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const [points, setPoints] = useState<AltitudePoint[]>([]);
  const [isReady, setIsReady] = useState(false);

  // 1. Chargement des données
  useEffect(() => {
    fetch("/api/altitudes")
      .then((res) => res.json())
      .then(setPoints)
      .catch((err) => console.error("Erreur API:", err));
  }, []);

  // 2. Initialisation de la carte
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

  // 3. Gestion des marqueurs
  useEffect(() => {
    if (!mapInstance.current) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    points.forEach((point) => {
      const marker = new google.maps.Marker({
        map: mapInstance.current!,
        position: { lat: point.lat, lng: point.lng },
        label: {
          text: `${point.altitude}m`,
          color: "white",
          fontSize: "10px",
          fontWeight: "bold",
        },
        title: point.nom,
      });

      const infowindow = new google.maps.InfoWindow({
        content: `
          <div style="color:#1e293b;padding:6px;">
            <strong style="font-size:14px;">${point.nom}</strong><br/>
            <div style="font-weight:bold; color:#2563eb; margin: 4px 0;"> Altitude : ${point.altitude} mètres</div>
            <p style="font-size:12px;color:#64748b;margin-top:4px;">${point.description}</p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infowindow.open(mapInstance.current, marker);
      });

      markersRef.current.push(marker);
    });
  }, [points]);

  const focusOnPoint = (point: AltitudePoint) => {
    if (!mapInstance.current) return;
    mapInstance.current.setZoom(15);
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
        <div className="bg-emerald-600 p-2 rounded-lg text-white">
          <Mountain size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Altitudes de Toulouse</h1>
          <p className="text-xs text-slate-500">Relief et topographie par quartier</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden">
        {/* TABLEAU */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border overflow-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="p-4 border-b text-xs text-slate-400 uppercase font-bold">Quartier</th>
                <th className="p-4 border-b text-xs text-slate-400 uppercase font-bold text-right">Alt.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...points].sort((a, b) => b.altitude - a.altitude).map((point) => (
                <tr
                  key={point.id}
                  onClick={() => focusOnPoint(point)}
                  className="hover:bg-emerald-50 cursor-pointer transition-colors group"
                >
                  <td className="p-4">
                    <div className="font-semibold text-slate-700">{point.nom}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">{point.description}</div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 font-mono font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      {point.altitude}m
                    </span>
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
