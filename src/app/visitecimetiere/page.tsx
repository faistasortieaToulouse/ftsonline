"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface Person {
name: string;
description?: string;
cemetery?: string;
section?: string;
division?: string;
address?: string; // format "Cimetière, Section, Division"
}

export default function VisiteCimetierePage() {
const mapRef = useRef<HTMLDivElement | null>(null);
const mapInstance = useRef<google.maps.Map | null>(null);
const markersRef = useRef<google.maps.Marker[]>([]);
const [people, setPeople] = useState<Person[]>([]);
const [isReady, setIsReady] = useState(false);
const [selectedCemetery, setSelectedCemetery] = useState<string>("Tous");

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
},
};

// Récupération des personnes depuis l'API
useEffect(() => {
fetch("/api/visitecimetiere")
.then(res => res.json())
.then((data: Person[]) => {
// Extraire cemetery, section, division depuis address si absent
const enriched = data.map(p => {
if (!p.cemetery && p.address) {
const [cem, sec, div] = p.address.split(",").map(s => s.trim());
return { ...p, cemetery: cem, section: sec, division: div };
}
return p;
});
setPeople(enriched);
})
.catch(console.error);
}, []);

// Initialisation de la carte et des markers
useEffect(() => {
if (!isReady || !mapRef.current) return;

// Créer la carte si elle n'existe pas encore
if (!mapInstance.current) {
  mapInstance.current = new google.maps.Map(mapRef.current, {
    zoom: 16,
    center: { lat: 43.6093, lng: 1.4652 },
    scrollwheel: true,
    gestureHandling: "greedy",
  });
}

// Supprimer les anciens markers
markersRef.current.forEach(m => m.setMap(null));
markersRef.current = [];

const filteredPeople = selectedCemetery === "Tous"
  ? people
  : people.filter(p => p.cemetery === selectedCemetery);

const bounds = new google.maps.LatLngBounds();

filteredPeople.forEach((p, i) => {
  let position = { lat: 43.6093, lng: 1.4652 }; // fallback
  if (p.cemetery && p.section && p.division) {
    const key = `${p.section}-${p.division}`;
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

  bounds.extend(position);

  const content = `
    <strong>${i + 1}. ${p.name}</strong><br>
    ${p.description ? `${p.description}<br>` : ""}
    ${p.cemetery ? `Cimetière: ${p.cemetery}<br>` : ""}
    ${p.section ? `Section: ${p.section}<br>` : ""}
    ${p.division ? `Division: ${p.division}` : ""}
  `;
  const infowindow = new google.maps.InfoWindow({ content });
  marker.addListener("click", () => infowindow.open(mapInstance.current, marker));

  markersRef.current.push(marker);
});

if (!bounds.isEmpty()) {
  mapInstance.current.fitBounds(bounds);
}

}, [isReady, people, selectedCemetery]);

return ( <div className="p-4 max-w-6xl mx-auto">
<Script
src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
strategy="afterInteractive"
onLoad={() => setIsReady(true)}
/>

  <h1 className="text-3xl font-extrabold mb-6">
    🏛️ Carte des cimetières
  </h1>

  <div className="mb-4">
    <label className="mr-2 font-semibold">Filtrer par cimetière sur la carte:</label>
    <select
      value={selectedCemetery}
      onChange={e => setSelectedCemetery(e.target.value)}
      className="border rounded p-1"
    >
      <option value="Tous">Tous</option>
      {Object.keys(cemeterySections).map(c => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
  </div>

  <div
    ref={mapRef}
    style={{ height: "60vh", width: "100%" }}
    className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center"
  >
    {!isReady && <p>Chargement de la carte…</p>}
  </div>

  <h2 className="text-2xl font-semibold mb-4">
    Liste complète des personnalités ({people.length})
  </h2>

  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {people.map((p, i) => (
      <li key={i} className="p-4 border rounded bg-white shadow">
        <p className="text-lg font-bold">{i + 1}. {p.name}</p>
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
