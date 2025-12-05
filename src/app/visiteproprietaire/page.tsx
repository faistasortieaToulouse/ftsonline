"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface Proprietaire {
  num: string;         // ex: "1, 3, 5, 7"
  type_voie: string;   // ex: "rue"
  nom_voie: string;    // ex: "Renforts"
  proprietaire: string; // nom du propriétaire -> utilisé comme title
  date: string;
  supplement: string;
  profession: string;
}

export default function VisiteProprietairePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [items, setItems] = useState<Proprietaire[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetch("/api/visiteproprietaire")
      .then((res) => res.json())
      .then((data: Proprietaire[]) => setItems(data))
      .catch((err) => {
        console.error("Erreur fetch /api/visiteproprietaire:", err);
      });
  }, []);

  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 15,
      center: { lat: 43.6005, lng: 1.4400 },
      scrollwheel: true,
      gestureHandling: "greedy",
    });

    const geocoder = new google.maps.Geocoder();

    items.forEach((p, i) => {
      // Construire l'adresse pour le geocoding (num peut être "1, 3, 5, 7")
      const address = `Toulouse ${p.num} ${p.type_voie} ${p.nom_voie}`;

      geocoder.geocode({ address }, (results, status) => {
        if (status !== "OK" || !results?.[0]) {
          // console.warn(`Geocode failed for ${address}: ${status}`);
          return;
        }

        const marker = new google.maps.Marker({
          map: mapInstance.current!,
          position: results[0].geometry.location,
          label: `${i + 1}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "red",
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: "black",
          },
          title: p.proprietaire,
        });

        const content = `
          <div style="font-family: Arial, sans-serif; line-height:1.25">
            <strong>${i + 1}. ${p.proprietaire}</strong><br/>
            <em>${p.num} ${p.type_voie} ${p.nom_voie}</em><br/>
            Profession : ${p.profession || "—"}<br/>
            Date : ${p.date || "—"}<br/>
            ${p.supplement ? `Supplément : ${p.supplement}<br/>` : ""}
          </div>
        `;

        const infowindow = new google.maps.InfoWindow({ content });
        marker.addListener("click", () => infowindow.open(mapInstance.current, marker));
      });
    });
  }, [isReady, items]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <h1 className="text-3xl font-extrabold mb-6">
        🏛️ Propriétaires historiques — Rue des Renforts
      </h1>

      <div
        ref={mapRef}
        style={{ height: "70vh", width: "100%" }}
        className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center"
      >
        {!isReady && <p>Chargement de la carte…</p>}
      </div>

      <h2 className="text-2xl font-semibold mb-4">
        Liste des propriétaires ({items.length})
      </h2>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((p, i) => (
          <li key={i} className="p-4 border rounded bg-white shadow">
            <p className="text-lg font-bold">
              {i + 1}. {p.proprietaire}
            </p>

            <p className="italic mb-1">
              {p.num} {p.type_voie} {p.nom_voie}
            </p>

            <p><strong>Profession :</strong> {p.profession || "—"}</p>
            <p><strong>Date :</strong> {p.date || "—"}</p>
            {p.supplement && <p><strong>Supplément :</strong> {p.supplement}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
