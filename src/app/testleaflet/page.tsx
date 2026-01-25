"use client";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Establishment {
  nomLieu: string;
  num: string;
  typeRue: string;
  nomRue: string;
  établissement: string;
  quartier: string;
  commentaire?: string;
  lat: number;
  lng: number;
}

export default function TestLeaflet() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  const [filters, setFilters] = useState<Record<string, boolean>>({
    "café, pub": true,
    "restaurant": true,
    "cinéma": true,
    "hôtel": true,
    "hôpital": true,
    "Antiquités": true,
    "brûlerie": true
  });

  const typeColors: Record<string, string> = {
    "café, pub": "#e63946",
    "restaurant": "#457b9d",
    "cinéma": "#f4a261",
    "hôtel": "#8338ec",
    "hôpital": "#2a9d8f",
    "Antiquités": "#6d6875",
    "brûlerie": "#bc6c25"
  };

  useEffect(() => {
    setIsMounted(true);
    fetch("/api/visitecommerce")
      .then((res) => res.json())
      .then((data) => setEstablishments(data))
      .catch(console.error);
  }, []);

  // Initialisation Carte
  useEffect(() => {
    if (!isMounted || !mapRef.current || mapInstance.current) return;

    const L = require("leaflet");
    mapInstance.current = L.map(mapRef.current).setView([43.6045, 1.444], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap',
    }).addTo(mapInstance.current);

    markersLayer.current = L.layerGroup().addTo(mapInstance.current);
  }, [isMounted]);

  // Mise à jour des marqueurs avec NUMÉROS
  useEffect(() => {
    if (!mapInstance.current || !markersLayer.current) return;
    const L = require("leaflet");
    markersLayer.current.clearLayers();

    // On numérote uniquement les éléments visibles
    const filtered = establishments.filter(est => filters[est.établissement]);

    filtered.forEach((est, index) => {
      if (est.lat && est.lng) {
        const color = typeColors[est.établissement] || "gray";
        const numero = index + 1;

        // Création d'une icône personnalisée avec le numéro
        const customIcon = L.divIcon({
          className: "custom-number-marker",
          html: `<div style="
            background-color: ${color};
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 11px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          ">${numero}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([est.lat, est.lng], { icon: customIcon });
        
        marker.bindPopup(`
          <div style="font-family: sans-serif;">
            <strong style="color:${color}">#${numero} ${est.nomLieu}</strong><br>
            ${est.établissement}
          </div>
        `);
        
        markersLayer.current.addLayer(marker);
      }
    });
  }, [establishments, filters]);

  const toggleFilter = (type: string) => {
    setFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  if (!isMounted) return null;

  const filteredList = establishments.filter(est => filters[est.établissement]);

  return (
    <div className="p-4 max-w-7xl mx-auto font-sans bg-gray-50 min-h-screen">

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-black mb-6 text-gray-800 tracking-tight">📍 Toulouse Explorer</h1>

      {/* Filtres */}
      <div className="mb-6 flex flex-wrap gap-2">
        {Object.keys(filters).map(type => (
          <button
            key={type}
            onClick={() => toggleFilter(type)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
              filters[type] ? 'bg-white shadow-sm' : 'bg-gray-200 text-gray-400 border-transparent'
            }`}
            style={{ color: filters[type] ? typeColors[type] : '', borderColor: filters[type] ? typeColors[type] : '' }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Carte */}
      <div
        ref={mapRef}
        className="mb-8 border-4 border-white shadow-2xl rounded-3xl overflow-hidden"
        style={{ height: "55vh", width: "100%", zIndex: 1 }}
      />

      {/* Tableau */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-800 text-white text-[10px] uppercase tracking-[0.2em]">
              <th className="p-4 w-16 text-center">#</th>
              <th className="p-4">Établissement</th>
              <th className="p-4">Catégorie</th>
              <th className="p-4">Adresse</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredList.map((est, i) => (
              <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                <td className="p-4 text-center font-black text-gray-300">{i + 1}</td>
                <td className="p-4 font-bold text-gray-800">{est.nomLieu}</td>
                <td className="p-4">
                  <span 
                    className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                    style={{ backgroundColor: typeColors[est.établissement] }}
                  >
                    {est.établissement}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {est.num !== "0" ? est.num : ""} {est.typeRue} {est.nomRue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
