"use client";

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

// URL publique d'un fichier GeoJSON contenant les fuseaux horaires du monde
// (C'est un fichier hébergé sur GitHub, très léger)
const TIMEZONE_GEOJSON_URL = "https://raw.githubusercontent
  .com/evansiroky/timezone-boundary-builder/master/releases/2023d
  /timezones_with_oceans.geojson";

export default function MapWorld() {
  const [timezoneData, setTimezoneData] = useState(null);

  useEffect(() => {
    // On télécharge les géométries des fuseaux horaires
    fetch(TIMEZONE_GEOJSON_URL)
      .then(res => res.json())
      .then(data => setTimezoneData(data))
      .catch(err => console.error("Erreur lors du chargement des fuseaux :", err));
  }, []);

  // 🟢 1. Style des polygones de fuseaux
  const timezoneStyle = (feature: any) => {
    // Optionnel : Tu pourrais calculer une couleur basée sur le décalage UTC
    // pour avoir un effet arc-en-ciel élégant.
    return {
      fillColor: "#4f46e5", // Indigo-600
      weight: 1.5, // Lignes de fuseaux bien visibles
      opacity: 0.6,
      color: 'white', // Lignes blanches pour bien détacher
      fillOpacity: 0.15 // Fond très léger
    };
  };

  // 🟢 2. Interaction : Afficher l'ID du fuseau au clic
  const onEachTimezone = (feature: any, layer: any) => {
    if (feature.properties && feature.properties.tzid) {
      // Le tzid est le nom officiel du fuseau (ex: 'Europe/Paris')
      layer.bindPopup(`<strong>Fuseau :</strong> ${feature.properties.tzid}`);
    }
    
    // Effet au survol
    layer.on({
      mouseover: (e: any) => {
        e.target.setStyle({ fillOpacity: 0.4 });
      },
      mouseout: (e: any) => {
        e.target.setStyle({ fillOpacity: 0.15 });
      }
    });
  };

  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-inner bg-slate-100 relative">
      <MapContainer 
        center={[20, 0] as any} 
        zoom={2} 
        scrollWheelZoom={false} 
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* On affiche les données des fuseaux */}
        {timezoneData && (
          <GeoJSON 
            data={timezoneData} 
            style={timezoneStyle} 
            onEachFeature={onEachTimezone}
          />
        )}
      </MapContainer>

      {/* Légende rapide juste pour le fun */}
      <div className="absolute bottom-4 left-4 bg-white/90 p-2 rounded-lg shadow text-[10px] font-mono text-slate-500 z-[1000] backdrop-blur-sm">
         Bandes = {timezoneData ? `${timezoneData.features.length} fuseaux référencés` : 'Chargement...'}
      </div>
    </div>
  );
}
