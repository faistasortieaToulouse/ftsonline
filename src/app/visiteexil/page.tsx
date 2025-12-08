'use client';

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface Monument {
  nom: string;
  numero: string | number;
  voie: string;
  rue: string;
  type: string;
  note: string;
}

export default function VisiteMonumentPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [places, setPlaces] = useState<Monument[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetch("/api/visitemonument")
      .then(async (res) => {
        const text = await res.text();
        try {
          const data: Monument[] = JSON.parse(text);
          setPlaces(data);
        } catch (err) {
          console.error("Erreur JSON /api/visitemonument :", text, err);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!isReady || !mapRef.current || places.length === 0) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 13.5,
      center: { lat: 43.6045, lng: 1.444 },
      scrollwheel: true,
      gestureHandling: "greedy",
    });

    const geocoder = new google.maps.Geocoder();

    places.forEach((place, i) => {
      if (!place.rue) return;

      const numero = place.numero && place.numero !== 0 ? `${place.numero} ` : "";
      const adresse = `Toulouse, ${numero}${place.voie} ${place.rue}`;

      setTimeout(() => {
        geocoder.geocode({ address: adresse }, (results, status) => {
          if (status !== "OK" || !results?.[0]) {
            console.warn(`Adresse non trouvée: "${adresse}" — status: ${status}`);
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
            title: place.nom,
          });

          const infowindow = new google.maps.InfoWindow({
            content: `
              <strong>${i + 1}. ${place.nom}</strong><br>
              ${numero}${place.voie} ${place.rue}<br>
              Type : ${place.type}<br>
              Note : ${place.note || ""}
            `,
          });

          marker.addListener("click", () => infowindow.open(mapInstance.current, marker));
        });
      }, i * 200);
    });
  }, [isReady, places]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&async=1`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <h1 className="text-3xl font-extrabold mb-6">🗺️ Monuments militaires & quartiers</h1>

      <div
        ref={mapRef}
        style={{ height: "70vh", width: "100%" }}
        className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center"
      >
        {!isReady && <p>Chargement de la carte…</p>}
      </div>

      <h2 className="text-2xl font-semibold mb-4">Liste des lieux ({places.length})</h2>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {places.map((place, i) => (
          <li key={i} className="p-4 border rounded bg-white shadow">
            <p className="text-lg font-bold">{i + 1}. {place.nom}</p>
            <p className="italic">{place.numero} {place.voie} {place.rue}</p>
            <p>Type : {place.type}</p>
            {place.note && <p>Note : {place.note}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
