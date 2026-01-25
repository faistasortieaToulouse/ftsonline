'use client';

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface MuseePlace {
  id: number;
  nomLieu: string;
  catégorie: string;
  num: string;
  typeRue: string;
  nomRue: string;
  site: string;
  quartier: string;
  établissement: string;
  sigles: string;
  signification: string;
  ville: string; // ✅ Toulouse ou Banlieue
}

type GroupedPlaces = Record<string, MuseePlace[]>;

export default function MuseesToulousePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  const [places, setPlaces] = useState<MuseePlace[]>([]);
  const [isReady, setIsReady] = useState(false);

  // --- Chargement des données ---
  useEffect(() => {
    fetch('/api/museestoulouse')
      .then(res => res.json())
      .then((data: MuseePlace[]) => {
        data.sort((a, b) => a.catégorie.localeCompare(b.catégorie));
        setPlaces(data);
      })
      .catch(console.error);
  }, []);

  // --- Google Maps ---
  useEffect(() => {
    if (!isReady || !mapRef.current || places.length === 0) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 12,
      center: { lat: 43.6045, lng: 1.444 },
      scrollwheel: true,
      gestureHandling: 'greedy',
    });

    const geocoder = new google.maps.Geocoder();

    places.forEach((place, i) => {
      if (!place.nomRue || place.nomRue === 'Divers') return;

      const numero = place.num && place.num !== '0' ? `${place.num} ` : '';
      const ville = place.ville && place.ville !== 'Toulouse'
        ? place.ville
        : 'Toulouse';

      const adresse = `${numero}${place.typeRue} ${place.nomRue}, ${ville}`;

      setTimeout(() => {
        geocoder.geocode({ address: adresse }, (results, status) => {
          if (status !== 'OK' || !results?.[0]) return;

          const isBanlieue = place.ville !== 'Toulouse';

          const marker = new google.maps.Marker({
            map: mapInstance.current!,
            position: results[0].geometry.location,
            label: `${place.id}`,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 9,
              fillColor: isBanlieue ? 'green' : 'red', // ✅ Couleur
              fillOpacity: 1,
              strokeWeight: 1,
              strokeColor: 'black',
            },
            title: place.nomLieu,
          });

          const infowindow = new google.maps.InfoWindow({
            content: `
              <strong>${place.id}. ${place.nomLieu}</strong><br/>
              ${numero}${place.typeRue} ${place.nomRue}<br/>
              <em>${place.ville}</em><br/>
              Catégorie : <strong>${place.catégorie}</strong><br/>
              ${place.signification ? `<a href="${place.signification}" target="_blank">Site officiel</a>` : ''}
            `,
          });

          marker.addListener('click', () => infowindow.open(mapInstance.current, marker));
        });
      }, i * 250);
    });
  }, [isReady, places]);

  // --- Regroupement par catégorie ---
  const groupedPlaces: GroupedPlaces = places.reduce((acc, place) => {
    acc[place.catégorie] = acc[place.catégorie] || [];
    acc[place.catégorie].push(place);
    return acc;
  }, {} as GroupedPlaces);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <h1 className="text-3xl font-extrabold mb-2 text-indigo-700">

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

        🏛️ Musées & sites d'exposition de Toulouse et sa banlieue ({places.length})
      </h1>

      <p className="mb-4 text-gray-600">
        🔴 Toulouse : {places.filter(p => p.ville === 'Toulouse').length} — 🟢 Banlieue : {places.filter(p => p.ville !== 'Toulouse').length}
      </p>

      <div
        ref={mapRef}
        style={{ height: '70vh', width: '100%' }}
        className="mb-8 border rounded-lg bg-gray-100"
      />

      <div className="space-y-12">
        {Object.entries(groupedPlaces).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-indigo-400">
              {category} ({items.length})
            </h2>

            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(place => (
                <li
                  key={place.id}
                  className={`p-4 bg-white rounded-lg shadow border-2 ${place.ville !== 'Toulouse' ? 'border-green-500' : 'border-red-500'}`}
                >
                  <p className={`font-bold text-lg ${place.ville !== 'Toulouse' ? 'text-blue-600' : 'text-gray-800'}`}>
                    <span className={`mr-2 font-bold ${place.ville !== 'Toulouse' ? 'text-green-600' : 'text-red-600'}`}>
                      {place.id}.
                    </span>
                    {place.nomLieu}
                  </p>
                  <p className="text-sm text-gray-600">
                    {place.num && place.num !== '0' ? place.num + ' ' : ''}
                    {place.typeRue} {place.nomRue}
                  </p>
                  <p className="text-sm italic">{place.ville}</p>
                  {place.signification && (
                    <a
                      href={place.signification}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 text-xs"
                    >
                      Site →
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
