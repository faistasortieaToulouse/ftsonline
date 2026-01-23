'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Hotel {
  id: number;
  nom: string;
  adresse: string;
  profession_proprietaire: string;
  siecle: string;
  lat: number;
  lng: number;
}

export default function HotelsMapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isReady, setIsReady] = useState(false);

  // --- Charger les données ---
  useEffect(() => {
    fetch('/api/hotelsparticuliers')
      .then(res => res.json())
      .then(data => setHotels(data))
      .catch(console.error);
  }, []);

  // --- Carte Google Maps ---
  useEffect(() => {
    if (!isReady || !mapRef.current || hotels.length === 0) return;

    const center = {
      lat: hotels[0].lat || 43.6045,
      lng: hotels[0].lng || 1.444,
    };

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 14,
      center,
      scrollwheel: true,
      gestureHandling: 'greedy',
    });

    hotels.forEach((hotel, i) => {
      if (typeof hotel.lat !== 'number' || typeof hotel.lng !== 'number') return;

      const marker = new google.maps.Marker({
        map: mapInstance.current!,
        position: { lat: hotel.lat, lng: hotel.lng },
        label: `${i + 1}`,
        title: hotel.nom,
      });

      const infowindow = new google.maps.InfoWindow({
        content: `
          <strong>${i + 1}. ${hotel.nom}</strong><br>
          ${hotel.adresse}<br>
          Propriétaire : ${hotel.profession_proprietaire}<br>
          Siècle : ${hotel.siecle}ᵉ
        `,
      });

      marker.addListener('click', () =>
        infowindow.open(mapInstance.current!, marker)
      );
    });
  }, [isReady, hotels]);

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
        onLoad={() => setIsReady(true)}
      />

      <h1 className="text-3xl font-extrabold mb-6">
        🗺️ Hôtels particuliers de Toulouse
      </h1>

      <div
        ref={mapRef}
        style={{ height: '70vh', width: '100%' }}
        className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center"
      >
        {!isReady && <p>Chargement de la carte…</p>}
      </div>

      <h2 className="text-2xl font-semibold mb-4">
        Liste des hôtels ({hotels.length})
      </h2>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hotels.map((h, i) => (
          <li key={h.id} className="p-4 border rounded bg-white shadow">
            <p className="text-lg font-bold">
              {i + 1}. {h.nom}
            </p>
            <p className="italic">{h.adresse}</p>
            <p>Propriétaire : {h.profession_proprietaire}</p>
            <p>Siècle : {h.siecle}ᵉ</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
