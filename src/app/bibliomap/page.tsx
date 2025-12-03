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
  const [ready, setReady] = useState(false);

  /** Cache local du géocodage */
  const geocodeCache = useRef<Record<string, google.maps.LatLngLiteral>>({});

  /** Chargement des données */
  useEffect(() => {
    fetch("/api/bibliomap")
      .then((res) => res.json())
      .then((data) => setLibraries(data))
      .catch(console.error);

    // récupérer le cache localStorage
    const stored = localStorage.getItem("geo-cache");
    if (stored) geocodeCache.current = JSON.parse(stored);
  }, []);

  /** Une fois que Google Maps est prêt */
  useEffect(() => {
    if (!ready || !mapRef.current || !libraries.length) return;

    // Carte
    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 12,
      center: { lat: 43.6045, lng: 1.444 },
    });

    const geocoder = new google.maps.Geocoder();
    const markers: google.maps.marker.AdvancedMarkerElement[] = [];

    const geocodeAddress = (address: string): Promise<google.maps.LatLngLiteral> =>
      new Promise((resolve) => {
        // 1. Vérifier cache
        if (geocodeCache.current[address]) {
          resolve(geocodeCache.current[address]);
          return;
        }

        // 2. Sinon géocoder
        geocoder.geocode({ address }, (results, status) => {
          if (status === "OK" && results?.[0]) {
            const loc = {
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng(),
            };

            geocodeCache.current[address] = loc;
            localStorage.setItem("geo-cache", JSON.stringify(geocodeCache.current));

            resolve(loc);
          } else {
            resolve({ lat: 0, lng: 0 });
          }
        });
      });

    // Géocodage + création des markers Modernes
    Promise.all(libraries.map((lib) => geocodeAddress(lib.address))).then((coords) => {
      coords.forEach((pos, idx) => {
        const lib = libraries[idx];

        const marker = new google.maps.marker.AdvancedMarkerElement({
          map: mapInstance.current!,
          position: pos,
          title: lib.name,
        });

        const infowindow = new google.maps.InfoWindow({
          content: `<strong>${lib.name}</strong><br>${lib.address}`,
        });

        marker.addListener("click", () => {
          infowindow.open({
            anchor: marker,
            map: mapInstance.current!,
          });
        });

        markers.push(marker);
      });

      // Clustering officiel Google
      // @ts-ignore
      new markerClusterer.MarkerClusterer({
        map: mapInstance.current!,
        markers,
      });
    });
  }, [ready, libraries]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Script Maps */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=marker,places`}
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />

      {/* Clusterer officiel */}
      <Script
        src="https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js"
        strategy="afterInteractive"
      />

      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
        📍 Carte des Bibliothèques de Toulouse
      </h1>

      <div
        ref={mapRef}
        style={{ height: "70vh", width: "100%" }}
        className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center"
      >
        {!ready && <p>Chargement de la carte…</p>}
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Liste ({libraries.length})
      </h2>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {libraries.map((lib, i) => (
          <li key={i} className="p-4 border bg-white rounded-lg shadow">
            <p className="text-lg font-bold text-indigo-700">{lib.name}</p>
            <p className="text-sm">{lib.address}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
