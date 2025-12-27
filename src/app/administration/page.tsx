"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface Administration {
  nom: string;
  adresse?: string;
  commune?: string;
  telephone?: string;
  categorie:
    | "mairie"
    | "mairie_annexe"
    | "maison_justice"
    | "maison_toulouse_services"
    | "point_acces_droit";
  geo?: {
    lat: number;
    lon: number;
  };
}

export default function AdministrationPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  const [data, setData] = useState<Administration[]>([]);
  const [isReady, setIsReady] = useState(false);

  const [filters, setFilters] = useState<Record<Administration["categorie"], boolean>>({
    mairie: true,
    mairie_annexe: true,
    maison_justice: true,
    maison_toulouse_services: true,
    point_acces_droit: true,
  });

  const colors: Record<Administration["categorie"], string> = {
    mairie: "red",
    mairie_annexe: "orange",
    maison_justice: "purple",
    maison_toulouse_services: "green",
    point_acces_droit: "blue",
  };

  const labels: Record<Administration["categorie"], string> = {
    mairie: "Mairie",
    mairie_annexe: "Mairie annexe",
    maison_justice: "Maison de Justice",
    maison_toulouse_services: "Maison Toulouse Services",
    point_acces_droit: "Point d’accès au droit",
  };

  // 🔹 Fetch API
  useEffect(() => {
    fetch("/api/administration")
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  // 🔹 Carte
  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    const filtered = data.filter(d => filters[d.categorie] && d.geo);

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 11,
      center: { lat: 43.6045, lng: 1.444 },
      gestureHandling: "greedy",
      scrollwheel: true,
    });

    filtered.forEach((item, i) => {
      if (!item.geo) return;

      const marker = new google.maps.Marker({
        map: mapInstance.current!,
        position: { lat: item.geo.lat, lng: item.geo.lon },
        label: `${i + 1}`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: colors[item.categorie],
          fillOpacity: 1,
          strokeColor: "black",
          strokeWeight: 1,
        },
      });

      const infowindow = new google.maps.InfoWindow({
        content: `
          <strong>${item.nom}</strong><br/>
          ${item.adresse ?? ""}<br/>
          <em>${item.commune ?? ""}</em><br/>
          ${item.telephone ? "📞 " + item.telephone : ""}
        `,
      });

      marker.addListener("click", () =>
        infowindow.open(mapInstance.current, marker)
      );
    });
  }, [isReady, data, filters]);

  const toggle = (cat: Administration["categorie"]) => {
    setFilters(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const filteredList = data.filter(d => filters[d.categorie]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <h1 className="text-3xl font-extrabold mb-6">
        🏛️ Administrations et services publics de Toulouse Métropole
      </h1>

      {/* Filtres */}
      <div className="mb-4 flex flex-wrap gap-4">
        {Object.keys(filters).map(cat => (
          <label key={cat} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters[cat as Administration["categorie"]]}
              onChange={() => toggle(cat as Administration["categorie"])}
            />
            <span style={{ color: colors[cat as Administration["categorie"]] }}>
              {labels[cat as Administration["categorie"]]}
            </span>
          </label>
        ))}
      </div>

      {/* Carte */}
      <div
        ref={mapRef}
        style={{ height: "70vh" }}
        className="mb-8 border rounded bg-gray-100"
      />

      {/* Liste */}
      <h2 className="text-2xl font-semibold mb-4">
        Liste complète ({filteredList.length})
      </h2>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredList.map((item, i) => (
          <li key={i} className="p-4 border rounded bg-white shadow">
            <p className="font-bold text-lg">
              {i + 1}. {item.nom}{" "}
              <span style={{ color: colors[item.categorie] }}>
                ({labels[item.categorie]})
              </span>
            </p>
            {item.adresse && <p>{item.adresse}</p>}
            {item.commune && (
              <p className="text-sm text-gray-600">{item.commune}</p>
            )}
            {item.telephone && <p>📞 {item.telephone}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
