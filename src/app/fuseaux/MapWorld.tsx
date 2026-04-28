"use client";

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

// L'URL doit être sur une seule ligne continue
const TIMEZONE_GEOJSON_URL = "https://raw.githubusercontent.com/evansiroky/timezone-boundary-builder/master/releases/2023d/timezones_with_oceans.geojson";

export default function MapWorld() {
  const [timezoneData, setTimezoneData] = useState(null);

  useEffect(() => {
    fetch(TIMEZONE_GEOJSON_URL)
      .then(res => res.json())
      .then(data => setTimezoneData(data))
      .catch(err => console.error("Erreur chargement fuseaux:", err));
  }, []);

  const timezoneStyle = () => ({
    fillColor: "#4f46e5",
    weight: 1,
    opacity: 0.5,
    color: 'white',
    fillOpacity: 0.15
  });

  const onEachTimezone = (feature: any, layer: any) => {
    if (feature.properties && feature.properties.tzid) {
      layer.bindPopup(`<strong>Zone :</strong> ${feature.properties.tzid}`);
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
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {timezoneData && (
          <GeoJSON 
            data={timezoneData} 
            style={timezoneStyle} 
            onEachFeature={onEachTimezone}
          />
        )}
      </MapContainer>
    </div>
  );
}
