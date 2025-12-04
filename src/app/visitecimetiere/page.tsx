"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface Person {
  name: string;
  address?: string; // Section + division si disponible
}

export default function VisiteCimetierePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Charger les données
  useEffect(() => {
    fetch("/api/visitecimetiere")
      .then(res => res.json())
      .then((data: Person[]) => setPeople(data))
      .catch(console.error);
  }, []);

  // Affichage de la carte
  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 14,
      center: { lat: 43.592, lng: 1.445 }, // Toulouse cimetière
      scrollwheel: true,
      gestureHandling: "greedy",
    });

    const geocoder = new google.maps.Geocoder();

    people.forEach((person, i) => {
      if (!person.address) return; // Sans section/division → pas sur la carte

      geocoder.geocode({ address: `Toulouse Cimetière ${person.address}` }, (results, status) => {
        if (status !== "OK" || !results?.[0]) return;

        const marker = new google.maps.Marker({
          map: mapInstance.current!,
          position: results[0].geometry.location,
          label: `${i + 1}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "green",
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: "black",
          },
        });

        const infowindow = new google.maps.InfoWindow({
          content: `<strong>${i + 1}. ${person.name}</strong><br>${person.address}`,
        });

        marker.addListener("click", () => infowindow.open(mapInstance.current, marker));
      });
    });
  }, [isReady, people]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <h1 className="text-3xl font-extrabold mb-6">
        ⚰️ Carte : Visite du cimetière
      </h1>

      <div
        ref={mapRef}
        style={{ height: "70vh", width: "100%" }}
        className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center"
      >
        {!isReady && <p>Chargement de la carte…</p>}
      </div>

      <h2 className="text-2xl font-semibold mb-4">
        Liste des personnalités ({people.length})
      </h2>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {people.map((person, i) => (
          <li key={i} className="p-4 border rounded bg-white shadow">
            <p className="text-lg font-bold">
              {i + 1}. {person.name}
            </p>
            {person.address && <p>{person.address}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
