"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Terminus {
  geo_point: { lon: number; lat: number };
  geo_shape: { type: string; geometry: { coordinates: [number, number]; type: string }; properties: {} };
  annee_reference: string;
  ref: string;
  nom: string;
  x_wgs84: number;
  y_wgs84: number;
}

export default function TerminusPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [terminus, setTerminus] = useState<Terminus[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const infoWindowsRef = useRef<Map<string, google.maps.InfoWindow>>(new Map());

  useEffect(() => {
    fetch("/api/terminus")
      .then(res => res.json())
      .then(data => {
        // Tri par nom alphabétique puis par année (SPECIAL à la fin)
        const sorted = data.sort((a: Terminus, b: Terminus) => {
          const nameCompare = (a.nom ?? "").localeCompare(b.nom ?? "");
          if (nameCompare !== 0) return nameCompare;

          const aYear = a.annee_reference === "SPECIAL" ? Infinity : parseInt(a.annee_reference);
          const bYear = b.annee_reference === "SPECIAL" ? Infinity : parseInt(b.annee_reference);
          return aYear - bYear;
        });
        setTerminus(sorted);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    map.current = new google.maps.Map(mapRef.current, {
      center: { lat: 43.6045, lng: 1.444 },
      zoom: 12,
      mapTypeId: "roadmap",
      gestureHandling: "greedy",
      scrollwheel: true,
    });
  }, [isMapReady]);

  useEffect(() => {
    if (!map.current || terminus.length === 0) return;

    terminus.forEach((t, index) => {
      const position = { lat: t.geo_point.lat, lng: t.geo_point.lon };

      // Marker avec numéro de ligne
      const marker = new google.maps.Marker({
        position,
        map: map.current!,
        title: `${t.nom} (${t.annee_reference})`,
        label: {
          text: `${index + 1}`,
          color: "white",
          fontSize: "12px",
          fontWeight: "bold",
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 20,
          fillColor: "#7c3aed",
          fillOpacity: 0.8,
          strokeWeight: 1,
          strokeColor: "#a78bfa",
        },
      });

      const info = new google.maps.InfoWindow({
        content: `<strong>${t.nom}</strong><br/>Année : ${t.annee_reference}<br/>Ref : ${t.ref}`,
      });

      marker.addListener("click", () => {
        info.open(map.current, marker);
      });

      const key = `${t.ref}-${t.annee_reference}-${index}`;
      markersRef.current.set(key, marker);
      infoWindowsRef.current.set(key, info);
    });
  }, [terminus, isMapReady]);

  const handleRowClick = (t: Terminus, index: number) => {
    const key = `${t.ref}-${t.annee_reference}-${index}`;
    const marker = markersRef.current.get(key);
    const info = infoWindowsRef.current.get(key);
    if (!map.current || !marker || !info) return;

    map.current.panTo(marker.getPosition()!);
    map.current.setZoom(15);
    info.open(map.current, marker);

    // Faire défiler vers la carte
    mapRef.current?.scrollIntoView({ behavior: "smooth" });
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
        🚌 Terminus des transports en commun à Toulouse
      </h1>

      <div ref={mapRef} className="h-[600px] w-full border rounded-lg bg-gray-100">
        {!isMapReady && <p className="p-4">Chargement de la carte…</p>}
      </div>

      {/* Tableau des terminus */}
      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-purple-100">
              <th className="border p-2">#</th>
              <th className="border p-2">Nom</th>
              <th className="border p-2">Année</th>
              <th className="border p-2">Ref</th>
            </tr>
          </thead>
          <tbody>
            {terminus.map((t, index) => (
              <tr
                key={`${t.ref}-${t.annee_reference}-${index}`}
                className="hover:bg-purple-50 cursor-pointer"
                onClick={() => handleRowClick(t, index)}
              >
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{t.nom}</td>
                <td className="border p-2">{t.annee_reference}</td>
                <td className="border p-2">{t.ref}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
