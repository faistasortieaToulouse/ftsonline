"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

const GMAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

interface Marche {
  id: number;
  nom: string;
  type: string;
  adresse: string;
  code_postal: number | null;
  commune: string;
  jours_de_tenue: string;
  horaires: Record<string, string | null>;
  lat: number;
  lon: number;
}

export default function MarchesPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  const [marches, setMarches] = useState<Marche[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/marches")
      .then(res => res.json())
      .then(setMarches)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!isReady || !mapRef.current || marches.length === 0) return;
    if (mapInstance.current) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 12,
      center: { lat: 43.6047, lng: 1.4442 },
      scrollwheel: true,
      gestureHandling: "greedy",
    });

    const map = mapInstance.current;
    const infowindows: google.maps.InfoWindow[] = [];

    marches.forEach((marche, i) => {
      const address = `${marche.adresse}, ${marche.code_postal ?? ""} ${marche.commune}`;

      const marker = new google.maps.Marker({
        map,
        position: { lat: marche.lat, lng: marche.lon },
        label: {
          text: String(i + 1),
          color: "#fff",
          fontWeight: "bold",
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#16a34a",
          fillOpacity: 1,
          strokeWeight: 0,
        },
      });

      const infowindow = new google.maps.InfoWindow({
        content: `
          <strong>${i + 1}. ${marche.nom}</strong><br/>
          ${address}<br/>
          <em>${marche.jours_de_tenue}</em>
        `,
      });

      infowindows.push(infowindow);

      marker.addListener("click", () => {
        setOpenId(marche.id);
        infowindows.forEach(iw => iw.close());
        infowindow.open(map, marker);
        document
          .getElementById(`marche-${marche.id}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  }, [isReady, marches]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {GMAPS_API_KEY && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${GMAPS_API_KEY}`}
          strategy="afterInteractive"
          onLoad={() => setIsReady(true)}
        />
      )}

      <h1 className="text-3xl font-extrabold mb-6 text-center text-green-700">
        🥕 Marchés couverts et de plein vent de Toulouse ({marches.length})
      </h1>

      <div
        ref={mapRef}
        style={{ height: "60vh", width: "100%" }}
        className="mb-8 border-4 border-green-200 rounded-xl bg-gray-50"
      />

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marches.map((m, i) => {
          const isOpen = openId === m.id;
          return (
            <li
              key={m.id}
              id={`marche-${m.id}`}
              className="p-5 border rounded-lg bg-white shadow hover:shadow-xl cursor-pointer"
              onClick={() => setOpenId(isOpen ? null : m.id)}
            >
              <p className="text-lg font-bold text-green-800">
                {i + 1}. {m.nom}
              </p>
              <p className="text-sm text-gray-700">
                {m.adresse} {m.code_postal && `(${m.code_postal})`}
                <br />
                <strong>{m.commune}</strong>
              </p>

              {isOpen && (
                <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                  <p><strong>Type :</strong> {m.type}</p>
                  <p><strong>Jours :</strong> {m.jours_de_tenue}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
