'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Quartier {
  id: number;
  nom: string;
  lat: number; // latitude
  lng: number; // longitude
  numero?: number; // optionnel, tu peux garder id comme numéro
}

export default function QuartiersToulouseMapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  const [quartiers, setQuartiers] = useState<Quartier[]>([]);
  const [isReady, setIsReady] = useState(false);

  // --- Charger les données ---
  useEffect(() => {
    fetch('/api/quartiertoulouse')
      .then(res => res.json())
      .then(data => setQuartiers(data))
      .catch(console.error);
  }, []);

  // --- Initialisation de la carte ---
  useEffect(() => {
    if (!isReady || !mapRef.current || quartiers.length === 0) return;

    // Centrer sur le premier quartier si disponible
    const center = {
      lat: quartiers[0].lat || 43.6045,
      lng: quartiers[0].lng || 1.444,
    };

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 12,
      center,
      scrollwheel: true,
      gestureHandling: 'greedy',
    });

    // Ajouter les markers
    quartiers.forEach((quartier, i) => {
      if (typeof quartier.lat !== 'number' || typeof quartier.lng !== 'number') return;

      const marker = new google.maps.Marker({
        map: mapInstance.current!,
        position: { lat: quartier.lat, lng: quartier.lng },
        label: `${i + 1}`,
        title: quartier.nom,
      });

      const infowindow = new google.maps.InfoWindow({
        content: `
          <strong>${i + 1}. ${quartier.nom}</strong><br>
          Quartier n°${quartier.id}
        `,
      });

      marker.addListener('click', () =>
        infowindow.open(mapInstance.current!, marker)
      );
    });
  }, [isReady, quartiers]);

  return (
    <div className="p-4 max-w-7xl mx-auto">

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      {/* Script Google Maps */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <h1 className="text-3xl font-extrabold mb-6">
        🗺️ Quartiers de Toulouse sur la carte
      </h1>

      <div
        ref={mapRef}
        style={{ height: '70vh', width: '100%' }}
        className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center"
      >
        {!isReady && <p>Chargement de la carte…</p>}
      </div>

      <h2 className="text-2xl font-semibold mb-4">
        Liste des quartiers ({quartiers.length})
      </h2>

      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {quartiers.map((q, i) => (
          <li key={q.id} className="p-4 border rounded-lg bg-white shadow">
            <div className="text-sm text-gray-500 font-semibold">
              Quartier n°{q.id}
            </div>
            <div className="text-lg font-bold">{q.nom}</div>
            <div className="text-xs text-gray-400">
              {q.lat}, {q.lng}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
