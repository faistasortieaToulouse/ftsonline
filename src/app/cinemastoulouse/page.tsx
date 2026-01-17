'use client';

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface Cinema {
  name: string;
  address: string;
  url: string;
  category: string;
}

export default function CinemasToulousePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [isReady, setIsReady] = useState(false);

  // --- 1. Charger les données depuis votre API ---
  useEffect(() => {
    fetch("/api/cinemastoulouse")
      .then(async (res) => {
        if (!res.ok) throw new Error("Erreur lors de la récupération");
        const data: Cinema[] = await res.json();
        // Tri alphabétique pour que la numérotation soit logique
        setCinemas(data.sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(console.error);
  }, []);

  // --- 2. Initialiser la carte et les marqueurs ---
  useEffect(() => {
    if (!isReady || !mapRef.current || cinemas.length === 0) return;

    // Création de la carte centrée sur Toulouse
    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 13,
      center: { lat: 43.6045, lng: 1.444 },
      scrollwheel: true,
      gestureHandling: "greedy",
      styles: [ // Style optionnel pour rendre la carte plus moderne
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
      ]
    });

    const geocoder = new google.maps.Geocoder();

    cinemas.forEach((cinema, i) => {
      // On utilise l'adresse complète stockée dans l'API
      const adresse = cinema.address;

      // Délai pour éviter de saturer le quota du Geocoder Google (Over Query Limit)
      setTimeout(() => {
        geocoder.geocode({ address: adresse }, (results, status) => {
          if (status !== "OK" || !results?.[0]) {
            console.warn(`⚠ Adresse introuvable: "${adresse}"`);
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
              fillColor: "#e11d48", // Rose Toulouse
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "white",
            },
            title: cinema.name,
            animation: google.maps.Animation.DROP
          });

          const infowindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 10px; font-family: sans-serif;">
                <strong style="font-size: 14px;">${i + 1}. ${cinema.name}</strong><br>
                <p style="margin: 5px 0; font-size: 12px; color: #666;">${cinema.address}</p>
                <span style="display: inline-block; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; margin-bottom: 8px;">${cinema.category}</span><br>
                <a href="${cinema.url}" target="_blank" style="color: #e11d48; font-weight: bold; text-decoration: none; font-size: 12px;">Voir le programme →</a>
              </div>
            `,
          });

          marker.addListener("click", () => {
            infowindow.open(mapInstance.current, marker);
          });
        });
      }, i * 250); // 250ms entre chaque requête pour respecter les limites Google
    });
  }, [isReady, cinemas]);

  return (
    <div className="p-4 max-w-7xl mx-auto min-h-screen bg-slate-50">
      {/* --- Script Google Maps --- */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <header className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tight">
          🎬 Cinémas <span className="text-rose-600">Toulouse</span>
        </h1>
        <p className="text-slate-600 italic">Carte interactive des salles obscures de la ville rose.</p>
      </header>

      {/* --- Carte --- */}
      <div
        ref={mapRef}
        style={{ height: "60vh", width: "100%" }}
        className="mb-10 border-4 border-white shadow-xl rounded-2xl bg-gray-200 overflow-hidden relative"
      >
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <p className="animate-pulse font-bold text-slate-400">Initialisation de la carte...</p>
          </div>
        )}
      </div>

      {/* --- Liste des cinémas --- */}
      <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
        <span className="bg-rose-600 text-white px-3 py-1 rounded-lg text-sm">{cinemas.length}</span>
        Salles répertoriées
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cinemas.map((cinema, i) => (
          <div 
            key={i} 
            className="group p-5 border border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-md hover:border-rose-200 transition-all cursor-pointer"
            onClick={() => {
              // Centrer la carte au clic sur la liste si besoin
              if (mapInstance.current) {
                // Ici on pourrait rajouter un zoom sur le point
              }
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 text-white font-black">
                {i + 1}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-rose-50 text-rose-600 px-2 py-1 rounded">
                {cinema.category}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-rose-600 transition-colors">
              {cinema.name}
            </h3>
            <p className="text-sm text-slate-500 mb-6 italic flex items-center gap-1">
              📍 {cinema.address}
            </p>

            <a 
              href={cinema.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block w-full text-center py-2 rounded-xl bg-slate-100 text-slate-800 font-bold text-sm hover:bg-rose-600 hover:text-white transition-colors"
            >
              Programme officiel
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}