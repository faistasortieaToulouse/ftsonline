"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface ResistancePlace {
  nom: string;
  num: string;
  type_rue: string;
  nom_rue: string;
  appartient: string;
  site: string;
  quartier: string;
  etablissement: string;
  sigles: string;
  signification: string;
}

export default function VisiteResistancePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [places, setPlaces] = useState<ResistancePlace[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetch("/api/visiteresistance")
      .then((res) => res.json())
      .then((data: ResistancePlace[]) => setPlaces(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 14,
      center: { lat: 43.6045, lng: 1.444 }, // Toulouse
      scrollwheel: true,
      gestureHandling: "greedy",
    });

    const geocoder = new google.maps.Geocoder();

    places.forEach((place, i) => {
      const adresse = `Toulouse ${place.num} ${place.type_rue} ${place.nom_rue}`;
      geocoder.geocode({ address: adresse }, (results, status) => {
        if (status !== "OK" || !results?.[0]) return;

        const marker = new google.maps.Marker({
          map: mapInstance.current!,
          position: results[0].geometry.location,
          label: `${i + 1}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: place.appartient === "résistance" ? "green" : "red",
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: "black",
          },
          title: place.nom, // TITRE = nom
        });

        const infowindow = new google.maps.InfoWindow({
          content: `
            <strong>${i + 1}. ${place.nom}</strong><br>
            Établissement : ${place.établissement}<br>
            Adresse : ${place.num} ${place.type_rue} ${place.nom_rue}<br>
            Quartier : ${place.quartier}<br>
            Site : ${place.site}<br>
            Sigles : ${place.sigles || ""}<br>
            Signification : ${place.signification || ""}<br>
            Appartient : ${place.appartient}
          `,
        });

        marker.addListener("click", () => infowindow.open(mapInstance.current, marker));
      });
    });
  }, [isReady, places]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <h1 className="text-3xl font-extrabold mb-6">
        🏛️ Visite Résistance — Toulouse
      </h1>

      <div
        ref={mapRef}
        style={{ height: "70vh", width: "100%" }}
        className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center"
      >
        {!isReady && <p>Chargement de la carte…</p>}
      </div>

      <h2 className="text-2xl font-semibold mb-4">
        Liste des lieux ({places.length})
      </h2>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {places.map((place, i) => (
          <li key={i} className="p-4 border rounded bg-white shadow">
            <p className="text-lg font-bold">
              {i + 1}. {place.nom} {/* NOM affiché en titre */}
            </p>
            <p>Établissement : {place.établissement}</p>
            <p>Adresse : {place.num} {place.type_rue} {place.nom_rue}</p>
            <p>Quartier : {place.quartier}</p>
            <p>Site : {place.site}</p>
            <p>Sigles : {place.sigles || "-"}</p>
            <p>Signification : {place.signification || "-"}</p>
            <p>Appartient : {place.appartient}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
