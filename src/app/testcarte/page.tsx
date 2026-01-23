"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// --- Imports dynamiques pour éviter les erreurs SSR de Leaflet ---
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

interface Establishment {
  name: string;
  address: string;
  type?: "library" | "centre_culturel" | "maison_quartier" | "mjc" | "conservatoire";
  lat?: number; // Optionnel si déjà présent
  lng?: number; // Optionnel si déjà présent
}

interface EnrichedEstablishment extends Establishment {
  coords?: [number, number];
}

export default function BibliomapPage() {
  const [establishments, setEstablishments] = useState<EnrichedEstablishment[]>([]);
  const [L, setL] = useState<any>(null);
  const [filters, setFilters] = useState<Record<NonNullable<Establishment["type"]>, boolean>>({
    library: true,
    centre_culturel: true,
    maison_quartier: true,
    mjc: true,
    conservatoire: true,
  });

  const typeColors: Record<NonNullable<Establishment["type"]>, string> = {
    library: "#ef4444", // red-500
    centre_culturel: "#3b82f6", // blue-500
    maison_quartier: "#f97316", // orange-500
    mjc: "#22c55e", // green-500
    conservatoire: "#a855f7", // purple-500
  };

  const typeLabels: Record<NonNullable<Establishment["type"]>, string> = {
    library: "bibliothèque",
    centre_culturel: "centre culturel",
    maison_quartier: "maison de quartier",
    mjc: "MJC",
    conservatoire: "conservatoire",
  };

  // 1. Chargement des données et géocodage (si nécessaire)
  useEffect(() => {
    import("leaflet").then((leaflet) => setL(leaflet));

    fetch("/api/bibliomap")
      .then((res) => res.json())
      .then(async (data: Establishment[]) => {
        // Si votre API ne renvoie pas de lat/lng, on géocode via Nominatim (OpenStreetMap)
        const enriched = await Promise.all(
          data.map(async (est) => {
            if (est.lat && est.lng) return { ...est, coords: [est.lat, est.lng] as [number, number] };
            
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(est.address + ", Toulouse")}`);
              const json = await res.json();
              if (json[0]) return { ...est, coords: [parseFloat(json[0].lat), parseFloat(json[0].lon)] as [number, number] };
            } catch (e) { console.error("Erreur géocodage", e); }
            return est;
          })
        );
        setEstablishments(enriched);
      })
      .catch(console.error);
  }, []);

  const toggleFilter = (type: NonNullable<Establishment["type"]>) => {
    setFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const filteredEstablishments = establishments.filter(est => filters[est.type ?? "library"]);

  // 2. Création de l'icône personnalisée Leaflet
  const createIcon = (color: string, label: string) => {
    if (!L) return null;
    return L.divIcon({
      className: "custom-div-icon",
      html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${label}</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-6">📍 Carte des Établissements de Toulouse</h1>

      <div className="mb-4 flex flex-wrap gap-4">
        {(Object.keys(filters) as Array<NonNullable<Establishment["type"]>>).map(type => (
          <label key={type} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters[type]}
              onChange={() => toggleFilter(type)}
            />
            <span style={{ color: typeColors[type], fontWeight: 'bold' }}>
              {typeLabels[type]}
            </span>
          </label>
        ))}
      </div>

      {/* --- CARTE LEAFLET --- */}
      <div className="mb-8 border rounded-lg bg-gray-100 overflow-hidden" style={{ height: "70vh", width: "100%" }}>
        {typeof window !== "undefined" && L ? (
          <MapContainer center={[43.6045, 1.444]} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredEstablishments.map((est, i) => {
              const type = est.type ?? "library";
              const icon = createIcon(typeColors[type], (i + 1).toString());
              
              return est.coords ? (
                <Marker key={i} position={est.coords} icon={icon}>
                  <Popup>
                    <strong>{i + 1}. {est.name}</strong><br />{est.address}
                  </Popup>
                </Marker>
              ) : null;
            })}
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full">Chargement de la carte...</div>
        )}
      </div>

      {/* --- LISTE (Contenu original conservé) --- */}
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
