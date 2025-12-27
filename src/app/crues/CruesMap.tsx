"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Crue {
  num_repere: number;
  loc_approximative: string;
  hauteur_eau_base_sol: number | null;
  lien_document: string | null;
  geo_point_2d: { lat: number; lon: number } | null;
}

export default function CruesMap() {
  const mapRef = useRef<L.Map | null>(null);
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const [crues, setCrues] = useState<Crue[]>([]);

  // ---------- Récupération des données ----------
  useEffect(() => {
    fetch("/api/crues") // <- Correct URL pour ton route.ts
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.results)) {
          setCrues(data.results);
        } else {
          console.error("Données inattendues :", data);
        }
      })
      .catch(err => console.error("Erreur fetch :", err));
  }, []);

  // ---------- Initialisation de la carte ----------
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    mapRef.current = L.map(mapDivRef.current).setView([43.6045, 1.444], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(mapRef.current);
  }, []);

  // ---------- Ajout des marqueurs ----------
  useEffect(() => {
    if (!mapRef.current) return;

    // Supprimer les anciens marqueurs
    mapRef.current.eachLayer(layer => {
      if ((layer as L.Marker)._latlng) mapRef.current?.removeLayer(layer);
    });

    crues.forEach(c => {
      if (!c.geo_point_2d) return;

      L.marker([c.geo_point_2d.lat, c.geo_point_2d.lon])
        .addTo(mapRef.current!)
        .bindPopup(`
          <strong>Repère ${c.num_repere}</strong><br/>
          ${c.loc_approximative}<br/>
          Hauteur : ${c.hauteur_eau_base_sol ?? "?"} m
        `);
    });
  }, [crues]);

  return (
    <>
      <div
        ref={mapDivRef}
        style={{ height: "70vh", width: "100%" }}
        className="mb-8 border rounded-lg"
      />

      <table className="w-full border border-collapse">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">N°</th>
            <th className="border p-2">Localisation</th>
            <th className="border p-2">Hauteur (m)</th>
            <th className="border p-2">Photo</th>
          </tr>
        </thead>
        <tbody>
          {crues.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center p-2">Chargement...</td>
            </tr>
          ) : (
            crues.map(c => (
              <tr key={c.num_repere}>
                <td className="border p-2">{c.num_repere}</td>
                <td className="border p-2">{c.loc_approximative}</td>
                <td className="border p-2">{c.hauteur_eau_base_sol ?? "-"}</td>
                <td className="border p-2">
                  {c.lien_document ? (
                    <a href={c.lien_document} target="_blank" rel="noreferrer">
                      Voir
                    </a>
                  ) : "-"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}
