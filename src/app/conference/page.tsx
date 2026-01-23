"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import { ArrowLeft } from "lucide-react";
import "leaflet/dist/leaflet.css";

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
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);

  // 1. Fetch et tri alphabétique
  useEffect(() => {
    fetch("/api/conference")
      .then((res) => res.json())
      .then((data: Conference[]) => {
        if (!Array.isArray(data)) return;
        const sorted = [...data].sort((a, b) =>
          (a.nom_equipement ?? "").localeCompare(b.nom_equipement ?? "")
        );
        setConferences(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 2. Initialisation de la carte Leaflet avec IMPORT DYNAMIQUE et MARQUEURS NUMÉROTÉS
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || conferences.length === 0 || mapInstance.current) return;

      // CHARGEMENT DYNAMIQUE DE LEAFLET
      const L = (await import("leaflet")).default;

      // Création de la carte
      const map = L.map(mapRef.current).setView([43.6045, 1.444], 12);
      mapInstance.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Ajout des marqueurs numérotés (Style rouge comme pour les cinémas)
      conferences.forEach((c, i) => {
        if (c.geo_point_2d) {
          // Création de l'icône personnalisée avec le numéro
          const customMarker = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #2563eb; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${i + 1}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          L.marker([c.geo_point_2d.lat, c.geo_point_2d.lon], { icon: customMarker })
            .addTo(map)
            .bindPopup(`
              <div style="font-family: sans-serif; min-width: 150px;">
                <strong style="color: #2563eb;">${i + 1}. ${c.nom_equipement}</strong><br/>
                <p style="margin: 4px 0; font-size: 12px;">${c.lib_off}, ${c.ville}</p>
                <small>Gestionnaire : ${c.gestionnaire}</small><br/>
                <small>Tél : ${c.telephone ?? "-"}</small>
              </div>
            `);
        }
      });
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [conferences]);

  if (loading) return <p className="p-4 italic">Chargement des données culturelles...</p>;
  if (!conferences.length) return <p className="p-4">Aucun centre culturel disponible.</p>;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-6 text-center text-blue-700 uppercase tracking-tight">
        🎭 Centres culturels et salles de conférences
      </h1>

      {/* Conteneur de la carte */}
      <div
        ref={mapRef}
        style={{ height: "60vh", width: "100%" }}
        className="mb-8 border-4 border-blue-200 shadow-lg rounded-2xl bg-gray-50 z-0 overflow-hidden" 
      />

      {/* Tableau */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white text-left">
              <th className="p-3 font-bold">#</th>
              <th className="p-3 font-bold">Nom</th>
              <th className="p-3 font-bold">Adresse</th>
              <th className="p-3 font-bold">Gestionnaire</th>
              <th className="p-3 font-bold">Téléphone</th>
              <th className="p-3 font-bold text-center">Site web</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {conferences.map((c, i) => (
              <tr key={`${c.nom_equipement}-${i}`} className="hover:bg-blue-50 transition-colors">
                <td className="p-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                    {i + 1}
                  </span>
                </td>
                <td className="p-3 font-semibold text-gray-800">{c.nom_equipement}</td>
                <td className="p-3 text-gray-600 text-sm">{c.lib_off}</td>
                <td className="p-3 text-gray-600 text-sm">{c.gestionnaire}</td>
                <td className="p-3 text-gray-600 text-sm">{c.telephone ?? "-"}</td>
                <td className="p-3 text-center">
                  {c.site_web ? (
                    <a
                      href={c.site_web.startsWith('http') ? c.site_web : `http://${c.site_web}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-3 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-bold hover:bg-blue-700 hover:text-white transition-all"
                    >
                      Lien
                    </a>
                  ) : (
                    <span className="text-gray-300">-</span>
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
