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

  // 1️⃣ Détecter si l’appareil est un desktop
  const isDesktop = () => {
    if (typeof window === "undefined") return true;
    return !/Mobi|Android|iPhone|iPad|iPod|Tablet/i.test(navigator.userAgent);
  };

  // 2️⃣ Chargement des données
  useEffect(() => {
    fetch("/api/bibliomap")
      .then((res) => res.json())
      .then((data) => setLibraries(data))
      .catch(console.error);
  }, []);

  // 3️⃣ Initialisation de la carte quand Google Maps est prêt
  useEffect(() => {
    if (!isReady || !mapRef.current || !libraries.length) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 12,
      center: { lat: 43.6045, lng: 1.444 },
      scrollwheel: isDesktop(), // molette activée uniquement sur desktop
      gestureHandling: isDesktop() ? "greedy" : "cooperative", // scroll et drag adaptés
    });

    const geocoder = new google.maps.Geocoder();

    libraries.forEach((library, i) => {
      geocoder.geocode({ address: library.address }, (results, status) => {
        if (status !== "OK" || !results?.[0]) return;

        // Marqueur avec numéro
        const marker = new google.maps.Marker({
          map: mapInstance.current!,
          position: results[0].geometry.location,
          label: `${i + 1}`, // numéro visible sur le pin
        });

        const infowindow = new google.maps.InfoWindow({
          content: `<strong>${i + 1}. ${library.name}</strong><br>${library.address}`,
        });

        marker.addListener("click", () => infowindow.open(mapInstance.current, marker));
      });
    });
  }, [isReady, libraries]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Script Google Maps */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <h1 className="text-3xl font-extrabold mb-6">📍 Carte des Bibliothèques de Toulouse</h1>

      {/* Carte */}
      <div
        ref={mapRef}
        style={{ height: "70vh", width: "100%" }}
        className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center"
      >
        {!isReady && <p>Chargement de la carte…</p>}
      </div>

      {/* Liste des bibliothèques */}
      <h2 className="text-2xl font-semibold mb-4">
        Liste Complète ({libraries.length})
      </h2>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {libraries.map((library, i) => (
          <li key={i} className="p-4 border rounded bg-white shadow">
            <p className="text-lg font-bold">{i + 1}. {library.name}</p>
            <p>{library.address}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
