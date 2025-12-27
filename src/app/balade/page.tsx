'use client';

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

/* ================= TYPES ================= */

interface GeoPoint {
  lat: number;
  lon: number;
}

interface GeoShape {
  geometry: {
    coordinates: number[][][];
  };
}

interface Balade {
  id: string;
  nom: string;
  lieu: string;
  accessibilite: string;
  duree: string;
  distance: number;
  remarques: string;
  lien: string;
  geo_point_2d: GeoPoint;
  geo_shape: GeoShape;
}

type GroupedBalades = Record<string, Balade[]>;

/* ================= PAGE ================= */

export default function BaladePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  const [balades, setBalades] = useState<Balade[]>([]);
  const [isReady, setIsReady] = useState(false);

  /* ---------- Chargement des données ---------- */
  useEffect(() => {
    fetch('/api/balade')
      .then(res => {
        if (!res.ok) throw new Error("Erreur API");
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          console.error("Données invalides :", data);
          return;
        }

        data.sort((a, b) => a.lieu.localeCompare(b.lieu));
        setBalades(data);
      })
      .catch(err => console.error(err));
  }, []);

  /* ---------- Google Maps ---------- */
  useEffect(() => {
    if (!isReady || !mapRef.current || balades.length === 0) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 11,
      center: { lat: 43.6045, lng: 1.444 },
      gestureHandling: 'greedy',
    });

    balades.forEach((balade) => {
      /* 📍 Marker */
      const marker = new google.maps.Marker({
        map: mapInstance.current!,
        position: {
          lat: balade.geo_point_2d.lat,
          lng: balade.geo_point_2d.lon,
        },
        label: balade.id,
        title: balade.nom,
      });

      /* 🧭 Tracé */
      balade.geo_shape?.geometry?.coordinates?.forEach(segment => {
        const path = segment.map(([lng, lat]) => ({ lat, lng }));

        new google.maps.Polyline({
          map: mapInstance.current!,
          path,
          strokeColor: "#16a34a",
          strokeOpacity: 0.9,
          strokeWeight: 3,
        });
      });

      /* ℹ️ Info */
      const infowindow = new google.maps.InfoWindow({
        content: `
          <strong>${balade.nom}</strong><br/>
          <em>${balade.lieu}</em><br/>
          ⏱ ${balade.duree} — 📏 ${balade.distance} km<br/>
          ${balade.lien ? `<a href="${balade.lien}" target="_blank">Voir →</a>` : ''}
        `,
      });

      marker.addListener('click', () =>
        infowindow.open(mapInstance.current, marker)
      );
    });
  }, [isReady, balades]);

  /* ---------- Regroupement par lieu ---------- */
  const groupedBalades: GroupedBalades = balades.reduce((acc, balade) => {
    acc[balade.lieu] = acc[balade.lieu] || [];
    acc[balade.lieu].push(balade);
    return acc;
  }, {} as GroupedBalades);

  /* ================= RENDER ================= */

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <h1 className="text-3xl font-extrabold mb-4 text-green-700">
        🚶 Balades nature ({balades.length})
      </h1>

      <div
        ref={mapRef}
        style={{ height: '70vh', width: '100%' }}
        className="mb-8 border rounded-lg bg-gray-100"
      />

      <div className="space-y-12">
        {Object.entries(groupedBalades).map(([lieu, items]) => (
          <div key={lieu}>
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-green-400">
              {lieu} ({items.length})
            </h2>

            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(balade => (
                <li
                  key={balade.id}
                  className="p-4 bg-white rounded-lg shadow border"
                >
                  <p className="font-bold text-lg">
                    {balade.id}. {balade.nom}
                  </p>
                  <p className="text-sm text-gray-600">
                    ⏱ {balade.duree} — 📏 {balade.distance} km
                  </p>
                  <p className="text-sm italic">
                    {balade.accessibilite}
                  </p>

                  {balade.lien && (
                    <a
                      href={balade.lien}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 text-sm"
                    >
                      Voir →
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
