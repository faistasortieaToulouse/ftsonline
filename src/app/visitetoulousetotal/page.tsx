'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

interface Lieu {
  id: number;
  numero: string;
  type_voie: string;
  nom_voie: string;
  description: string;
  lat: number;
  lng: number;
}

export default function VisiteToulouseTotalPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  const [lieux, setLieux] = useState<Lieu[]>([]);
  const [isReady, setIsReady] = useState(false);

  // --- Charger les données ---
  useEffect(() => {
    fetch('/api/visitetoulousetotal')
      .then(res => res.json())
      .then(data => setLieux(data))
      .catch(console.error);
  }, []);

  // --- Initialisation de la carte ---
  useEffect(() => {
    if (!isReady || !mapRef.current || lieux.length === 0) return;

    const center = {
      lat: lieux[0].lat || 43.6045,
      lng: lieux[0].lng || 1.444,
    };

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 15,
      center,
      scrollwheel: true,
      gestureHandling: 'greedy',
    });

    lieux.forEach((lieu, i) => {
      if (typeof lieu.lat !== 'number' || typeof lieu.lng !== 'number') return;

      const marker = new google.maps.Marker({
        map: mapInstance.current!,
        position: { lat: lieu.lat, lng: lieu.lng },
        label: `${i + 1}`,
        title: `${lieu.numero} ${lieu.type_voie} ${lieu.nom_voie}`,
      });

      const infowindow = new google.maps.InfoWindow({
        content: `
          <strong>${i + 1}. ${lieu.numero} ${lieu.type_voie} ${lieu.nom_voie}</strong><br>
          ${lieu.description}
        `,
      });

      marker.addListener('click', () =>
        infowindow.open(mapInstance.current!, marker)
      );
    });
  }, [isReady, lieux]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <h1 className="text-3xl font-extrabold mb-6">
        🗺️ Visite de Toulouse – Parcours sur les traces du passé : monuments actuels et disparus
      </h1>

      <div
        ref={mapRef}
        style={{ height: '70vh', width: '100%' }}
        className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center"
      >
        {!isReady && <p>Chargement de la carte…</p>}
      </div>

      <h2 className="text-2xl font-semibold mb-4">
        Lieux visités ({lieux.length})
      </h2>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lieux.map((l, i) => (
          <li key={l.id} className="p-4 border rounded bg-white shadow">
            <p className="text-lg font-bold">
              {i + 1}. {l.numero} {l.type_voie} {l.nom_voie}
            </p>
            <p className="italic">{l.description}</p>
            <p className="text-sm text-gray-500">
              {l.lat}, {l.lng}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
