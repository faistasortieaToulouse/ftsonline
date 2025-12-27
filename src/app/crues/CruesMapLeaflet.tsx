"use client";

import { useEffect, useRef, useState } from "react";

interface Itineraire {
  id: number;
  id_itineraire: number;
  libelle_itineraire: string;
  adresse: string;
  geo_point_2d?: { lat: number; lon: number } | null;
  geo_shape?: {
    geometry?: {
      coordinates?: number[][][];
    };
  } | null;
}

export default function CruesMapLeaflet() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [data, setData] = useState<Itineraire[]>([]);

  /* ===============================
     1. Chargement des données depuis /api/crues
     =============================== */
  useEffect(() => {
    fetch("/api/crues")
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  /* ===============================
     2. Initialisation Leaflet
     =============================== */
  useEffect(() => {
    if (!mapRef.current || data.length === 0 || mapInstance.current) return;

    let map: any;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        iconUrl: "/leaflet/marker-icon.png",
        shadowUrl: "/leaflet/marker-shadow.png",
      });

      map = L.map(mapRef.current!).setView([43.593, 1.44], 13);
      mapInstance.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      markersRef.current = [];

      data.forEach((item, index) => {
        if (!item.geo_point_2d) return;

        const { lat, lon } = item.geo_point_2d;

        const icon = L.divIcon({
          html: `<div style="
            background:#1D4ED8;
            color:white;
            width:24px;
            height:24px;
            border-radius:50%;
            display:flex;
            align-items:center;
            justify-content:center;
            font-weight:bold;
            border:2px solid white;
          ">${index + 1}</div>`,
          className: "",
        });

        const marker = L.marker([lat, lon], { icon })
          .addTo(map)
          .bindPopup(
            `<strong>${item.libelle_itineraire}</strong><br/>
             ${item.adresse}<br/>
             Itinéraire n°${item.id_itineraire}`
          );

        markersRef.current.push(marker);

        const lines = item.geo_shape?.geometry?.coordinates;
        if (lines) {
          lines.forEach(line => {
            const latlngs = line.map(([lng, lat]) => [lat, lng]);
            L.polyline(latlngs, {
              color: "#2563EB",
              weight: 3,
              opacity: 0.7,
            }).addTo(map);
          });
        }
      });
    })();

    return () => {
      if (map) {
        map.remove();
        mapInstance.current = null;
        markersRef.current = [];
      }
    };
  }, [data]);

  /* ===============================
     3. Interaction tableau → carte
     =============================== */
  function focusOn(index: number) {
    const map = mapInstance.current;
    const marker = markersRef.current[index];

    if (!map || !marker) return;

    map.setView(marker.getLatLng(), 16, { animate: true });
    marker.openPopup();
  }

  return (
    <div className="space-y-8">
      {/* CARTE */}
      <div
        ref={mapRef}
        style={{ height: "70vh", width: "100%" }}
        className="border rounded-lg"
      />

      {/* TABLEAU */}
      <div className="overflow-x-auto">
        <table className="w-full border border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2 text-center">#</th>
              <th className="border p-2">Itinéraire</th>
              <th className="border p-2">Adresse</th>
              <th className="border p-2 text-center">ID</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={item.id ?? index}
                className="cursor-pointer hover:bg-blue-50"
                onClick={() => focusOn(index)}
              >
                <td className="border p-2 text-center font-bold">{index + 1}</td>
                <td className="border p-2">{item.libelle_itineraire}</td>
                <td className="border p-2">{item.adresse}</td>
                <td className="border p-2 text-center">{item.id_itineraire}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
