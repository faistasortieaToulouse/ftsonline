'use client';

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface Departement {
  nom: string;
  pays: string;
  statut: string;
  lat: number;
  lng: number;
  description: string;
  date_debut: number;
  date_fin: number;
}

export default function AnciensDepartementsPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  const [departements, setDepartements] = useState<Departement[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetch("/api/anciensdepartements")
      .then(async (res) => {
        const data = await res.json();
        if (Array.isArray(data)) {
          // Tri alphabétique par NOM du département
          const sorted = data.sort((a, b) => 
            a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' })
          );
          setDepartements(sorted);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!isReady || !mapRef.current || departements.length === 0) return;

    // Centrage initial sur la Méditerranée pour voir Italie et Algérie
    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 4,
      center: { lat: 42.0, lng: 12.0 }, 
      scrollwheel: true,
      gestureHandling: "greedy",
      mapTypeId: 'terrain'
    });

    departements.forEach((d, index) => {
      const marker = new google.maps.Marker({
        map: mapInstance.current!,
        position: { lat: d.lat, lng: d.lng },
        title: d.nom,
        label: {
          text: (index + 1).toString(),
          color: "white",
          fontSize: "10px",
          fontWeight: "bold"
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#002395", // Bleu de France
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff",
        }
      });

      const infowindow = new google.maps.InfoWindow({
        content: `
          <div style="color: black; padding: 5px; font-family: sans-serif; max-width: 220px;">
            <strong style="font-size: 14px;">#${index + 1} - ${d.nom}</strong><br>
            <span style="color: #002395; font-size: 11px; font-weight: bold;">${d.pays.toUpperCase()}</span><br>
            <span style="color: #b91c1c; font-size: 10px; font-weight: bold;">${d.date_debut} — ${d.date_fin}</span><br>
            <p style="margin-top:8px; font-size: 12px; line-height: 1.4; color: #333;">${d.description}</p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infowindow.open(mapInstance.current, marker);
      });
    });
  }, [isReady, departements]);

  return (
    <div className="p-4 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <header className="mb-8 border-b pb-6 text-center">
        <h1 className="text-4xl font-black text-blue-900 uppercase tracking-tighter">
          Anciens Départements Français
        </h1>
        <p className="text-gray-600 mt-2 italic">Hors frontières actuelles : Europe Napoléonienne et Algérie Française</p>
      </header>

      <div
        ref={mapRef}
        style={{ height: "60vh", width: "100%" }}
        className="mb-8 border-4 border-white shadow-2xl rounded-3xl bg-slate-200 overflow-hidden"
      >
        {!isReady && (
          <div className="flex items-center justify-center h-full bg-slate-100">
            <p className="animate-pulse font-bold text-blue-600">Chargement de la cartographie historique...</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departements.map((d, index) => (
          <div key={d.nom} className="group p-5 bg-white rounded-2xl shadow-sm border border-slate-200 hover:bg-blue-900 transition-all duration-300 flex gap-4">
            <span className="text-3xl font-black text-slate-200 group-hover:text-blue-400/30 transition-colors">
              {(index + 1).toString().padStart(2, '0')}
            </span>
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-white transition-colors leading-tight">
                {d.nom}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 group-hover:bg-blue-800 group-hover:text-blue-100 transition-colors">
                  {d.pays}
                </span>
                <span className="text-xs font-bold text-red-600 group-hover:text-red-300">
                  {d.date_debut} — {d.date_fin}
                </span>
              </div>
              <p className="text-sm text-gray-600 group-hover:text-blue-50 mt-3 leading-snug">
                {d.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}