"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface ExilPlace {
nomLieu: string;
num: string;
typeRue: string;
nomRue: string;
site: string;
quartier: string;
établissement: string;
sigles: string;
signification: string;
}

export default function ExilPlacesPage() {
const mapRef = useRef<HTMLDivElement | null>(null);
const mapInstance = useRef<google.maps.Map | null>(null);
const [places, setPlaces] = useState<ExilPlace[]>([]);
const [isReady, setIsReady] = useState(false);

useEffect(() => {
fetch("/api/visitetoulouse")
.then((res) => res.json())
.then((data: ExilPlace[]) => setPlaces(data))
.catch(console.error);
}, []);

useEffect(() => {
if (!isReady || !mapRef.current) return;

mapInstance.current = new google.maps.Map(mapRef.current, {
  zoom: 13.5,
  center: { lat: 43.6045, lng: 1.444 },
  scrollwheel: true,
  gestureHandling: "greedy",
});

const geocoder = new google.maps.Geocoder();

places.forEach((place, i) => {
  const adresse = `Toulouse ${place.num} ${place.typeRue} ${place.nomRue}`;
  geocoder.geocode({ address: adresse }, (results, status) => {
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
      title: place.établissement,
    });

    const infowindow = new google.maps.InfoWindow({
      content: `
        <strong>${i + 1}. ${place.établissement}</strong><br>
        ${place.num} ${place.typeRue} ${place.nomRue}<br>
        Quartier : ${place.quartier}<br>
        Site : ${place.site}<br>
        Sigles : ${place.sigles || ""}<br>
        Signification : ${place.signification || ""}
      `,
    });

    marker.addListener("click", () => infowindow.open(mapInstance.current, marker));
  });
});

}, [isReady, places]);

return ( <div className="p-4 max-w-7xl mx-auto">
<Script
src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
strategy="afterInteractive"
onLoad={() => setIsReady(true)}
/>

  <h1 className="text-3xl font-extrabold mb-6">
    🗺️ Lieux d’exil à Toulouse
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
        <p className="text-lg font-bold">{i + 1}. {place.établissement}</p>
        <p className="italic">{place.num} {place.typeRue} {place.nomRue} — {place.quartier}</p>
        <p>Site : {place.site}</p>
        {place.sigles && <p>Sigles : {place.sigles}</p>}
        {place.signification && <p>Signification : {place.signification}</p>}
      </li>
    ))}
  </ul>
</div>

);
}
