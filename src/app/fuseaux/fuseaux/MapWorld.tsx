"use client";

import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

// Fix pour les icônes Leaflet par défaut dans Next.js
const fixLeafletIcon = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

export default function MapWorld() {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fixLeafletIcon();
    
    // Appel à ton API que nous avons créée précédemment
    fetch('/api/fuseaux')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("Erreur chargement GeoJSON:", err));
  }, []);

  // Style des pays sur la carte
  const countryStyle = {
    fillColor: "#6366f1", // Indigo-500
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.2
  };

  // Effet au survol
  const onEachCountry = (feature: any, layer: any) => {
    layer.on({
      mouseover: (e: any) => {
        const l = e.target;
        l.setStyle({
          fillOpacity: 0.6,
          fillColor: "#4f46e5"
        });
      },
      mouseout: (e: any) => {
        const l = e.target;
        l.setStyle(countryStyle);
      },
      click: (e: any) => {
        const countryName = feature.properties.name;
        // Optionnel : Tu peux ajouter une logique ici pour filtrer ton tableau
        console.log("Pays cliqué :", countryName);
      }
    });
    
    if (feature.properties && feature.properties.name) {
      layer.bindPopup(`<strong>${feature.properties.name}</strong>`);
    }
  };

  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-inner bg-slate-100">
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
        
        {geoData && (
          <GeoJSON 
            data={geoData} 
            style={countryStyle} 
            onEachFeature={onEachCountry}
          />
        )}
      </MapContainer>
    </div>
  );
}
