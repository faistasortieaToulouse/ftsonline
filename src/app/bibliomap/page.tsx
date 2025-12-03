"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface Library {
  name: string;
  address: string;
}

export default function BibliomapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [ready, setReady] = useState(false);

  const geocodeCache = useRef<Record<string, google.maps.LatLngLiteral>>({});

  // Charger les données
  useEffect(() => {
    fetch("/api/bibliomap")
      .then((res) => res.json())
      .then((data) => setLibraries(data))
      .catch(console.error);

    const stored = localStorage.getItem("geo-cache");
    if (stored) geocodeCache.current = JSON.parse(stored);
  }, []);

  // Initialisation de la carte
  useEffect(() => {
    if (!ready || !libraries.length || !mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      zoom: 12,
      center: { lat: 43.6045, lng: 1.444 },
      mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID,
    });

    const geocoder = new google.maps.Geocoder();
    const markers: google.maps.marker.AdvancedMarkerElement[] = [];

    const geocodeAddress = (address: string): Promise<google.maps.LatLngLiteral> =>
      new Promise((resolve) => {
        if (geocodeCache.current[address]) {
          resolve(geocodeCache.current[address]);
          return;
        }

        geocoder.geocode({ address }, (res, status) => {
          if (status === "OK" && res?.[0]) {
            const loc = {
              lat: res[0].geometry.location.lat(),
              lng: res[0].geometry.location.lng(),
            };
            geocodeCache.current[address] = loc;
            localStorage.setItem("geo-cache", JSON.stringify(geocodeCache.current));
            resolve(loc);
          } else resolve({ lat: 0, lng: 0 });
        });
      });

    Promise.all(libraries.map((lib) => geocodeAddress(lib.address))).then((coords) => {
      coords.forEach((pos, idx) => {
        const lib = libraries[idx];

        // Marqueur avec numéro
        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: pos,
          title: lib.name,
          label: {
            text: `${idx + 1}`, // numéro sur le marqueur
            color: "white",
            fontWeight: "bold",
          },
        });

        const infowindow = new google.maps.InfoWindow({
          content: `<strong>${idx + 1}. ${lib.name}</strong><br>${lib.address}`,
        });

        marker.addListener("click", () => infowindow.open({ anchor: marker, map }));

        markers.push(marker);
      });

      // Clustering (facultatif)
      // @ts-ignore
      new markerClusterer.MarkerClusterer({ map, markers });
    });
  }, [ready, libraries]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=marker&loading=async`}
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      <Script
        src="https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js"
        strategy="afterInteractive"
      />

      <h1 className="text-3xl font-extrabold mb-6">📍 Carte des Bibliothèques de Toulouse</h1>

      <div
        ref={mapRef}
        style={{ height: "70vh", width: "100%" }}
        className="border rounded-lg mb-8 flex items-center justify-center text-gray-500"
      >
        {!ready && <p>Chargement de la carte...</p>}
      </div>

      <h2 className="text-xl font-bold mb-4">Liste des bibliothèques ({libraries.length})</h2>
      <ul className="list-none pl-0">
        {libraries.map((lib, idx) => (
          <li key={idx}>
            <strong>{idx + 1}. {lib.name}</strong> — {lib.address}
          </li>
        ))}
      </ul>
    </div>
  );
}
