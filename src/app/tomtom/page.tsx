"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// React-Leaflet dynamiques
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);

interface TrafficData {
  flowSegmentData?: {
    currentSpeed: number;
    freeFlowSpeed: number;
    currentTravelTime: number;
    freeFlowTravelTime: number;
  };
}

export default function TomTomTrafficPage() {
  const [traffic, setTraffic] = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTraffic = async () => {
      try {
        const res = await fetch("/api/tomtom");
        const data = await res.json();
        setTraffic(data);
      } catch (err) {
        console.error("Erreur trafic :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTraffic();
  }, []);

  const tomtomKey = process.env.NEXT_PUBLIC_TOMTOM_KEY;

  return (
    <main className="p-8 bg-white min-h-screen text-black font-sans">
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

      <h1 className="text-3xl font-bold mb-6 border-b pb-2 italic text-blue-600">
        🚗 Trafic en temps réel - Toulouse
      </h1>

      {/* Carte TomTom + Traffic */}
      <div
        className="h-[500px] w-full rounded-2xl mb-8 border border-gray-200 overflow-hidden shadow-md"
        style={{ zIndex: 1 }}
      >
        {typeof window !== "undefined" && tomtomKey && (
          <MapContainer
            center={[43.6045, 1.444]}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
          >
            {/* Fond TomTom */}
            <TileLayer
              url={`https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${tomtomKey}`}
            />

            {/* Couche trafic temps réel */}
            <TileLayer
              url={`https://api.tomtom.com/map/1/tile/flowTile/flow/{z}/{x}/{y}.png?key=${tomtomKey}`}
              opacity={0.7}
            />
          </MapContainer>
        )}
      </div>

      {/* Bloc données trafic */}
      <div className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100 max-w-xl">
        {loading && <p>Chargement des données trafic...</p>}

        {!loading && traffic?.flowSegmentData && (
          <div className="space-y-2">
            <p>
              <strong>Vitesse actuelle :</strong>{" "}
              {traffic.flowSegmentData.currentSpeed} km/h
            </p>
            <p>
              <strong>Vitesse fluide :</strong>{" "}
              {traffic.flowSegmentData.freeFlowSpeed} km/h
            </p>
            <p>
              <strong>Temps réel :</strong>{" "}
              {traffic.flowSegmentData.currentTravelTime} sec
            </p>
            
<p className="flex items-center gap-2">
  <strong>État :</strong>

  {traffic.flowSegmentData.currentSpeed <
  traffic.flowSegmentData.freeFlowSpeed ? (
    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
      🔴 Ralentissement
    </span>
  ) : (
    <span className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
      🔵 Fluide
    </span>
  )}
</p>

          </div>
        )}

        {!loading && !traffic?.flowSegmentData && (
          <p>Aucune donnée trafic disponible.</p>
        )}
      </div>
    </main>
  );
}
