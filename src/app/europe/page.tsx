'use client';

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface PaysEurope {
  nom: string;
  nom_long: string;
  ue: boolean;
  noms_originaux: string;
  capitale: string;
  population: string;
  superficie: string;
  lat?: number;
  lng?: number;
}

interface EuropeData {
  nom_liste: string;
  total: number;
  pays_europe: PaysEurope[];
}

export default function EuropePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [data, setData] = useState<EuropeData | null>(null);
  const [isReady, setIsReady] = useState(false);

  // 1. Chargement des données
  useEffect(() => {
    fetch("/api/europe")
      .then((res) => res.json())
      .then((json) => {
        if (json.pays_europe) setData(json);
      })
      .catch(console.error);
  }, []);

  // 2. Initialisation sécurisée de la carte
  useEffect(() => {
    // CONDITION DE SÉCURITÉ CRITIQUE : vérifier typeof window.google
    if (!isReady || !mapRef.current || !data || typeof window.google === 'undefined') {
      return;
    }

    // Éviter les ré-initialisations multiples
    if (mapInstance.current) return;

    try {
      const map = new google.maps.Map(mapRef.current, {
        zoom: 4,
        center: { lat: 48.5, lng: 12 },
        mapTypeId: 'terrain',
        styles: [
          { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#1e293b" }, { weight: 1 }] }
        ]
      });

      mapInstance.current = map;

      data.pays_europe.forEach((p) => {
        if (p.lat && p.lng) {
          const marker = new google.maps.Marker({
            map: map,
            position: { lat: p.lat, lng: p.lng },
            title: p.nom,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: p.ue ? "#1d4ed8" : "#64748b",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#ffffff",
            }
          });

          const infowindow = new google.maps.InfoWindow({
            content: `
              <div style="color: black; padding: 10px; font-family: sans-serif; min-width: 150px;">
                <strong style="font-size: 16px;">${p.nom}</strong><br>
                <p style="margin: 5px 0; color: #64748b;">${p.capitale}</p>
                <div style="font-size: 12px; border-top: 1px solid #eee; padding-top: 5px;">
                  👥 Pop: <b>${p.population}</b><br>
                  📏 Surf: <b>${p.superficie}</b>
                </div>
              </div>
            `,
          });

          marker.addListener("click", () => infowindow.open(map, marker));
        }
      });
    } catch (e) {
      console.error("Erreur lors de l'init de la carte:", e);
    }
  }, [isReady, data]);

  if (!data) return <div className="p-10 text-center">Chargement des données...</div>;

  return (
    <div className="p-4 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => {
          // On s'assure que google est bien là avant de passer à true
          if (typeof window.google !== 'undefined') {
            setIsReady(true);
          }
        }}
      />

      <header className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
          🌍 {data.nom_liste}
        </h1>
        <p className="text-gray-600 mt-2 italic">Informations générales et géographie</p>
      </header>

      <div 
        ref={mapRef} 
        style={{ height: "50vh", width: "100%" }} 
        className="mb-8 border-4 border-white shadow-xl rounded-3xl bg-slate-200 overflow-hidden" 
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.pays_europe.map((p, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-slate-900 text-lg">{p.nom}</h3>
              {p.ue && <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded">UE</span>}
            </div>
            <p className="text-xs text-slate-500 mb-4">{p.capitale}</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Population:</span>
                <span className="text-slate-700 font-semibold">{p.population}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Superficie:</span>
                <span className="text-slate-700 font-semibold">{p.superficie}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}