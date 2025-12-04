"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface Person {
name: string;
birthDeath?: string;
role?: string;
description?: string;
cemetery?: string;
division?: string;
section?: string;
}

export default function VisiteCimetierePage() {
const mapRef = useRef<HTMLDivElement | null>(null);
const mapInstance = useRef<google.maps.Map | null>(null);
const [people, setPeople] = useState<Person[]>([]);
const [isReady, setIsReady] = useState(false);

// Charger les données depuis l'API
useEffect(() => {
fetch("/api/visitecimetiere")
.then((res) => res.json())
.then((data: Person[]) => setPeople(data))
.catch(console.error);
}, []);

// Affichage de la carte et des marqueurs
useEffect(() => {
if (!isReady || !mapRef.current) return;

```
mapInstance.current = new google.maps.Map(mapRef.current, {
  zoom: 14,
  center: { lat: 43.5875, lng: 1.448 }, // quartier de la Colonne
  scrollwheel: true,
  gestureHandling: "greedy",
});

const geocoder = new google.maps.Geocoder();

people.forEach((p, i) => {
  const address = `${p.cemetery}, Toulouse`;
  geocoder.geocode({ address }, (results, status) => {
    if (status !== "OK" || !results?.[0]) return;

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
    });

    const content = `
      <strong>${i + 1}. ${p.name}</strong><br>
      ${p.birthDeath ? `(${p.birthDeath})<br>` : ""}
      ${p.role ? `${p.role}<br>` : ""}
      ${p.description ? `${p.description}<br>` : ""}
      ${p.cemetery ? `Cimetière: ${p.cemetery}<br>` : ""}
      ${p.section ? `Section: ${p.section}<br>` : ""}
      ${p.division ? `Division: ${p.division}` : ""}
    `;

    const infowindow = new google.maps.InfoWindow({ content });
    marker.addListener("click", () => infowindow.open(mapInstance.current, marker));
  });
});
```

}, [isReady, people]);

return ( <div className="p-4 max-w-6xl mx-auto">
{/* Chargement de l'API Google Maps */}
<Script
src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
strategy="afterInteractive"
onLoad={() => setIsReady(true)}
/>

```
  <h1 className="text-3xl font-extrabold mb-6">
    🏛️ Carte : Cimetières Hérédia, Salonique et Terre-Cabade
  </h1>

  <div
    ref={mapRef}
    style={{ height: "70vh", width: "100%" }}
    className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center"
  >
    {!isReady && <p>Chargement de la carte…</p>}
  </div>

  <h2 className="text-2xl font-semibold mb-4">
    Liste des personnalités ({people.length})
  </h2>

  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {people.map((p, i) => (
      <li key={i} className="p-4 border rounded bg-white shadow">
        <p className="text-lg font-bold">{i + 1}. {p.name}</p>
        {p.birthDeath && <p>Date: {p.birthDeath}</p>}
        {p.role && <p>Rôle: {p.role}</p>}
        {p.description && <p>Description: {p.description}</p>}
        {p.cemetery && <p>Cimetière: {p.cemetery}</p>}
        {p.section && <p>Section: {p.section}</p>}
        {p.division && <p>Division: {p.division}</p>}
      </li>
    ))}
  </ul>
</div>
```

);
}
