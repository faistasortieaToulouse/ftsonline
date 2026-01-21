"use client";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

interface Establishment {
  nomLieu: string;
  num: string;
  typeRue: string;
  nomRue: string;
  établissement: string; // <-- On utilise cette clé qui est dans votre JSON
  lat: number;
  lng: number;
  commentaire?: string;
}

export default function TestLeaflet() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  // MISE À JOUR : On utilise les vrais types de votre base de données
  const [filters, setFilters] = useState<Record<string, boolean>>({
    "café, pub": true,
    "restaurant": true,
    "cinéma": true,
    "hôtel": true,
    "hôpital": true,
    "Antiquités": true
  });

  const typeColors: Record<string, string> = {
    "café, pub": "red",
    "restaurant": "blue",
    "cinéma": "orange",
    "hôtel": "purple",
    "hôpital": "green",
    "Antiquités": "brown"
  };

  useEffect(() => {
    setIsMounted(true);
    fetch("/api/visitecommerce") // <-- Vérifiez que c'est la bonne route
      .then((res) => res.json())
      .then((data) => setEstablishments(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!isMounted || !mapRef.current || mapInstance.current) return;

    const L = require("leaflet");

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

  useEffect(() => {
    if (!mapInstance.current || !markersLayer.current) return;

    const L = require("leaflet");
    markersLayer.current.clearLayers();

    // MISE À JOUR : On filtre sur "établissement"
    const filtered = establishments.filter(est => filters[est.établissement]);

    filtered.forEach((est) => {
      if (est.lat && est.lng) {
        const color = typeColors[est.établissement] || "gray";
        
        const marker = L.circleMarker([est.lat, est.lng], {
          radius: 8,
          fillColor: color,
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8,
        });

        marker.bindPopup(`
          <strong>${est.nomLieu}</strong><br>
          ${est.num !== "0" ? est.num : ""} ${est.typeRue} ${est.nomRue}<br>
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
            <span style={{ color: typeColors[type] || "black", fontWeight: 'bold' }}>
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

      <h2 className="text-2xl font-bold mb-4">Liste des commerces</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {establishments
          .filter(est => filters[est.établissement]) // <-- Changement ici aussi
          .map((est, i) => (
            <div key={i} className="p-4 border rounded bg-white shadow-sm">
              <p className="font-bold text-blue-900">{est.nomLieu}</p>
              <p className="text-sm text-gray-600">
                {est.num !== "0" ? est.num : ""} {est.typeRue} {est.nomRue} — <span className="italic">{est.établissement}</span>
              </p>
              {est.commentaire && <p className="text-xs text-gray-400 mt-1">{est.commentaire}</p>}
            </div>
          ))}
      </div>
    </div>
  );
}
