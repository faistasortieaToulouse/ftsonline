"use client";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

// Interface mise à jour pour inclure les coordonnées que nous avons générées
interface Establishment {
  nomLieu: string;
  num: string;
  typeRue: string;
  nomRue: string;
  établissement: string;
  lat: number;
  lng: number;
  type?: "library" | "centre_culturel" | "maison_quartier" | "mjc" | "conservatoire";
}

export default function TestLeaflet() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  const [filters, setFilters] = useState<Record<string, boolean>>({
    library: true,
    centre_culturel: true,
    maison_quartier: true,
    mjc: true,
    conservatoire: true,
  });

  const typeColors: Record<string, string> = {
    library: "red",
    centre_culturel: "blue",
    maison_quartier: "orange",
    mjc: "green",
    conservatoire: "purple",
  };

  // 1. Montage du composant
  useEffect(() => {
    setIsMounted(true);
    fetch("/api/bibliomap")
      .then((res) => res.json())
      .then((data) => setEstablishments(data))
      .catch(console.error);
  }, []);

  // 2. Initialisation de la carte (une seule fois)
  useEffect(() => {
    if (!isMounted || !mapRef.current || mapInstance.current) return;

    // Import dynamique de Leaflet pour éviter les erreurs SSR
    const L = require("leaflet");

    // Correction des icônes par défaut de Leaflet
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });

    mapInstance.current = L.map(mapRef.current).setView([43.6045, 1.444], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapInstance.current);

    markersLayer.current = L.layerGroup().addTo(mapInstance.current);
  }, [isMounted]);

  // 3. Mise à jour des marqueurs selon les filtres
  useEffect(() => {
    if (!mapInstance.current || !markersLayer.current) return;

    const L = require("leaflet");
    markersLayer.current.clearLayers();

    const filtered = establishments.filter(est => filters[est.type ?? "library"]);

    filtered.forEach((est) => {
      if (est.lat && est.lng) {
        const type = est.type ?? "library";
        
        // Création d'un marqueur circulaire coloré
        const marker = L.circleMarker([est.lat, est.lng], {
          radius: 8,
          fillColor: typeColors[type],
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8,
        });

        marker.bindPopup(`
          <strong>${est.nomLieu}</strong><br>
          ${est.num} ${est.typeRue} ${est.nomRue}<br>
          <em>${est.établissement}</em>
        `);
        
        markersLayer.current.addLayer(marker);
      }
    });
  }, [establishments, filters]);

  const toggleFilter = (type: string) => {
    setFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  if (!isMounted) return null;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6">📍 Toulouse (Leaflet)</h1>

      <div className="mb-4 flex flex-wrap gap-4">
        {Object.keys(filters).map(type => (
          <label key={type} className="flex items-center gap-2 cursor-pointer bg-gray-50 p-2 rounded border">
            <input
              type="checkbox"
              checked={filters[type]}
              onChange={() => toggleFilter(type)}
            />
            <span style={{ color: typeColors[type], fontWeight: 'bold' }}>
              {type}
            </span>
          </label>
        ))}
      </div>

      <div
        ref={mapRef}
        className="mb-8 border rounded-lg shadow-inner bg-gray-100"
        style={{ height: "70vh", width: "100%", zIndex: 1 }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {establishments
          .filter(est => filters[est.type ?? "library"])
          .map((est, i) => (
            <div key={i} className="p-4 border rounded bg-white shadow-sm">
              <p className="font-bold text-blue-900">{est.nomLieu}</p>
              <p className="text-sm text-gray-600">
                {est.num} {est.typeRue} {est.nomRue} — {est.établissement}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}
