'use client';

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface Territoire {
  nom: string;
  statut: string;
  continent: string;
  lat: number;
  lng: number;
  description: string;
  date_debut: number;
  date_fin: number;
}

export default function ColonieEuropePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  const [territoires, setTerritoires] = useState<Territoire[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetch("/api/colonieeurope")
      .then(async (res) => {
        const data = await res.json();
        if (Array.isArray(data)) {
          // Tri alphabétique par NOM
          const sorted = data.sort((a, b) => 
            a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' })
          );
          setTerritoires(sorted);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!isReady || !mapRef.current || territoires.length === 0) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 5,
      center: { lat: 47.5, lng: 7.5 }, // Centré sur l'Europe
      scrollwheel: true,
      gestureHandling: "greedy",
      mapTypeId: 'terrain'
    });

    territoires.forEach((t, index) => {
      const marker = new google.maps.Marker({
        map: mapInstance.current!,
        position: { lat: t.lat, lng: t.lng },
        title: t.nom,
        label: {
          text: (index + 1).toString(),
          color: "white",
          fontSize: "10px",
          fontWeight: "bold"
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#1e3a8a", // Bleu Empire
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff",
        }
      });

      const infowindow = new google.maps.InfoWindow({
        content: `
          <div style="color: black; padding: 5px; font-family: sans-serif; max-width: 220px;">
            <strong style="font-size: 14px;">#${index + 1} - ${t.nom}</strong><br>
            <span style="color: #b91c1c; font-size: 10px; font-weight: bold;">${t.date_debut} — ${t.date_fin}</span><br>
            <span style="color: #666; font-size: 10px; text-transform: uppercase; font-weight: bold;">${t.statut}</span>
            <p style="margin-top:8px; font-size: 12px; line-height: 1.4;">${t.description}</p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infowindow.open(mapInstance.current, marker);
      });
    });
  }, [isReady, territoires]);

  return (
    <div className="p-4 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <header className="mb-8 border-b pb-6 text-center">
        <h1 className="text-4xl font-black text-blue-900 uppercase tracking-tighter">
          Empire Français : Territoires Annexés
        </h1>
        <p className="text-gray-600 mt-2 italic">L'Europe sous Napoléon Ier et la Révolution (Période 1792 - 1815)</p>
      </header>

      <div
        ref={mapRef}
        style={{ height: "60vh", width: "100%" }}
        className="mb-8 border-4 border-white shadow-2xl rounded-3xl bg-slate-200 overflow-hidden"
      >
        {!isReady && (
          <div className="flex items-center justify-center h-full bg-slate-100">
            <p className="animate-pulse font-bold text-blue-600">Chargement de la carte impériale...</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {territoires.map((t, index) => (
          <div key={t.nom} className="group p-5 bg-white rounded-2xl shadow-sm border border-slate-200 hover:bg-blue-900 transition-all duration-300 flex gap-4">
            <span className="text-3xl font-black text-slate-200 group-hover:text-blue-400/30 transition-colors">
              {(index + 1).toString().padStart(2, '0')}
            </span>
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-white transition-colors">{t.nom}</h3>
              <div className="text-xs font-bold text-red-600 group-hover:text-red-300 mt-1">
                {t.date_debut} — {t.date_fin}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 group-hover:text-blue-200 mt-1">
                {t.statut}
              </div>
              <p className="text-sm text-gray-600 group-hover:text-blue-50 mt-3 leading-snug">
                {t.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}