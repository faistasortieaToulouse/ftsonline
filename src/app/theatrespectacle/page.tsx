"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface TheatrePlace {
  name: string;
  address: string;
  catégorie: "Théâtre" | "Salle de spectacle";
  url: string;
  lat: number; // Ajouté pour éviter le géocodage
  lng: number; // Ajouté pour éviter le géocodage
}

interface Stats {
  total: number;
  Théâtre: number;
  "Salle de spectacle": number;
}

export default function TheatreMapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  
  const [places, setPlaces] = useState<TheatrePlace[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, Théâtre: 0, "Salle de spectacle": 0 });
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const [filters, setFilters] = useState<Record<TheatrePlace["catégorie"], boolean>>({
    Théâtre: true,
    "Salle de spectacle": true,
  });

  const categorieColors: Record<TheatrePlace["catégorie"], string> = {
    Théâtre: "#ef4444", // Rouge (Tailwind red-500)
    "Salle de spectacle": "#f97316", // Orange (Tailwind orange-500)
  };

  // 1. Récupération des données
  useEffect(() => {
    fetch("/api/theatrespectacle")
      .then((res) => res.json())
      .then((data: TheatrePlace[]) => {
        setPlaces(data);
        setStats({
          total: data.length,
          Théâtre: data.filter(p => p.catégorie === "Théâtre").length,
          "Salle de spectacle": data.filter(p => p.catégorie === "Salle de spectacle").length,
        });
        setIsLoadingData(false);
      })
      .catch(console.error);
  }, []);

  // 2. Initialisation de la carte (Méthode OTAN)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current!).setView([43.6045, 1.444], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      markersLayerRef.current = L.layerGroup().addTo(mapInstance.current);
      setIsMapReady(true);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isLoadingData]);

  // 3. Gestion des marqueurs avec filtres
  useEffect(() => {
    if (!isMapReady || !mapInstance.current) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;
      markersLayerRef.current.clearLayers();

      const filtered = places.filter(p => filters[p.catégorie]);

      filtered.forEach((place, i) => {
        const color = categorieColors[place.catégorie];

        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: ${color};
              width: 24px; height: 24px;
              border-radius: 50%; border: 2px solid white;
              display: flex; align-items: center; justify-content: center;
              color: white; font-weight: bold; font-size: 10px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              ${i + 1}
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([place.lat, place.lng], { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: Arial; font-size: 14px;">
            <strong>${i + 1}. ${place.name}</strong><br>
            ${place.address}<br>
            <a href="${place.url}" target="_blank" style="color: #3b82f6; text-decoration: underline;">Site web</a>
          </div>
        `);
        marker.addTo(markersLayerRef.current);
      });
    };

    updateMarkers();
  }, [isMapReady, places, filters]);

  const toggleFilter = (catégorie: TheatrePlace["catégorie"]) => {
    setFilters(prev => ({ ...prev, [catégorie]: !prev[catégorie] }));
  };

  const filteredPlaces = places.filter(p => filters[p.catégorie]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-2 text-slate-900">🎭 Carte des Théâtres & Salles de spectacle</h1>
      
      <div className="mb-6 text-lg text-gray-700 bg-slate-50 p-4 rounded-lg border border-slate-100">
        <p className="font-bold">Total des lieux : {stats.total}</p>
        <p>Répartition : 
          <span className="font-semibold" style={{ color: categorieColors["Théâtre"] }}> {stats.Théâtre} Théâtres</span>
          <span> et </span>
          <span className="font-semibold" style={{ color: categorieColors["Salle de spectacle"] }}> {stats["Salle de spectacle"]} Salles de spectacle</span>.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-6 bg-white p-3 border rounded-md">
        {Object.keys(filters).map(categorie => (
          <label key={categorie} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={filters[categorie as TheatrePlace["catégorie"]]}
              onChange={() => toggleFilter(categorie as TheatrePlace["catégorie"])}
            />
            <span className="font-medium group-hover:opacity-80" style={{ color: categorieColors[categorie as TheatrePlace["catégorie"]] }}>
              {categorie}
            </span>
          </label>
        ))}
      </div>

      <div className="mb-8 border rounded-lg bg-gray-100 relative overflow-hidden shadow-inner" style={{ height: "70vh", width: "100%" }}>
        <div ref={mapRef} className="h-full w-full z-0" />
        {!isMapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <p className="animate-pulse">Chargement de la carte…</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-slate-800">Liste complète ({filteredPlaces.length})</h2>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPlaces.map((place, i) => {
          const color = categorieColors[place.catégorie];
          return (
            <li key={i} className="p-4 border rounded bg-white shadow-sm hover:shadow-md transition-shadow">
              <p className="text-lg font-bold text-slate-800">
                {i + 1}. {place.name} <span className="text-sm font-semibold" style={{ color }}>({place.catégorie})</span>
              </p>
              <p className="text-slate-600 mb-2">{place.address}</p>
              <a href={place.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1">
                Voir le site web →
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}