"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Lac {
  id: number;
  nom: string;
  description: string;
  lat: number | null;
  lng: number | null;
  geo_shape?: any;
}

export default function LacsPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const [lacs, setLacs] = useState<Lac[]>([]);
  const [isReady, setIsReady] = useState(false);

  /* ===============================
     1. Chargement des données
     =============================== */
  useEffect(() => {
    fetch("/api/lacs")
      .then((res) => res.json())
      .then(setLacs)
      .catch((err) => console.error("Erreur API:", err));
  }, []);

  /* ===============================
     2. Initialisation de la carte
     =============================== */
  useEffect(() => {
    if (!isReady || !mapRef.current || mapInstance.current) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 13,
      center: { lat: 43.58, lng: 1.43 },
      gestureHandling: "greedy",
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

    lacs.forEach((lac) => {
      if (lac.lat === null || lac.lng === null) return;

      const marker = new google.maps.Marker({
        map: mapInstance.current!,
        position: { lat: lac.lat, lng: lac.lng },
        label: {
          text: lac.id.toString(),
          color: "white",
          fontWeight: "bold",
        },
        title: lac.nom,
      });

      const infowindow = new google.maps.InfoWindow({
        content: `
          <div style="color:#1e293b;padding:6px;">
            <strong style="font-size:14px;">${lac.nom}</strong><br/>
            <p style="font-size:12px;color:#64748b;margin-top:4px;">
              ${lac.description}
            </p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infowindow.open(mapInstance.current, marker);
      });

      markersRef.current.push(marker);
    });
  }, [lacs]);

  /* ===============================
     4. Focus tableau → carte
     =============================== */
  const focusOnLac = (lac: Lac) => {
    if (!mapInstance.current || lac.lat === null || lac.lng === null) return;

    mapInstance.current.setZoom(16);
    mapInstance.current.panTo({ lat: lac.lat, lng: lac.lng });
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
          <MapPin size={20} />
        </div>
        <h1 className="text-xl font-bold text-slate-800">
          Lacs de Toulouse
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden">
        {/* TABLEAU */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border overflow-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="p-4 border-b text-xs text-slate-400 uppercase font-bold text-center">
                  #
                </th>
                <th className="p-4 border-b text-xs text-slate-400 uppercase font-bold">
                  Lac
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {lacs.map((lac) => (
                <tr
                  key={lac.id}
                  onClick={() => focusOnLac(lac)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors group"
                >
                  <td className="p-4 text-center">
                    <span className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white font-bold text-xs transition-colors">
                      {lac.id}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-700">
                      {lac.nom}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">
                      {lac.description}
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
