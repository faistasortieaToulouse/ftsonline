"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

interface Parcelle {
  id: number;
  centroid: { lat: number; lon: number };
  geometry: {
    coordinates: number[][][];
    type: string;
  };
  codeparcelle: string | null;
  typologie: string;
  surface: string;
  nom_prenom: string;
}

export default function ParcellairePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const layersRef = useRef<Map<number, any>>(new Map());

  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    fetch("/api/parcellaire")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a: Parcelle, b: Parcelle) =>
          (a.codeparcelle ?? "").localeCompare(b.codeparcelle ?? "")
        );
        setParcelles(sorted);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || parcelles.length === 0) return;

    const initLeaflet = async () => {
      const L = (await import("leaflet")).default;

      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current!).setView([43.6045, 1.444], 14);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapInstance.current);
      }

      layersRef.current.forEach(layer => mapInstance.current.removeLayer(layer));
      layersRef.current.clear();

      parcelles.forEach((p) => {
        if (!p.geometry?.coordinates?.[0]) return;

        const latLngs: [number, number][] = p.geometry.coordinates[0].map(
          (coord) => [coord[1], coord[0]]
        );

        const polygon = L.polygon(latLngs, {
          color: "#7c3aed",
          weight: 1,
          opacity: 0.8,
          fillColor: "#a78bfa",
          fillOpacity: 0.35,
        }).addTo(mapInstance.current);

        polygon.bindPopup(`
          <strong>Parcelle :</strong> ${p.codeparcelle}<br/>
          <strong>Type :</strong> ${p.typologie}<br/>
          <strong>Surface :</strong> ${p.surface} m²<br/>
          <strong>Propriétaire :</strong> ${p.nom_prenom}
        `);

        layersRef.current.set(p.id, polygon);
      });

      setIsMapReady(true);
    };

    initLeaflet();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [parcelles]);

  const handleRowClick = (p: Parcelle) => {
    const polygon = layersRef.current.get(p.id);
    if (!mapInstance.current || !polygon) return;

    const bounds = polygon.getBounds();
    mapInstance.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
    polygon.openPopup();

    if (mapRef.current) {
      mapRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-6 text-center text-purple-800">
        🗺️ Parcellaire de Toulouse (1830)
      </h1>

      <div ref={mapRef} className="h-[500px] w-full border rounded-lg bg-gray-100 shadow-md relative z-0 overflow-hidden">
        {!isMapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10">
            <p className="text-purple-600 animate-pulse font-semibold">Chargement de la carte…</p>
          </div>
        )}
      </div>

      <div className="mt-8 overflow-hidden shadow-sm border rounded-lg bg-white">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-purple-100 text-purple-900">
              <th className="p-3 text-left text-sm font-bold">Parcelle</th>
              <th className="p-3 text-left text-sm font-bold">Type</th>
              {/* Colonnes cachées sur mobile */}
              <th className="p-3 text-left text-sm font-bold hidden md:table-cell">Surface (m²)</th>
              <th className="p-3 text-left text-sm font-bold hidden md:table-cell">Propriétaire</th>
            </tr>
          </thead>
          <tbody>
            {parcelles.map((p) => (
              <ParcelleRow key={p.id} parcelle={p} onZoom={handleRowClick} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ParcelleRow({ parcelle, onZoom }: { parcelle: Parcelle; onZoom: (p: Parcelle) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <tr
        className="hover:bg-purple-50 cursor-pointer transition-colors border-b border-gray-100 even:bg-gray-50/50"
        onClick={() => {
          setIsOpen(!isOpen);
          onZoom(parcelle);
        }}
      >
        <td className="p-3 font-bold text-purple-700">{parcelle.codeparcelle}</td>
        <td className="p-3 text-gray-700 text-sm">
          <div className="flex items-center justify-between">
            {parcelle.typologie}
            <span className="md:hidden text-purple-400 ml-2">
              {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </span>
          </div>
        </td>
        <td className="p-3 text-gray-700 text-sm hidden md:table-cell">{parcelle.surface}</td>
        <td className="p-3 text-gray-700 text-sm hidden md:table-cell">{parcelle.nom_prenom}</td>
      </tr>

      {/* Accordéon Mobile */}
      {isOpen && (
        <tr className="md:hidden bg-purple-50/50 border-b border-purple-100 transition-all">
          <td colSpan={2} className="p-4">
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-purple-800 tracking-wider">Surface</span>
                <span className="text-gray-700 font-medium">{parcelle.surface} m²</span>
              </div>
              <div className="flex flex-col border-t border-purple-100 pt-2">
                <span className="text-[10px] uppercase font-bold text-purple-800 tracking-wider">Propriétaire</span>
                <span className="text-gray-700 italic">{parcelle.nom_prenom}</span>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}