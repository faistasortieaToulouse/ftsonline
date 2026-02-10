"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface Establishment {
  name: string;
  address: string;
  lat?: number;
  lng?: number;
}

const ST_MICHEL_CENTER: [number, number] = [43.5925, 1.444];

export default function VisiteSaintMichelPage() {
  // ----------------------------------------------------
  // 1. ÉTATS ET RÉFÉRENCES
  // ----------------------------------------------------
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [L, setL] = useState<any>(null);

  // ----------------------------------------------------
  // 2. RÉCUPÉRATION DES DONNÉES
  // ----------------------------------------------------
  useEffect(() => {
    fetch("/api/visitesaintmichel")
      .then((res) => res.json())
      .then((data: Establishment[]) => {
        setEstablishments(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur API:", err);
        setLoading(false);
      });
  }, []);

  // ----------------------------------------------------
  // 3. INITIALISATION LEAFLET
  // ----------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || loading) return;

    const initMap = async () => {
      const Leaflet = (await import("leaflet")).default;
      setL(Leaflet);

      if (mapInstance.current) return;

      mapInstance.current = Leaflet.map(mapRef.current!).setView(ST_MICHEL_CENTER, 15);

      Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapInstance.current);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [loading]);

  // ----------------------------------------------------
  // 4. MARQUEURS (SANS GÉOCODAGE)
  // ----------------------------------------------------
  useEffect(() => {
    if (!L || !mapInstance.current || establishments.length === 0) return;

    establishments.forEach((est, i) => {
      if (est.lat === undefined || est.lng === undefined) return;

      const id = i + 1;
      const customIcon = L.divIcon({
        className: "custom-marker-stmichel",
        html: `
          <div style="
            background-color: #ef4444;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid black;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 11px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">
            ${id}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([est.lat, est.lng], { icon: customIcon })
        .addTo(mapInstance.current!)
        .bindPopup(`<strong>${id}. ${est.name}</strong>`);

      marker.on("click", () => {
        mapInstance.current.setView([est.lat, est.lng], 16);
        // Scroll fluide vers l'élément de la liste
        document.getElementById(`est-item-${id}`)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    });
  }, [L, establishments]);

  // ----------------------------------------------------
  // 5. RENDU
  // ----------------------------------------------------
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <nav className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-6 text-slate-900">
        🏛️ Visite Saint-Michel — Parcours historique ({establishments.length} Lieux)
      </h1>

      {/* Conteneur Carte */}
      <div
        ref={mapRef}
        style={{ height: "65vh", width: "100%" }}
        className="mb-8 border-4 border-slate-200 rounded-xl bg-gray-100 flex items-center justify-center relative z-0 overflow-hidden shadow-xl"
      >
        {loading && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-bold">Chargement de la carte…</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-slate-800">
        Liste des lieux de visite
      </h2>

      {/* Liste en Grille simple */}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {establishments.map((est, i) => {
          const id = i + 1;
          return (
            <li
              key={i}
              id={`est-item-${id}`}
              className="p-5 border border-slate-200 rounded-xl bg-white shadow hover:shadow-lg transition-all flex flex-col justify-center"
            >
              <div className="flex justify-between items-start">
                <p className="text-lg font-bold text-slate-900">
                  <span className="text-red-600 mr-2">{id}.</span> {est.name}
                </p>
              </div>
              <p className="text-sm italic text-slate-600 mt-1">
                📍 {est.address}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
