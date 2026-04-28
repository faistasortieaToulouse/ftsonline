"use client";

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

export default function MapWorld() {
  const [timezoneData, setTimezoneData] = useState(null);

  useEffect(() => {
    // On appelle TON API locale qui va lire le fichier dans /data/mapmonde/
    fetch('/api/fuseaux')
      .then(res => {
        if (!res.ok) throw new Error("Réponse API corrompue");
        return res.json();
      })
      .then(data => {
        console.log("Fuseaux chargés depuis le dossier data !");
        setTimezoneData(data);
      })
      .catch(err => console.error("Erreur front-end:", err));
  }, []);

  // Style adapté à ton dashboard violet
  const timezoneStyle = () => ({
    fillColor: "#8b5cf6", // Violet
    weight: 1,
    opacity: 0.6,
    color: 'white',
    fillOpacity: 0.15
  });

  const onEachTimezone = (feature: any, layer: any) => {
    // Attention : les propriétés peuvent varier selon le fichier GeoJSON utilisé
    // ne_10m_time_zones utilise souvent 'name' ou 'time_zone'
    const zoneName = feature.properties?.name || feature.properties?.tzid || "Zone inconnue";
    const offset = feature.properties?.time_zone !== undefined ? ` (UTC ${feature.properties.time_zone})` : "";
    
    layer.bindPopup(`<strong>${zoneName}</strong>${offset}`);
    
    layer.on({
      mouseover: (e: any) => e.target.setStyle({ fillOpacity: 0.4 }),
      mouseout: (e: any) => e.target.setStyle({ fillOpacity: 0.15 })
    });
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
