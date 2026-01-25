"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface Establishment {
  name: string;
  address: string;
  type?: "library" | "centre_culturel" | "maison_quartier" | "mjc" | "conservatoire";
  lat?: number;
  lng?: number;
}

interface EnrichedEstablishment extends Establishment {
  coords?: [number, number];
}

export default function BibliomapPage() {
  const [establishments, setEstablishments] = useState<EnrichedEstablishment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Refs pour le contrôle manuel de Leaflet
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const [filters, setFilters] = useState<Record<NonNullable<Establishment["type"]>, boolean>>({
    library: true,
    centre_culturel: true,
    maison_quartier: true,
    mjc: true,
    conservatoire: true,
  });

  const typeColors: Record<NonNullable<Establishment["type"]>, string> = {
    library: "#ef4444", 
    centre_culturel: "#3b82f6",
    maison_quartier: "#f97316",
    mjc: "#22c55e",
    conservatoire: "#a855f7",
  };

  const typeLabels: Record<NonNullable<Establishment["type"]>, string> = {
    library: "bibliothèque",
    centre_culturel: "centre culturel",
    maison_quartier: "maison de quartier",
    mjc: "MJC",
    conservatoire: "conservatoire",
  };

  // 1. Chargement des données et géocodage
  useEffect(() => {
    fetch("/api/bibliomap")
      .then((res) => res.json())
      .then(async (data: Establishment[]) => {
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
        setIsLoading(false);
      })
      .catch(console.error);
  }, []);

  // 2. Initialisation de la carte (Nettoyage automatique inclus)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current).setView([43.6045, 1.444], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapInstance.current);

      setIsMapReady(true);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 3. Mise à jour des marqueurs selon les filtres
  useEffect(() => {
    if (!isMapReady || !mapInstance.current) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;
      
      // Nettoyer les marqueurs existants avant de redessiner
      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) mapInstance.current.removeLayer(layer);
      });

      const filtered = establishments.filter(est => filters[est.type ?? "library"]);

      filtered.forEach((est, i) => {
        if (!est.coords) return;
        const type = est.type ?? "library";
        
        const customIcon = L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color: ${typeColors[type]}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${i + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        L.marker(est.coords, { icon: customIcon })
          .bindPopup(`<strong>${i + 1}. ${est.name}</strong><br />${est.address}`)
          .addTo(mapInstance.current);
      });
    };

    updateMarkers();
  }, [isMapReady, establishments, filters]);

  const toggleFilter = (type: NonNullable<Establishment["type"]>) => {
    setFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const filteredForList = establishments.filter(est => filters[est.type ?? "library"]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-6 text-slate-800">📍 Carte des Établissements de Toulouse</h1>

      <div className="mb-6 flex flex-wrap gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        {(Object.keys(filters) as Array<NonNullable<Establishment["type"]>>).map(type => (
          <label key={type} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              checked={filters[type]}
              onChange={() => toggleFilter(type)}
            />
            <span style={{ color: typeColors[type] }} className="font-bold group-hover:underline">
              {typeLabels[type]}
            </span>
          </label>
        ))}
      </div>

      {/* ZONE CARTE (DIV REF) */}
      <div className="mb-8 border rounded-2xl bg-slate-50 overflow-hidden relative shadow-lg" style={{ height: "70vh", width: "100%" }}>
        <div ref={mapRef} className="h-full w-full z-0" />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-600 font-medium">Chargement des établissements...</p>
            </div>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-4 text-slate-800">
        Liste Complète ({filteredForList.length})
      </h2>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredForList.map((est, i) => {
          const type = est.type ?? "library";
          return (
            <li key={i} className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
              <p className="text-lg font-bold text-slate-900">
                {i + 1}. {est.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                 <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{ backgroundColor: typeColors[type] }}>
                   {typeLabels[type]}
                 </span>
                 <p className="text-sm text-slate-500 italic truncate">{est.address}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}