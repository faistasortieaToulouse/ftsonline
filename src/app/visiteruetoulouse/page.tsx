"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface Establishment {
  name: string;
  address: string;
}

export default function VisiteRueToulousePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetch("/api/visiteruetoulouse")
      .then((res) => res.json())
      .then((data: Establishment[]) => setEstablishments(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 14,
      center: { lat: 43.610, lng: 1.444 }, // Centre Toulouse approximatif
      scrollwheel: true,
      gestureHandling: "greedy",
    });

    const geocoder = new google.maps.Geocoder();

    establishments.forEach((est, i) => {
      geocoder.geocode({ address: `Toulouse ${est.address}` }, (results, status) => {
        if (status !== "OK" || !results?.[0]) return;

        const marker = new google.maps.Marker({
          map: mapInstance.current!,
          position: results[0].geometry.location,
          label: `${i + 1}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "red",
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: "black",
          },
        });

        const infowindow = new google.maps.InfoWindow({
          content: `<strong>${i + 1}. ${est.name}</strong><br>${est.address}`,
        });

        marker.addListener("click", () => infowindow.open(mapInstance.current, marker));
      });
    });
  }, [isReady, establishments]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <h1 className="text-3xl font-extrabold mb-6">
        🏛️ Visite Rue Toulouse — Parcours historique
      </h1>

      <div
        ref={mapRef}
        style={{ height: "70vh", width: "100%" }}
        className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center"
      >
        {!isReady && <p>Chargement de la carte…</p>}
      </div>

      <h2 className="text-2xl font-semibold mb-4">
        Liste des lieux ({establishments.length})
      </h2>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {establishments.map((est, i) => (
          <li key={i} className="p-4 border rounded bg-white shadow">
            <p className="text-lg font-bold">
              {i + 1}. {est.name}
            </p>
            <p>{est.address}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
