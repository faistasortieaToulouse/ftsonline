"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

const GMAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

interface RandoVelo {
  geo_point_2d: { lon: number; lat: number };
  geo_shape: any;
  nom: string;
  distance_km: number;
  difficulte: string | null;
  plus_infos: string | null;
}

export default function RandoVeloPage() {
  const [randos, setRandos] = useState<RandoVelo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  // Fetch des randonnées
  useEffect(() => {
    fetch("/api/randovelos")
      .then(res => res.json())
      .then((data: RandoVelo[]) => {
        if (!Array.isArray(data)) return;
        const filtered = data.filter(r => r.nom !== "Départ / Arrivée");
        const sorted = filtered.sort((a, b) => (a.nom ?? "").localeCompare(b.nom ?? ""));
        setRandos(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Initialisation de la carte, marqueurs et itinéraires
  useEffect(() => {
    if (!isReady || !mapRef.current || randos.length === 0) return;
    if (mapInstance.current) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      center: { lat: 43.6045, lng: 1.444 },
      zoom: 12,
      scrollwheel: true,
      gestureHandling: "greedy",
    });

    const map = mapInstance.current;

    randos.forEach((r, i) => {
      // Marqueur du point de départ
      const marker = new google.maps.Marker({
        map,
        position: { lat: r.geo_point_2d.lat, lng: r.geo_point_2d.lon },
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
          <strong>${i + 1}. ${r.nom}</strong><br/>
          Distance : ${r.distance_km} km<br/>
          Difficulté : ${r.difficulte ?? "-"}
        `,
      });

      marker.addListener("click", () => infowindow.open(map, marker));

      // Tracé de l'itinéraire si c'est un LineString
      const geometry = r.geo_shape?.geometry?.geometries?.[0];
      if (geometry?.type === "LineString") {
        const path = geometry.coordinates.map(([lng, lat]: [number, number]) => ({ lat, lng }));
        new google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: "#16a34a",
          strokeOpacity: 0.7,
          strokeWeight: 4,
          map,
        });
      }
    });
  }, [isReady, randos]);

  if (loading) return <p className="p-4">Chargement des randonnées…</p>;
  if (!randos.length) return <p className="p-4">Aucune randonnée disponible.</p>;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {GMAPS_API_KEY && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${GMAPS_API_KEY}`}
          strategy="afterInteractive"
          onLoad={() => setIsReady(true)}
        />
      )}

      <h1 className="text-3xl font-extrabold mb-6 text-center text-green-800">
        🚴‍♂️ Randonnées vélo à Toulouse
      </h1>

      <div
        ref={mapRef}
        style={{ height: "60vh", width: "100%" }}
        className="mb-8 border-4 border-green-200 rounded-xl bg-gray-50"
      />

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-green-100">
              <th className="border p-2">#</th>
              <th className="border p-2">Nom</th>
              <th className="border p-2">Distance (km)</th>
              <th className="border p-2">Difficulté</th>
              <th className="border p-2">Plus d'infos</th>
            </tr>
          </thead>
          <tbody>
            {randos.map((r, i) => (
              <tr key={`${r.nom}-${i}`} className="hover:bg-green-50">
                <td className="border p-2">{i + 1}</td>
                <td className="border p-2">{r.nom}</td>
                <td className="border p-2">{r.distance_km}</td>
                <td className="border p-2">{r.difficulte ?? "-"}</td>
                <td className="border p-2">
                  {r.plus_infos ? (
                    <a href={r.plus_infos} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      Lien
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
