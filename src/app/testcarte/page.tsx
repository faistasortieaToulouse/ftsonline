"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
// 1. SUPPRIMER : import L from "leaflet";
// Garder uniquement le CSS (le CSS ne pose pas de problème au build)
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
  const mapInstance = useRef<any>(null); // Changé en any car L n'est plus global au début

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

  // 2. Initialisation de la carte Leaflet avec IMPORT DYNAMIQUE
  useEffect(() => {
    // Cette fonction ne s'exécutera que dans le navigateur
    const initMap = async () => {
      if (!mapRef.current || conferences.length === 0 || mapInstance.current) return;

      // CHARGEMENT DYNAMIQUE DE LEAFLET
      const L = (await import("leaflet")).default;

      // Fix pour les icônes par défaut
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

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      conferences.forEach((c, i) => {
        if (c.geo_point_2d) {
          L.marker([c.geo_point_2d.lat, c.geo_point_2d.lon])
            .addTo(map)
            .bindPopup(`
              <div style="font-family: sans-serif;">
                <strong>${i + 1}. ${c.nom_equipement}</strong><br/>
                ${c.lib_off}, ${c.ville}
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

      <div
        ref={mapRef}
        style={{ height: "60vh", width: "100%" }}
        className="mb-8 border-4 border-blue-200 rounded-xl bg-gray-50 z-0" 
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
