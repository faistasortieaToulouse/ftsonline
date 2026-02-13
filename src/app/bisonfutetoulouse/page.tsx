'use client';

import React, { useEffect, useState, useRef } from 'react';
import "leaflet/dist/leaflet.css";
import { ArrowLeft, ExternalLink, Loader2, Search } from "lucide-react";
import Link from "next/link";

// CENTRE DE TOULOUSE
const TOULOUSE_CENTER: [number, number] = [43.6045, 1.444];
const THEME_COLOR = '#d97706'; // couleur par défaut si nécessaire

// Type de données trafic
interface TraficPoint {
  id: string;
  road: string;
  lat: number;
  lon: number;
  status: string; // fluide / dense / bouchon
  speed?: number;
}

export default function BisonFuteToulousePage() {
  const [trafic, setTrafic] = useState<TraficPoint[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1️⃣ Récupération des données trafic
  useEffect(() => {
    async function fetchTrafic() {
      try {
        const res = await fetch('/api/bisonfutetoulouse');
        if (!res.ok) throw new Error("Erreur réseau");
        const data: TraficPoint[] = await res.json();
        setTrafic(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchTrafic();
  }, []);

  // 2️⃣ Filtrage par route si recherche
  const filteredTrafic = trafic.filter(t =>
    t.road.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 3️⃣ Initialisation de la carte
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData) return;
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current!).setView(TOULOUSE_CENTER, 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);

      markersGroupRef.current = L.layerGroup().addTo(mapInstance.current);
      setIsMapReady(true);
    };
    initMap();
  }, [isLoadingData]);

  // 4️⃣ Mise à jour des marqueurs
  useEffect(() => {
    if (!isMapReady || !mapInstance.current) return;
    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      markersGroupRef.current.clearLayers();

      filteredTrafic.forEach((t, i) => {
        const color =
          t.status === "fluide" ? "green" :
          t.status === "dense" ? "orange" :
          t.status === "bouchon" ? "red" : THEME_COLOR;

        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white;"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        L.marker([t.lat, t.lon], { icon: customIcon })
          .bindPopup(`
            <strong>${t.road}</strong><br/>
            État : ${t.status}<br/>
            Vitesse : ${t.speed ?? "-"} km/h
          `)
          .addTo(markersGroupRef.current);
      });
    };
    updateMarkers();
  }, [isMapReady, filteredTrafic]);

  if (error) return <div className="p-10 text-red-700 text-center font-bold italic">Erreur : {error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 bg-slate-50 min-h-screen">
      <nav className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-amber-700 font-bold hover:underline">
          <ArrowLeft size={18} /> Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight italic">
          🛣️ Trafic routier Toulouse / Haute-Garonne
        </h1>
        <p className="text-slate-600 mt-1 font-medium italic">
          {isLoadingData ? 'Chargement...' : `${filteredTrafic.length} points de trafic.`}
        </p>
      </header>

      {/* Barre de recherche */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Rechercher une route ou voie..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none shadow-sm transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Carte Leaflet */}
      <div
        ref={mapRef}
        className="mb-8 border rounded-2xl bg-gray-100 shadow-inner overflow-hidden h-[50vh] md:h-[70vh] relative"
        style={{ zIndex: 0 }}
      >
        {!isMapReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 z-10">
            <Loader2 className="animate-spin h-8 w-8 text-violet-600 mb-2" />
            <p className="text-slate-500 animate-pulse text-sm">Chargement de la carte…</p>
          </div>
        )}
      </div>
    </div>
  );
}
