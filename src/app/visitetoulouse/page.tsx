"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface Establishment {
  num: string;
  voie: string;
  adresse: string;
  bâtiment: string;
  quartier: string;
  equivalentParis: string;
  ressemble: string;
  localisation: string;
}

export default function VisiteToulousePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetch("/api/visitetoulouse")
      .then((res) => res.json())
      .then((data: Establishment[]) => setEstablishments(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 13.5,
      center: { lat: 43.6045, lng: 1.444 }, // Centre Toulouse
      scrollwheel: true,
      gestureHandling: "greedy",
    });

    const geocoder = new google.maps.Geocoder();

    establishments.forEach((est, i) => {
      geocoder.geocode({ address: `Toulouse ${est.num} ${est.voie} ${est.adresse}` }, (results, status) => {
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
          content: `<strong>${i + 1}. ${est.bâtiment}</strong><br>${est.num} ${est.voie} ${est.adresse}<br>${est.quartier}`,
        });

        marker.addListener("click", () => infowindow.open(mapInstance.current, marker));
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
        🏛️ Visite de Toulouse — Parcours général
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
  <p className="text-lg font-bold">{i + 1}. {est.bâtiment}</p>
  <p className="italic">{est.num} {est.voie} {est.adresse} — {est.quartier}</p>
  <p>Numéro : {est.num}</p>
  <p>Voie : {est.voie}</p>
  <p>Bâtiment : {est.bâtiment}</p>
  <p>Quartier : {est.quartier}</p>
  <p>Équivalent à Paris : {est.equivalentParis}</p>
  <p>Ressemble : {est.ressemble}</p>
  <p>Localisation : {est.localisation}</p>
</li>
        ))}
      </ul>
    </div>
  );
}
