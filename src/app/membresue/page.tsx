'use client';

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

// ✅ L'export viewport a été supprimé d'ici pour éviter le conflit Client/Serveur

interface PaysUE {
  nom: string;
  code: string;
  entree_ue: number;
  schengen: boolean | string;
  lat: number;
  lng: number;
}

export default function MembresUEPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [pays, setPays] = useState<PaysUE[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetch("/api/membresue")
      .then(async (res) => {
        const data = await res.json();
        if (Array.isArray(data)) {
          const sorted = data.sort((a, b) => a.entree_ue - b.entree_ue);
          setPays(sorted);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!isReady || !mapRef.current || pays.length === 0) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 4,
      center: { lat: 48.5, lng: 12 },
      mapTypeId: 'terrain',
      styles: [{ featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#003399" }, { weight: 1.5 }] }]
    });

    pays.forEach((p) => {
      const marker = new google.maps.Marker({
        map: mapInstance.current!,
        position: { lat: p.lat, lng: p.lng },
        title: p.nom,
        label: {
          text: p.code,
          color: "white",
          fontSize: "10px",
          fontWeight: "bold"
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: "#003399",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#FFCC00",
        }
      });

      const infowindow = new google.maps.InfoWindow({
        content: `
          <div style="color: black; padding: 5px; font-family: sans-serif;">
            <strong style="font-size: 14px;">${p.nom}</strong><br>
            <div style="margin-top:5px; font-size: 12px;">
              🗓 Adhésion : <b>${p.entree_ue}</b><br>
              🛂 Schengen : <b>${p.schengen === 'partiel' ? 'Partiel (Air/Mer)' : p.schengen ? 'Oui' : 'Non'}</b>
            </div>
          </div>
        `,
      });

      marker.addListener("click", () => infowindow.open(mapInstance.current, marker));
    });
  }, [isReady, pays]);

  return (
    <div className="p-4 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&loading=async`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <header className="mb-8 border-b border-blue-200 pb-6">
        <h1 className="text-4xl font-black text-blue-900 flex items-center gap-3">
          🇪🇺 Les 27 États Membres de l'UE
        </h1>
        <p className="text-gray-600 mt-2 italic">Chronologie des adhésions et intégration à l'espace Schengen</p>
      </header>

      <div ref={mapRef} style={{ height: "55vh", width: "100%" }} className="mb-8 border-4 border-white shadow-xl rounded-3xl bg-slate-200 overflow-hidden" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pays.map((p) => (
          <div key={p.code} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <span className="text-2xl font-bold text-blue-800">{p.code}</span>
              <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded">
                Depuis {p.entree_ue}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg">{p.nom}</h3>
            <div className="mt-3 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${p.schengen === true ? 'bg-green-500' : p.schengen === 'partiel' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-500 uppercase font-semibold">
                Schengen : {p.schengen === 'partiel' ? 'Partiel' : p.schengen ? 'Inclus' : 'Exclu'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}