"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface Establishment {
  name: string;
  address: string;
  lat?: number; // Requis pour éviter le géocodage
  lng?: number; // Requis pour éviter le géocodage
}

const TOULOUSE_CENTER: [number, number] = [43.610, 1.444];

export default function VisiteRueToulousePage() {
  // ----------------------------------------------------
  // 1. ÉTATS ET RÉFÉRENCES
  // ----------------------------------------------------
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [L, setL] = useState<any>(null);
  const [openDetailsId, setOpenDetailsId] = useState<number | null>(null);

  const toggleDetails = (id: number) => {
    setOpenDetailsId((prevId) => (prevId === id ? null : id));
  };

  // ----------------------------------------------------
  // 2. RÉCUPÉRATION DES DONNÉES
  // ----------------------------------------------------
  useEffect(() => {
    fetch("/api/visiteruetoulouse")
      .then((res) => res.json())
      .then((data: Establishment[]) => {
        setEstablishments(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // ----------------------------------------------------
  // 3. INITIALISATION LEAFLET (MÉTHODE OTAN)
  // ----------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || loading) return;

    const initMap = async () => {
      const Leaflet = (await import("leaflet")).default;
      setL(Leaflet);

      if (mapInstance.current) return;

      mapInstance.current = Leaflet.map(mapRef.current!).setView(TOULOUSE_CENTER, 14);

      Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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
        className: "custom-marker-toulouse",
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
        toggleDetails(id);
        mapInstance.current.setView([est.lat, est.lng], 16);
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
        🏛️ Visite Rue Toulouse — Parcours historique ({establishments.length} Lieux)
      </h1>

      {/* Conteneur de la Carte */}
      <div
        ref={mapRef}
        style={{ height: "65vh", width: "100%" }}
        className="mb-8 border-4 border-slate-200 rounded-xl bg-gray-100 flex items-center justify-center relative z-0 overflow-hidden shadow-xl"
      >
        {loading && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Chargement de la carte...</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-slate-800">
        Liste des lieux détaillés
      </h2>

      {/* Liste des lieux avec Accordéon */}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {establishments.map((est, i) => {
          const id = i + 1;
          const isDetailsOpen = openDetailsId === id;

          return (
            <li
              key={i}
              id={`est-item-${id}`}
              className={`p-5 border rounded-xl transition-all duration-300 cursor-pointer flex flex-col ${
                isDetailsOpen
                  ? "bg-slate-50 border-blue-400 shadow-md ring-1 ring-blue-100"
                  : "bg-white border-slate-200 shadow hover:shadow-lg"
              }`}
              onClick={() => toggleDetails(id)}
            >
              <div className="flex justify-between items-start">
                <p className="text-lg font-bold text-slate-900">
                  <span className="text-red-600 mr-2">{id}.</span> {est.name}
                </p>
                {/* Triangle noir et gras */}
                <span
                  className={`text-xl text-black font-bold transition-transform duration-300 ${
                    isDetailsOpen ? "rotate-180" : "rotate-0"
                  }`}
                >
                  ▼
                </span>
              </div>

              <p className="text-sm italic text-slate-600 mt-1">📍 {est.address}</p>

              {isDetailsOpen && (
                <div className="mt-3 pt-3 border-t border-slate-200 animate-in fade-in slide-in-from-top-1 duration-300">
                  <p className="text-sm text-slate-700">
                    <span className="font-bold">Description :</span> Ce lieu fait partie intégrante du parcours historique de la ville de Toulouse.
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}