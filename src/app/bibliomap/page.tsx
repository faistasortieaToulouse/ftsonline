"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface Establishment {
name: string;
address: string;
type?: "library" | "centre_culturel" | "maison_quartier" | "mjc" | "conservatoire";
}

export default function BibliomapPage() {
const mapRef = useRef<HTMLDivElement | null>(null);
const mapInstance = useRef<google.maps.Map | null>(null);
const [establishments, setEstablishments] = useState<Establishment[]>([]);
const [isReady, setIsReady] = useState(false);
const [filters, setFilters] = useState<Record<Establishment["type"], boolean>>({
library: true,
centre_culturel: true,
maison_quartier: true,
mjc: true,
conservatoire: true,
});

const typeColors: Record<NonNullable<Establishment["type"]>, string> = {
library: "red",
centre_culturel: "blue",
maison_quartier: "orange",
mjc: "green",
conservatoire: "purple",
};

const typeLabels: Record<NonNullable<Establishment["type"]>, string> = {
library: "bibliothèque",
centre_culturel: "centre culturel",
maison_quartier: "maison de quartier",
mjc: "MJC",
conservatoire: "conservatoire",
};

const isDesktop = () => {
if (typeof window === "undefined") return true;
return !/Mobi|Android|iPhone|iPad|iPod|Tablet/i.test(navigator.userAgent);
};

useEffect(() => {
fetch("/api/bibliomap")
.then((res) => res.json())
.then((data: Establishment[]) => setEstablishments(data))
.catch(console.error);
}, []);

useEffect(() => {
if (!isReady || !mapRef.current) return;

const filtered = establishments.filter(est => filters[est.type ?? "library"]);

mapInstance.current = new google.maps.Map(mapRef.current, {
  zoom: 12,
  center: { lat: 43.6045, lng: 1.444 },
  scrollwheel: isDesktop(),
  gestureHandling: isDesktop() ? "greedy" : "cooperative",
});

const geocoder = new google.maps.Geocoder();

filtered.forEach((est, i) => {
  geocoder.geocode({ address: est.address }, (results, status) => {
    if (status !== "OK" || !results?.[0]) return;

    const type = est.type ?? "library";
    const color = typeColors[type];

    const marker = new google.maps.Marker({
      map: mapInstance.current!,
      position: results[0].geometry.location,
      label: `${i + 1}`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: color,
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: "black",
      },
    });

    const infowindow = new google.maps.InfoWindow({
      content: `<strong>${i + 1}. ${est.name}</strong><br>${est.address}`,
    });

    marker.addListener("click", () => infowindow.open(mapInstance.current, marker));
  });
});

}, [isReady, establishments, filters]);

const toggleFilter = (type: Establishment["type"]) => {
setFilters(prev => ({ ...prev, [type]: !prev[type] }));
};

const filteredEstablishments = establishments.filter(est => filters[est.type ?? "library"]);

return ( <div className="p-4 max-w-7xl mx-auto">
<Script
src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
strategy="afterInteractive"
onLoad={() => setIsReady(true)}
/>

  <h1 className="text-3xl font-extrabold mb-6">📍 Carte des Établissements de Toulouse</h1>

  <div className="mb-4 flex flex-wrap gap-4">
    {Object.keys(filters).map(type => (
      <label key={type} className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={filters[type as Establishment["type"]]}
          onChange={() => toggleFilter(type as Establishment["type"])}
        />
        <span style={{ color: typeColors[type as Establishment["type"]] }}>
          {typeLabels[type as Establishment["type"]]}
        </span>
      </label>
    ))}
  </div>

  <div
    ref={mapRef}
    style={{ height: "70vh", width: "100%" }}
    className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center"
  >
    {!isReady && <p>Chargement de la carte…</p>}
  </div>

  <h2 className="text-2xl font-semibold mb-4">
    Liste Complète ({filteredEstablishments.length})
  </h2>

  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {filteredEstablishments.map((est, i) => {
      const type = est.type ?? "library";
      const color = typeColors[type];
      return (
        <li key={i} className="p-4 border rounded bg-white shadow">
          <p className="text-lg font-bold">
            {i + 1}. {est.name}{" "}
            <span style={{ color }}>({typeLabels[type]})</span>
          </p>
          <p>{est.address}</p>
        </li>
      );
    })}
  </ul>
</div>

);
}
