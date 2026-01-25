"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ToulousePlace {
  num: string;
  voie: string;
  adresse: string;
  bâtiment: string;
  quartier: string;
  ["équivalent à Paris"]?: string;
  ressemble?: string;
  localisation?: string;
}

export default function VisiteToulousePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [places, setPlaces] = useState<ToulousePlace[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetch("/api/visitetoulouse")
      .then(async (res) => {
        const raw = await res.text(); 
        console.log("RAW API:", raw); // 🔍 Debug si JSON invalide
        return JSON.parse(raw);
      })
      .then((data: ToulousePlace[]) => setPlaces(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 13.5,
      center: { lat: 43.6045, lng: 1.444 },
      scrollwheel: true,
      gestureHandling: "greedy",
    });

    const geocoder = new google.maps.Geocoder();

    places.forEach((place, i) => {
      const adresse = `Toulouse ${place.num} ${place.voie} ${place.adresse}`;
      geocoder.geocode({ address: adresse }, (results, status) => {
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
          title: place.bâtiment,
        });

        const infowindow = new google.maps.InfoWindow({
          content: `
            <strong>${i + 1}. ${place.bâtiment}</strong><br>
            ${place.num} ${place.voie} ${place.adresse}<br>
            Quartier : ${place.quartier}<br>
            Équivalent à Paris : ${place["équivalent à Paris"] || ""}<br>
            Ressemble : ${place.ressemble || ""}<br>
            Localisation : ${place.localisation || ""}
          `,
        });

        marker.addListener("click", () =>
          infowindow.open(mapInstance.current!, marker)
        );
      });
    });
  }, [isReady, places]);

  return (
    <div className="p-4 max-w-7xl mx-auto">

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

      <h1 className="text-3xl font-extrabold mb-6">
        🗺️ Lieux à visiter : Toulouse ↔ Paris
      </h1>

      <div
        ref={mapRef}
        style={{ height: "70vh", width: "100%" }}
        className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center"
      >
        {!isReady && <p>Chargement de la carte…</p>}
      </div>

      <h2 className="text-2xl font-semibold mb-4">
        Liste des lieux ({places.length})
      </h2>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {places.map((place, i) => (
          <li key={i} className="p-4 border rounded bg-white shadow">
            <p className="text-lg font-bold">
              {i + 1}. {place.bâtiment}
            </p>
            <p className="italic">
              {place.num} {place.voie} {place.adresse} — {place.quartier}
            </p>
            {place["équivalent à Paris"] && (
              <p>Équivalent à Paris : {place["équivalent à Paris"]}</p>
            )}
            {place.ressemble && <p>Ressemble : {place.ressemble}</p>}
            {place.localisation && <p>Localisation : {place.localisation}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
