'use client';

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface Universite {
  name: string;
  address: string;
  url: string;
  type: string;
}

export default function UniversitesToulousePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  const [places, setPlaces] = useState<Universite[]>([]);
  const [isReady, setIsReady] = useState(false);

  // --- charger les données ---
  useEffect(() => {
    fetch("/api/universites")
      .then(async (res) => {
        const data = await res.json();
        setPlaces(data);
      })
      .catch(console.error);
  }, []);

  // --- Carte Google Maps ---
  useEffect(() => {
    if (!isReady || !mapRef.current || places.length === 0) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 12,
      center: { lat: 43.6045, lng: 1.444 },
      scrollwheel: true,
      gestureHandling: "greedy",
    });

    const geocoder = new google.maps.Geocoder();

    places.forEach((place, i) => {
      // Géocodage basé sur l'adresse fournie dans l'API
      const adresse = `Toulouse, ${place.address}`;

      setTimeout(() => {
        geocoder.geocode({ address: adresse }, (results, status) => {
          if (status !== "OK" || !results?.[0]) {
            console.warn(`⚠ Adresse introuvable: "${adresse}" — status: ${status}`);
            return;
          }

          const marker = new google.maps.Marker({
            map: mapInstance.current!,
            position: results[0].geometry.location,
            label: {
              text: `${i + 1}`,
              color: "white",
              fontWeight: "bold"
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: "#1e40af", // Bleu universitaire
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "white",
            },
            title: place.name,
          });

          const infowindow = new google.maps.InfoWindow({
            content: `
              <div style="padding:5px; font-family:sans-serif;">
                <strong>${i + 1}. ${place.name}</strong><br>
                <small>${place.address}</small><br>
                <p style="margin-top:5px; font-size:12px;">${place.type}</p>
                <a href="${place.url}" target="_blank" style="color:blue; text-decoration:underline;">Actualités</a>
              </div>
            `,
          });

          marker.addListener("click", () => infowindow.open(mapInstance.current, marker));
        });
      }, i * 200);
    });
  }, [isReady, places]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* --- Script Google Maps --- */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-blue-900 uppercase">🎓 Universités & Grandes Écoles — Toulouse</h1>
        <p className="text-slate-600">Carte des campus et accès direct aux actualités.</p>
      </header>

      {/* --- Carte --- */}
      <div
        ref={mapRef}
        style={{ height: "60vh", width: "100%" }}
        className="mb-8 border rounded-2xl shadow-lg bg-gray-100 flex items-center justify-center overflow-hidden"
      >
        {!isReady && <p className="animate-pulse">Chargement de la carte des campus…</p>}
      </div>

      {/* --- Liste des lieux --- */}
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <span className="bg-blue-900 text-white px-3 py-1 rounded-full text-sm">{places.length}</span>
        Établissements
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.map((place, i) => (
          <div key={i} className="p-5 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow border-slate-200">
            <div className="flex justify-between items-start mb-2">
              <span className="bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                {i + 1}
              </span>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase">
                {place.type}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-1">{place.name}</h3>
            <p className="text-sm text-slate-500 italic mb-4">📍 {place.address}</p>
            
            <a 
              href={place.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full text-center bg-blue-900 hover:bg-pink-600 text-white py-2 rounded-lg font-bold text-sm transition-colors"
            >
              VOIR LES ACTUALITÉS
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}