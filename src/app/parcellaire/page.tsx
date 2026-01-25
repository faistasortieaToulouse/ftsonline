"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Parcelle {
  id: number;
  centroid: { lat: number; lon: number };
  geometry: {
    coordinates: number[][][];
    type: string;
  };
  codeparcelle: string | null;
  typologie: string;
  surface: string;
  nom_prenom: string;
}

export default function ParcellairePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const map = useRef<google.maps.Map | null>(null);

  const [isMapReady, setIsMapReady] = useState(false);
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);

  // refs pour stocker polygones et infoWindows
  const polygonsRef = useRef<Map<number, google.maps.Polygon>>(new Map());
  const infoWindowsRef = useRef<Map<number, google.maps.InfoWindow>>(new Map());

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    fetch("/api/parcellaire")
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a: Parcelle, b: Parcelle) =>
          (a.codeparcelle ?? "").localeCompare(b.codeparcelle ?? "")
        );
        setParcelles(sorted);
      })
      .catch(console.error);
  }, []);

  /* ================= MAP INIT ================= */
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    map.current = new google.maps.Map(mapRef.current, {
      center: { lat: 43.6045, lng: 1.444 },
      zoom: 14,
      mapTypeId: "roadmap",
      gestureHandling: "greedy",
      scrollwheel: true,
    });
  }, [isMapReady]);

  /* ================= DRAW PARCELS ================= */
  useEffect(() => {
    if (!map.current || parcelles.length === 0) return;

    parcelles.forEach(p => {
      if (!p.geometry?.coordinates?.[0]) return;

      const paths = p.geometry.coordinates[0]
        .map(coord => ({
          lng: Number(coord[0]),
          lat: Number(coord[1]),
        }))
        .filter(c => !isNaN(c.lat) && !isNaN(c.lng));

      if (paths.length === 0) return;

      const polygon = new google.maps.Polygon({
        paths,
        strokeColor: "#7c3aed",
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: "#a78bfa",
        fillOpacity: 0.35,
        map: map.current,
      });

      const info = new google.maps.InfoWindow({
        content: `
          <strong>Parcelle :</strong> ${p.codeparcelle}<br/>
          <strong>Type :</strong> ${p.typologie}<br/>
          <strong>Surface :</strong> ${p.surface} m²<br/>
          <strong>Propriétaire :</strong> ${p.nom_prenom}
        `,
      });

      polygon.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        info.setPosition(e.latLng);
        info.open(map.current);
      });

      polygonsRef.current.set(p.id, polygon);
      infoWindowsRef.current.set(p.id, info);
    });
  }, [parcelles]);

  /* ================= HANDLE TABLE CLICK ================= */
  const handleRowClick = (p: Parcelle) => {
    const polygon = polygonsRef.current.get(p.id);
    const info = infoWindowsRef.current.get(p.id);
    if (!map.current || !polygon || !info) return;

    // Calculer le centre du polygone pour recentrer la carte
    const bounds = new google.maps.LatLngBounds();
    polygon.getPath().forEach((latLng: google.maps.LatLng) => bounds.extend(latLng));
    map.current.fitBounds(bounds);

    // Ouvrir l'infoWindow au centre du polygone
    const center = bounds.getCenter();
    info.setPosition(center);
    info.open(map.current);

    // Remonter vers la carte
    if (mapRef.current) {
      mapRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
        onLoad={() => setIsMapReady(true)}
      />

      <h1 className="text-3xl font-extrabold mb-6 text-center text-purple-800">
        🗺️ Parcellaire de Toulouse (1830)
      </h1>

      <div
        ref={mapRef}
        className="h-[600px] w-full border rounded-lg bg-gray-100"
      >
        {!isMapReady && <p className="p-4">Chargement de la carte…</p>}
      </div>

      {/* Tableau de données trié */}
      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-purple-100">
              <th className="border p-2">Parcelle</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Surface (m²)</th>
              <th className="border p-2">Propriétaire</th>
            </tr>
          </thead>
          <tbody>
            {parcelles.map(p => (
              <tr
                key={p.id}
                className="hover:bg-purple-50 cursor-pointer"
                onClick={() => handleRowClick(p)}
              >
                <td className="border p-2">{p.codeparcelle}</td>
                <td className="border p-2">{p.typologie}</td>
                <td className="border p-2">{p.surface}</td>
                <td className="border p-2">{p.nom_prenom}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
