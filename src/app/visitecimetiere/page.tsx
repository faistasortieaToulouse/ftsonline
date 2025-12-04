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

// Sections et divisions de la liste avec coordonnées approximatives
const cemeterySections: Record<string, Record<string, { lat: number; lng: number }>> = {
"Salonique": {
"2-11": { lat: 43.6098, lng: 1.4645 },
"7-1": { lat: 43.6097, lng: 1.4647 },
"7-4": { lat: 43.6096, lng: 1.4648 },
"7-5": { lat: 43.6095, lng: 1.4649 },
"7-6": { lat: 43.6094, lng: 1.4650 },
"7-7": { lat: 43.6093, lng: 1.4651 },
"7-9": { lat: 43.6092, lng: 1.4652 },
"7-10": { lat: 43.6091, lng: 1.4653 },
"7-18": { lat: 43.6089, lng: 1.4654 },
"8-1": { lat: 43.6088, lng: 1.4655 },
"8-7": { lat: 43.6087, lng: 1.4656 },
"8-7b": { lat: 43.6086, lng: 1.4657 },
},
"Terre-Cabade": {
"1-1": { lat: 43.6080, lng: 1.4640 },
"1-2": { lat: 43.6081, lng: 1.4641 },
"1-3": { lat: 43.6082, lng: 1.4642 },
"1-4": { lat: 43.6083, lng: 1.4643 },
"1-5": { lat: 43.6084, lng: 1.4644 },
"1-7": { lat: 43.6085, lng: 1.4645 },
"1-8": { lat: 43.6086, lng: 1.4646 },
"1-9": { lat: 43.6087, lng: 1.4647 },
"1-12": { lat: 43.6088, lng: 1.4648 },
"1-14": { lat: 43.6089, lng: 1.4649 },
"1-19": { lat: 43.6090, lng: 1.4650 },
"2-1": { lat: 43.6091, lng: 1.4651 },
"2-2": { lat: 43.6092, lng: 1.4652 },
"2-3": { lat: 43.6093, lng: 1.4653 },
"2-5": { lat: 43.6094, lng: 1.4654 },
"2-6": { lat: 43.6095, lng: 1.4655 },
"2-11": { lat: 43.6096, lng: 1.4656 },
"3-2": { lat: 43.6097, lng: 1.4657 },
"3-7": { lat: 43.6098, lng: 1.4658 },
"3-8": { lat: 43.6099, lng: 1.4659 },
"3-10": { lat: 43.6100, lng: 1.4660 },
"3-11": { lat: 43.6101, lng: 1.4661 },
"3-12": { lat: 43.6102, lng: 1.4662 },
"4-7": { lat: 43.6103, lng: 1.4663 },
"4-15": { lat: 43.6104, lng: 1.4664 },
"5-4": { lat: 43.6105, lng: 1.4665 },
"5-16": { lat: 43.6106, lng: 1.4666 },
"5-17": { lat: 43.6107, lng: 1.4667 },
"5-23": { lat: 43.6108, lng: 1.4668 },
"5-24": { lat: 43.6109, lng: 1.4669 },
"6-1": { lat: 43.6110, lng: 1.4670 },
"6-5": { lat: 43.6111, lng: 1.4671 },
"6-7": { lat: 43.6112, lng: 1.4672 },
"6-13": { lat: 43.6113, lng: 1.4673 },
"A-2": { lat: 43.6114, lng: 1.4674 },
"F-11": { lat: 43.6115, lng: 1.4675 },
"G-0": { lat: 43.6116, lng: 1.4676 },
"K-18": { lat: 43.6117, lng: 1.4677 },
"L-27": { lat: 43.6118, lng: 1.4678 },
},
"Hérédia": {
// ajouter si nécessaire
},
};

useEffect(() => {
fetch("/api/visitecimetiere")
.then((res) => res.json())
.then((data: Person[]) => setPeople(data))
.catch(console.error);
}, []);

useEffect(() => {
if (!isReady || !mapRef.current) return;

mapInstance.current = new google.maps.Map(mapRef.current, {
  zoom: 16,
  center: { lat: 43.6093, lng: 1.4652 },
  scrollwheel: true,
  gestureHandling: "greedy",
});

people.forEach((p, i) => {
  let position = { lat: 43.6093, lng: 1.4652 }; // fallback
  if (p.cemetery && p.division && p.section) {
    const key = `${p.division}-${p.section}`;
    if (cemeterySections[p.cemetery]?.[key]) {
      position = cemeterySections[p.cemetery][key];
    }
  }

  const marker = new google.maps.Marker({
    map: mapInstance.current!,
    position,
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

}, [isReady, people]);

return ( <div className="p-4 max-w-6xl mx-auto">
<Script
src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
strategy="afterInteractive"
onLoad={() => setIsReady(true)}
/>

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

);
}
