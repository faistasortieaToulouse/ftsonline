"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
  const mapInstance = useRef<any>(null);

  // 1. Fetch des randonnées
  useEffect(() => {
    fetch("/api/randovelos")
      .then((res) => res.json())
      .then((data: RandoVelo[]) => {
        if (!Array.isArray(data)) return;
        const filtered = data.filter((r) => r.nom !== "Départ / Arrivée");
        const sorted = filtered.sort((a, b) => (a.nom ?? "").localeCompare(b.nom ?? ""));
        setRandos(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 2. Initialisation de la carte Leaflet (Méthode OTAN)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || randos.length === 0) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      if (!mapInstance.current) {
        // Initialisation de la carte centrée sur Toulouse
        mapInstance.current = L.map(mapRef.current!).setView([43.6045, 1.444], 12);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstance.current);
      }

      const map = mapInstance.current;

      randos.forEach((r, i) => {
        const numero = i + 1;

        // Création d'une icône personnalisée numérotée (Cercle vert)
        const customIcon = L.divIcon({
          className: "custom-bike-marker",
          html: `<div style="
            background-color: #16a34a; 
            color: white; 
            width: 24px; height: 24px; 
            border-radius: 50%; 
            display: flex; align-items: center; justify-content: center; 
            font-size: 11px; font-weight: bold; 
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">${numero}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        // Marqueur du point de départ
        L.marker([r.geo_point_2d.lat, r.geo_point_2d.lon], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <strong>${numero}. ${r.nom}</strong><br/>
            Distance : ${r.distance_km} km<br/>
            Difficulté : ${r.difficulte ?? "-"}
          `);

        // Tracé de l'itinéraire (Polyline)
        const geometry = r.geo_shape?.geometry?.geometries?.[0] || r.geo_shape?.geometry;
        if (geometry?.type === "LineString") {
          // Leaflet utilise [lat, lng] alors que GeoJSON utilise [lng, lat]
          const path = geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
          
          L.polyline(path, {
            color: "#16a34a",
            weight: 4,
            opacity: 0.7,
          }).addTo(map);
        }
      });

      setIsReady(true);
    };

    initMap();

    // Cleanup au démontage du composant
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [randos]);

  if (loading) return <p className="p-4">Chargement des randonnées…</p>;
  if (!randos.length) return <p className="p-4">Aucune randonnée disponible.</p>;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-6 text-center text-green-800">
        🚴‍♂️ Randonnées vélo à Toulouse
      </h1>

      <div
        ref={mapRef}
        style={{ height: "60vh", width: "100%", zIndex: 0 }}
        className="mb-8 border-4 border-green-200 rounded-xl bg-gray-50 relative overflow-hidden"
      >
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            Chargement de la carte...
          </div>
        )}
      </div>

      <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-300">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-green-100">
              <th className="border p-2">#</th>
              <th className="border p-2 text-left">Nom</th>
              <th className="border p-2">Distance (km)</th>
              <th className="border p-2">Difficulté</th>
              <th className="border p-2">Plus d'infos</th>
            </tr>
          </thead>
          <tbody>
            {randos.map((r, i) => (
              <tr key={`${r.nom}-${i}`} className="hover:bg-green-50 transition-colors">
                <td className="border p-2 text-center font-bold">{i + 1}</td>
                <td className="border p-2">{r.nom}</td>
                <td className="border p-2 text-center">{r.distance_km}</td>
                <td className="border p-2 text-center">{r.difficulte ?? "-"}</td>
                <td className="border p-2 text-center">
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