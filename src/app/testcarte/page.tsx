"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
// Importation dynamique de Leaflet car il nécessite l'objet 'window'
import L from "leaflet";
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
  const mapInstance = useRef<L.Map | null>(null);

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

  // 2. Initialisation de la carte Leaflet
  useEffect(() => {
    if (!mapRef.current || conferences.length === 0 || mapInstance.current) return;

    // Fix pour les icônes par défaut de Leaflet dans Next.js
    const DefaultIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    // Création de la carte
    const map = L.map(mapRef.current).setView([43.6045, 1.444], 12);
    mapInstance.current = map;

    // Ajout de la couche OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Ajout des marqueurs
    conferences.forEach((c, i) => {
      if (c.geo_point_2d) {
        const marker = L.marker([c.geo_point_2d.lat, c.geo_point_2d.lon])
          .addTo(map)
          .bindPopup(`
            <div style="font-family: sans-serif;">
              <strong>${i + 1}. ${c.nom_equipement}</strong><br/>
              ${c.lib_off}, ${c.ville}<br/>
              <small>Gestionnaire : ${c.gestionnaire}</small><br/>
              <small>Tél : ${c.telephone ?? "-"}</small>
            </div>
          `);
      }
    });

    // Nettoyage au démontage
    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [conferences]);

  if (loading) return <p className="p-4">Chargement des centres culturels…</p>;
  if (!conferences.length) return <p className="p-4">Aucun centre culturel disponible.</p>;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-6 text-center text-blue-700">
        🎭 Centres culturels et salles de conférences à Toulouse
      </h1>

      {/* Conteneur de la carte */}
      <div
        ref={mapRef}
        style={{ height: "60vh", width: "100%" }}
        className="mb-8 border-4 border-blue-200 rounded-xl bg-gray-50 z-0" 
      />

      {/* Tableau (Mise en page conservée à l'identique) */}
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
                <td className="border p-2 font-bold">{i + 1}</td>
                <td className="border p-2">{c.nom_equipement}</td>
                <td className="border p-2">{c.lib_off}</td>
                <td className="border p-2">{c.gestionnaire}</td>
                <td className="border p-2">{c.telephone ?? "-"}</td>
                <td className="border p-2">
                  {c.site_web ? (
                    <a
                      href={c.site_web.startsWith('http') ? c.site_web : `http://${c.site_web}`}
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
