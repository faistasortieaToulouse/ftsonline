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
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  const geocodeCache = useRef<Record<string, google.maps.LatLngLiteral>>({});

  const colors = ["#FF4D4F", "#1890FF", "#52C41A", "#FAAD14", "#722ED1", "#13C2C2", "#EB2F96"];

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
    markersRef.current = [];

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
        const color = colors[idx % colors.length];

        // Marqueur avec SVG
        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: pos,
          title: lib.name,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                <circle cx="20" cy="20" r="20" fill="${color}" />
                <text x="50%" y="55%" text-anchor="middle" fill="white" font-size="16" font-family="Arial" font-weight="bold">${idx + 1}</text>
              </svg>
            `)}`,
            scaledSize: new google.maps.Size(40, 40),
          },
        });

        const infowindow = new google.maps.InfoWindow({
          content: `<strong>${idx + 1}. ${lib.name}</strong><br>${lib.address}`,
        });

        marker.addListener("click", () => infowindow.open({ anchor: marker, map }));
        markersRef.current.push(marker);
      });

      // Clusterer officiel
      // @ts-ignore
      new markerClusterer.MarkerClusterer({ map, markers: markersRef.current });
    });
  }, [ready, libraries]);

  // Recentre la carte sur un marqueur depuis la liste
  const focusMarker = (index: number) => {
    const marker = markersRef.current[index];
    if (marker && mapRef.current) {
      marker.getMap()?.panTo(marker.getPosition()!);
      marker.getMap()?.setZoom(15);
      new google.maps.InfoWindow({
        content: `<strong>${index + 1}. ${libraries[index].name}</strong><br>${libraries[index].address}`,
      }).open({ anchor: marker, map: marker.getMap()! });
    }
  };

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
          <li
            key={idx}
            className="cursor-pointer hover:text-blue-600 mb-2"
            onClick={() => focusMarker(idx)}
          >
            <strong>{idx + 1}. {lib.name}</strong> — {lib.address}
          </li>
        ))}
      </ul>
    </div>
  );
}
