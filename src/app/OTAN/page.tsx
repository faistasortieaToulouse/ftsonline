'use client';

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface MembreOTAN {
  pays: string;
  capitale: string;
  date_admission: string;
  population: number;
  // Coordonnées ajoutées dynamiquement pour la carte
  lat?: number;
  lng?: number;
}

interface OTANData {
  nom_liste: string;
  total: number;
  otan_membres: MembreOTAN[];
}

// Coordonnées approximatives pour l'affichage de la carte
const coordsMap: Record<string, { lat: number; lng: number }> = {
  "Albanie": { lat: 41.32, lng: 19.81 },
  "Allemagne": { lat: 52.52, lng: 13.40 },
  "Belgique": { lat: 50.85, lng: 4.35 },
  "Bulgarie": { lat: 42.69, lng: 23.32 },
  "Canada": { lat: 45.42, lng: -75.69 },
  "Croatie": { lat: 45.81, lng: 15.98 },
  "Danemark": { lat: 55.67, lng: 12.56 },
  "États-Unis": { lat: 38.90, lng: -77.03 },
  "France": { lat: 48.85, lng: 2.35 },
  "Grèce": { lat: 37.98, lng: 23.72 },
  "Hongrie": { lat: 47.49, lng: 19.04 },
  "Islande": { lat: 64.14, lng: -21.94 },
  "Italie": { lat: 41.89, lng: 12.51 },
  "Luxembourg": { lat: 49.61, lng: 6.13 },
  "Norvège": { lat: 59.91, lng: 10.75 },
  "Pays-Bas": { lat: 52.36, lng: 4.90 },
  "Pologne": { lat: 52.22, lng: 21.01 },
  "Portugal": { lat: 38.72, lng: -9.13 },
  "Roumanie": { lat: 44.42, lng: 26.10 },
  "Royaume-Uni": { lat: 51.50, lng: -0.12 },
  "Turquie": { lat: 39.93, lng: 32.85 },
  "Espagne": { lat: 40.41, lng: -3.70 },
  "Tchéquie": { lat: 50.07, lng: 14.43 },
  "Slovaquie": { lat: 48.14, lng: 17.10 },
  "Slovénie": { lat: 46.05, lng: 14.50 },
  "Estonie": { lat: 59.43, lng: 24.75 },
  "Lettonie": { lat: 56.94, lng: 24.10 },
  "Lituanie": { lat: 54.68, lng: 25.27 },
  "Monténégro": { lat: 42.43, lng: 19.25 },
  "Macédoine du Nord": { lat: 41.99, lng: 21.42 },
  "Finlande": { lat: 60.16, lng: 24.93 },
  "Suède": { lat: 59.32, lng: 18.06 }
};

export default function OTANPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [data, setData] = useState<OTANData | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetch("/api/OTAN")
      .then(res => res.json())
      .then(json => {
        if (json.otan_membres) {
          // Fusion des données avec les coordonnées
          const membresAvecCoords = json.otan_membres.map((m: MembreOTAN) => ({
            ...m,
            ...coordsMap[m.pays]
          }));
          setData({ ...json, otan_membres: membresAvecCoords });
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    // Sécurité anti-crash : Vérification de window.google
    if (!isReady || !mapRef.current || !data || typeof window.google === 'undefined') return;
    if (mapInstance.current) return;

    const map = new google.maps.Map(mapRef.current, {
      zoom: 3,
      center: { lat: 45, lng: -20 }, // Centré sur l'Atlantique Nord
      mapTypeId: 'terrain',
      styles: [{ featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#1e3a8a" }, { weight: 1 }] }]
    });

    mapInstance.current = map;

    data.otan_membres.forEach((p) => {
      if (p.lat && p.lng) {
        const marker = new google.maps.Marker({
          map: map,
          position: { lat: p.lat, lng: p.lng },
          title: p.pays,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: "#1e3a8a", // Bleu OTAN
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff",
          }
        });

        const infowindow = new google.maps.InfoWindow({
          content: `
            <div style="color: black; padding: 10px; font-family: sans-serif;">
              <strong style="font-size: 14px;">${p.pays}</strong><br>
              <p style="margin: 5px 0; font-size: 12px;">📅 Admis le : ${p.date_admission}</p>
              <p style="margin: 0; font-size: 12px;">🏠 Capitale : ${p.capitale}</p>
            </div>
          `,
        });

        marker.addListener("click", () => infowindow.open(map, marker));
      }
    });
  }, [isReady, data]);

  if (!data) return <div className="p-10 text-center">Chargement des membres de l'OTAN...</div>;

  return (
    <div className="p-4 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => { if (typeof window.google !== 'undefined') setIsReady(true); }}
      />

      <header className="mb-8 border-b border-blue-900 pb-6">
        <h1 className="text-4xl font-black text-blue-950 flex items-center gap-3">
          ⚓ {data.nom_liste}
        </h1>
        <p className="text-gray-600 mt-2 italic">Organisation du Traité de l'Atlantique Nord ({data.total} membres)</p>
      </header>

      <div ref={mapRef} style={{ height: "45vh", width: "100%" }} className="mb-8 border-4 border-blue-900 shadow-xl rounded-3xl bg-slate-200 overflow-hidden" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.otan_membres.map((p, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all">
            <h3 className="font-bold text-blue-900 text-lg mb-1">{p.pays}</h3>
            <p className="text-xs text-slate-500 mb-3">{p.capitale}</p>
            <div className="space-y-2">
              <div className="text-[11px] bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-semibold inline-block">
                Admis le {p.date_admission}
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Population:</span>
                <span className="font-bold text-slate-700">{p.population.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}