"use client";

import { useEffect, useRef, useState } from "react";
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
  const mapInstance = useRef<any>(null);
  
  // Refs pour stocker les couches Leaflet afin d'y accéder depuis le tableau
  const layersRef = useRef<Map<number, any>>(new Map());

  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  /* ================= 1. LOAD DATA ================= */
  useEffect(() => {
    fetch("/api/parcellaire")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a: Parcelle, b: Parcelle) =>
          (a.codeparcelle ?? "").localeCompare(b.codeparcelle ?? "")
        );
        setParcelles(sorted);
      })
      .catch(console.error);
  }, []);

  /* ================= 2. MAP INIT & DRAW (OTAN) ================= */
  useEffect(() => {
    // Empêche l'exécution côté serveur
    if (typeof window === "undefined" || !mapRef.current || parcelles.length === 0) return;

    const initLeaflet = async () => {
      const L = (await import("leaflet")).default;

      // Initialisation de la carte si elle n'existe pas
      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current!).setView([43.6045, 1.444], 14);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapInstance.current);
      }

      // Nettoyage si nécessaire (pour éviter les doublons au refresh)
      layersRef.current.forEach(layer => mapInstance.current.removeLayer(layer));
      layersRef.current.clear();

      // Dessin des parcelles
      parcelles.forEach((p) => {
        if (!p.geometry?.coordinates?.[0]) return;

        // Leaflet utilise [lat, lng], GeoJSON utilise [lng, lat]
        const latLngs: [number, number][] = p.geometry.coordinates[0].map(
          (coord) => [coord[1], coord[0]]
        );

        const polygon = L.polygon(latLngs, {
          color: "#7c3aed",
          weight: 1,
          opacity: 0.8,
          fillColor: "#a78bfa",
          fillOpacity: 0.35,
        }).addTo(mapInstance.current);

        // Tooltip ou Popup
        polygon.bindPopup(`
          <strong>Parcelle :</strong> ${p.codeparcelle}<br/>
          <strong>Type :</strong> ${p.typologie}<br/>
          <strong>Surface :</strong> ${p.surface} m²<br/>
          <strong>Propriétaire :</strong> ${p.nom_prenom}
        `);

        layersRef.current.set(p.id, polygon);
      });

      setIsMapReady(true);
    };

    initLeaflet();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [parcelles]);

  /* ================= 3. HANDLE TABLE CLICK ================= */
  const handleRowClick = (p: Parcelle) => {
    const polygon = layersRef.current.get(p.id);
    if (!mapInstance.current || !polygon) return;

    // Zoom sur la parcelle
    const bounds = polygon.getBounds();
    mapInstance.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
    
    // Ouvrir le popup
    polygon.openPopup();

    // Scroll vers la carte
    if (mapRef.current) {
      mapRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <nav className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-6 text-center text-purple-800">
        🗺️ Parcellaire de Toulouse (1830)
      </h1>

      <div
        ref={mapRef}
        className="h-[600px] w-full border rounded-lg bg-gray-100 shadow-md relative z-0"
      >
        {!isMapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
             <p className="text-purple-600 animate-pulse font-semibold">Chargement de la carte…</p>
          </div>
        )}
      </div>

      {/* Tableau de données trié */}
      <div className="mt-8 overflow-x-auto shadow-sm border rounded-lg">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-purple-100 text-purple-900">
              <th className="border-b border-gray-300 p-3 text-left">Parcelle</th>
              <th className="border-b border-gray-300 p-3 text-left">Type</th>
              <th className="border-b border-gray-300 p-3 text-left">Surface (m²)</th>
              <th className="border-b border-gray-300 p-3 text-left">Propriétaire</th>
            </tr>
          </thead>
          <tbody>
            {parcelles.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-purple-50 cursor-pointer transition-colors even:bg-gray-50"
                onClick={() => handleRowClick(p)}
              >
                <td className="border-b border-gray-200 p-3 font-medium">{p.codeparcelle}</td>
                <td className="border-b border-gray-200 p-3 text-gray-700">{p.typologie}</td>
                <td className="border-b border-gray-200 p-3 text-gray-700">{p.surface}</td>
                <td className="border-b border-gray-200 p-3 text-gray-700">{p.nom_prenom}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}