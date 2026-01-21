"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// 1. On utilise les types qui correspondent à votre nouveau JSON
interface Establishment {
  nomLieu: string;
  num: string;
  typeRue: string;
  nomRue: string;
  quartier: string;
  établissement: string; // C'est ici que se trouve le type
  commentaire?: string;
  lat: number;
  lng: number;
}

// Import dynamique de la carte pour éviter l'erreur "window is not defined"
const MapWithNoSSR = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="h-[70vh] flex items-center justify-center bg-gray-100">Chargement de la carte...</div>
});

export default function TestLeaflet() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [filters, setFilters] = useState<Record<string, boolean>>({
    "café, pub": true,
    "restaurant": true,
    "cinéma": true,
    "hôtel": true,
    "Antiquités": true,
    "hôpital": true,
    "librairie": true,
  });

  const typeColors: Record<string, string> = {
    "café, pub": "#e63946",
    "restaurant": "#457b9d",
    "cinéma": "#ffb703",
    "hôtel": "#8338ec",
    "Antiquités": "#6d6875",
    "hôpital": "#2a9d8f",
    "librairie": "#fb8500",
  };

  useEffect(() => {
    // Vérifiez bien que cette route renvoie le nouveau JSON avec lat/lng
    fetch("/api/visitecommerce")
      .then((res) => res.json())
      .then((data: Establishment[]) => setEstablishments(data))
      .catch(console.error);
  }, []);

  const toggleFilter = (type: string) => {
    setFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // Filtrage des données pour la carte ET le tableau
  const filteredData = establishments.filter(est => filters[est.établissement] ?? true);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6">📍 Exploration de Toulouse</h1>

      {/* Filtres */}
      <div className="mb-4 flex flex-wrap gap-2">
        {Object.keys(filters).map(type => (
          <button
            key={type}
            onClick={() => toggleFilter(type)}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition ${
              filters[type] ? 'bg-white shadow-sm' : 'bg-gray-100 text-gray-400 opacity-50'
            }`}
            style={{ borderColor: filters[type] ? typeColors[type] : '#ddd', color: filters[type] ? typeColors[type] : '' }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* La Carte (Via composant dynamique) */}
      <div className="mb-8 border rounded-lg overflow-hidden shadow-lg h-[60vh]">
        <MapWithNoSSR 
          data={filteredData} 
          typeColors={typeColors} 
        />
      </div>

      {/* Le Tableau (C'est ici qu'on corrige l'affichage) */}
      <h2 className="text-2xl font-semibold mb-4">
        Liste des lieux ({filteredData.length})
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredData.map((est, i) => (
          <div key={i} className="p-4 border rounded bg-white shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded" 
                    style={{ backgroundColor: `${typeColors[est.établissement]}22`, color: typeColors[est.établissement] }}>
                {est.établissement}
              </span>
              <span className="text-gray-400 text-xs">#{i + 1}</span>
            </div>
            <p className="text-lg font-bold text-gray-800 leading-tight mb-1">
              {est.nomLieu}
            </p>
            <p className="text-sm text-gray-600 italic">
              {est.num !== "0" ? est.num : ""} {est.typeRue} {est.nomRue}
            </p>
            <p className="text-xs text-blue-500 mt-2 font-medium">📍 {est.quartier}</p>
            {est.commentaire && (
              <p className="text-xs text-gray-400 mt-2 border-t pt-2">{est.commentaire}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
