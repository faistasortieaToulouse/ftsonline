"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Script from "next/script";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Voie {
  id: number;
  libelle: string;
  libelle_occitan?: string | null;
  quartier: string;
  territoire: string;
  complement?: string | null;
  complement_occitan?: string | null;
  sti: number;
  wikipedia?: string | null;
}

export default function VoiesPage() {
  const [voies, setVoies] = useState<Voie[]>([]);
  const [search, setSearch] = useState("");
  const [selectedVoie, setSelectedVoie] = useState<Voie | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  /* ================= SCROLL TO MAP ================= */
  const scrollToMap = () => {
    mapRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /* ================= DATA ================= */
  useEffect(() => {
    fetch("/api/voiesmap")
      .then(res => res.json())
      .then(setVoies)
      .catch(console.error);
  }, []);

  /* ================= MAP INIT ================= */
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      center: { lat: 43.6045, lng: 1.444 }, // Toulouse
      zoom: 13,
      gestureHandling: "greedy",
    });
  }, [isMapReady]);

  /* ================= GEOLOC CLICK ================= */
  useEffect(() => {
    if (!selectedVoie || !mapInstance.current) return;

    const geocoder = new google.maps.Geocoder();
    const address = `${selectedVoie.libelle}, Toulouse, France`;

    geocoder.geocode({ address }, (results, status) => {
      if (status !== "OK" || !results?.[0]) return;

      const location = results[0].geometry.location;

      mapInstance.current!.setCenter(location);
      mapInstance.current!.setZoom(16);

      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      markerRef.current = new google.maps.Marker({
        map: mapInstance.current!,
        position: location,
        title: selectedVoie.libelle,
      });
    });
  }, [selectedVoie]);

  /* ================= FILTER ================= */
  const filteredVoies = useMemo(
    () =>
      voies.filter(v =>
        v.libelle.toLowerCase().includes(search.toLowerCase()) ||
        v.libelle_occitan?.toLowerCase().includes(search.toLowerCase()) ||
        v.quartier.toLowerCase().includes(search.toLowerCase())
      ),
    [search, voies]
  );

  /* ================= STATS ================= */
  const totalQuartiers = useMemo(
    () => new Set(voies.map(v => v.quartier)).size,
    [voies]
  );

  const totalTerritoires = useMemo(
    () => new Set(voies.map(v => v.territoire)).size,
    [voies]
  );

  const totalOrigines = useMemo(
    () => voies.filter(v => v.complement || v.complement_occitan).length,
    [voies]
  );

  const totalWikipedia = useMemo(
    () => voies.filter(v => v.wikipedia).length,
    [voies]
  );

  return (
    <div className="p-4 max-w-7xl mx-auto">

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      {/* ================= MAP SCRIPT ================= */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setIsMapReady(true)}
      />

      <h1 className="text-3xl font-extrabold mb-6 text-center text-purple-800">
        🛣️ Nomenclature des voies de Toulouse
      </h1>

      {/* ================= SEARCH ================= */}
      <input
        type="text"
        placeholder="Rechercher une voie, un quartier, un nom occitan…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 mb-6 border rounded-lg shadow-sm"
      />

      {/* ================= STATS ================= */}
      <div className="mb-6 text-sm text-gray-600 space-y-1">
        <p>Total voies : {voies.length}</p>
        <p>Voies affichées : {filteredVoies.length}</p>
        <p>Quartiers uniques : {totalQuartiers}</p>
        <p>Territoires uniques : {totalTerritoires}</p>
        <p>Voies avec origine du nom : {totalOrigines}</p>
        <p>Voies avec résumé Wikipédia : {totalWikipedia}</p>
      </div>

      {/* ================= MAP ================= */}
      <div
        ref={mapRef}
        id="map"
        className="mb-10 h-[400px] w-full border rounded-lg bg-gray-100 flex items-center justify-center"
      >
        {!isMapReady && <p>Chargement de la carte…</p>}
      </div>

      {/* ================= LIST ================= */}
      <ul className="space-y-4">
        {filteredVoies.map((v, i) => (
          <li
            key={v.id}
            onClick={() => {
              setSelectedVoie(v);
              scrollToMap();
            }}
            className={`cursor-pointer p-5 border rounded-lg shadow transition
              ${
                selectedVoie?.id === v.id
                  ? "border-purple-500 bg-purple-50"
                  : "bg-white hover:shadow-lg hover:border-purple-300"
              }
            `}
          >
            <p className="text-lg font-bold text-purple-900">
              {i + 1}. {v.libelle}
            </p>

            {v.libelle_occitan && (
              <p className="italic text-purple-700">{v.libelle_occitan}</p>
            )}

            <p className="mt-2 text-sm">
              <strong>Quartier :</strong> {v.quartier}
              <br />
              <strong>Territoire :</strong> {v.territoire}
            </p>

            {(v.complement || v.complement_occitan) && (
              <div className="mt-3 pt-2 border-t text-sm">
                <p className="font-semibold text-purple-700">Origine du nom</p>
                {v.complement && <p>{v.complement}</p>}
                {v.complement_occitan && (
                  <p className="italic">{v.complement_occitan}</p>
                )}
              </div>
            )}

            {v.wikipedia && (
              <div className="mt-3 pt-2 border-t text-sm">
                <p className="font-semibold text-purple-700">Wikipédia</p>
                <p>{v.wikipedia}</p>
              </div>
            )}

            <p className="mt-2 text-xs text-gray-400">STI : {v.sti}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
