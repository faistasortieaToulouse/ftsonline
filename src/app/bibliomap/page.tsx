"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface Library {
  name: string;
  address: string;
}

export default function BibliomapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [isReady, setIsReady] = useState(false);

  // 1. Chargement des données
  useEffect(() => {
    fetch("/api/bibliomap")
      .then((res) => res.json())
      .then((data) => setLibraries(data))
      .catch(console.error);
  }, []);

  // 2. Initialisation de la carte seulement quand Google Maps est prêt
  useEffect(() => {
    if (!isReady || !mapRef.current || !libraries.length) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 12,
      center: { lat: 43.6045, lng: 1.444 },
    });

    const geocoder = new google.maps.Geocoder();

    libraries.forEach((library) => {
      geocoder.geocode({ address: library.address }, (results, status) => {
        if (status !== "OK" || !results?.[0]) return;

        const marker = new google.maps.Marker({
          map: mapInstance.current!,
          position: results[0].geometry.location,
        });

        const infowindow = new google.maps.InfoWindow({
          content: `<strong>${library.name}</strong><br>${library.address}`,
        });

        marker.addListener("click", () => infowindow.open(mapInstance.current, marker));
      });
    });
  }, [isReady, libraries]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <h1 className="text-3xl font-extrabold mb-6">📍 Carte des Bibliothèques</h1>

      <div
        ref={mapRef}
        style={{ height: "70vh", width: "100%" }}
        className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center"
      >
        {!isReady && <p>Chargement de la carte…</p>}
      </div>

      <h2 className="text-2xl font-semibold mb-4">
        Liste ({libraries.length})
      </h2>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {libraries.map((library, i) => (
          <li key={i} className="p-4 border rounded bg-white shadow">
            <p className="text-lg font-bold">{library.name}</p>
            <p>{library.address}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
