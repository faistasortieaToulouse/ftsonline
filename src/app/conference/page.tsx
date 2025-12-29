"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

const GMAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

interface Conference {
  geo_point_2d: { lon: number; lat: number };
  nom_equipement: string;
  gestionnaire: string;
  telephone: string | null;
  site_web: string | null;
  numero: string;
  lib_off: string;
  id_secteur_postal: number;
  ville: string;
  secteur: number;
  quartier: number;
}

export default function ConferencePage() {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  // Fetch et tri alphabétique
  useEffect(() => {
    fetch("/api/conference")
      .then(res => res.json())
      .then((data: Conference[]) => {
        if (!Array.isArray(data)) return;

        // Tri alphabétique par nom_equipement
        const sorted = [...data].sort((a, b) =>
          (a.nom_equipement ?? "").localeCompare(b.nom_equipement ?? "")
        );

        setConferences(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Carte et marqueurs
  useEffect(() => {
    if (!isReady || !mapRef.current || conferences.length === 0) return;
    if (mapInstance.current) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      center: { lat: 43.6045, lng: 1.444 },
      zoom: 12,
      scrollwheel: true,
      gestureHandling: "greedy",
    });

    const map = mapInstance.current;

    // Les marqueurs suivent le même ordre que le tableau trié
    conferences.forEach((c, i) => {
      const marker = new google.maps.Marker({
        map,
        position: { lat: c.geo_point_2d.lat, lng: c.geo_point_2d.lon },
        label: { text: String(i + 1), color: "#fff", fontWeight: "bold" },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#2563eb",
          fillOpacity: 1,
          strokeWeight: 0,
        },
      });

      const infowindow = new google.maps.InfoWindow({
        content: `
          <strong>${i + 1}. ${c.nom_equipement}</strong><br/>
          ${c.lib_off}, ${c.ville}<br/>
          Gestionnaire : ${c.gestionnaire}<br/>
          Téléphone : ${c.telephone ?? "-"}<br/>
          Site web : ${
            c.site_web
              ? `<a href="http://${c.site_web}" target="_blank">${c.site_web}</a>`
              : "-"
          }
        `,
      });

      marker.addListener("click", () => infowindow.open(map, marker));
    });
  }, [isReady, conferences]);

  if (loading) return <p className="p-4">Chargement des centres culturels…</p>;
  if (!conferences.length) return <p className="p-4">Aucun centre culturel disponible.</p>;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {GMAPS_API_KEY && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${GMAPS_API_KEY}`}
          strategy="afterInteractive"
          onLoad={() => setIsReady(true)}
        />
      )}

      <h1 className="text-3xl font-extrabold mb-6 text-center text-blue-700">
        🎭 Centres culturels et salles de conférences à Toulouse
      </h1>

      <div
        ref={mapRef}
        style={{ height: "60vh", width: "100%" }}
        className="mb-8 border-4 border-blue-200 rounded-xl bg-gray-50"
      />

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-100">
              <th className="border p-2">#</th>
              <th className="border p-2">Nom</th>
              <th className="border p-2">Adresse</th>
              <th className="border p-2">Gestionnaire</th>
              <th className="border p-2">Téléphone</th>
              <th className="border p-2">Site web</th>
            </tr>
          </thead>
          <tbody>
            {conferences.map((c, i) => (
              <tr key={`${c.nom_equipement}-${i}`} className="hover:bg-blue-50">
                <td className="border p-2">{i + 1}</td>
                <td className="border p-2">{c.nom_equipement}</td>
                <td className="border p-2">{c.lib_off}</td>
                <td className="border p-2">{c.gestionnaire}</td>
                <td className="border p-2">{c.telephone ?? "-"}</td>
                <td className="border p-2">
                  {c.site_web ? (
                    <a
                      href={`http://${c.site_web}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Lien
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
