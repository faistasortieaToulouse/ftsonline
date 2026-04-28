"use client";

import { MapContainer, TileLayer, GeoJSON, ZoomControl, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

// On définit ce qu'est un "Marker" pour TypeScript
interface CityMarker {
  offset: string;
  pays: string;
  ville: string;
  zone: string;
  coords: [number, number];
  autres: string;
}

export default function MapWorld({ markers }: { markers: CityMarker[] }) {
  const [timezoneData, setTimezoneData] = useState(null);

  useEffect(() => {
    fetch('/api/fuseaux')
      .then(res => {
        if (!res.ok) throw new Error("Réponse API corrompue");
        return res.json();
      })
      .then(data => setTimezoneData(data))
      .catch(err => console.error("Erreur front-end:", err));
  }, []);

  const timezoneStyle = (feature: any) => {
    const offset = feature.properties?.zone || feature.properties?.time_zone || 0;
    const hue = ((offset + 12) * 15); 
    
    return {
      fillColor: `hsl(${hue}, 70%, 60%)`,
      weight: 1,
      opacity: 0.7,
      color: 'white',
      fillOpacity: 0.35,
    };
  };

  const onEachTimezone = (feature: any, layer: any) => {
    const zoneName = feature.properties?.name || feature.properties?.tzid || "Zone inconnue";
    const offset = feature.properties?.time_zone ?? feature.properties?.zone ?? "0";
    
    layer.bindPopup(`
      <div style="font-family: sans-serif; padding: 5px;">
        <strong style="font-size: 14px; color: #1e293b;">${zoneName}</strong><br/>
        <span style="color: #6366f1; font-weight: bold;">UTC ${offset >= 0 ? '+' : ''}${offset}:00</span>
      </div>
    `);

    layer.on({
      mouseover: (e: any) => {
        const l = e.target;
        l.setStyle({ fillOpacity: 0.7, weight: 2 });
      },
      mouseout: (e: any) => {
        const l = e.target;
        l.setStyle({ fillOpacity: 0.35, weight: 1 });
      }
    });
  };

  return (
    <div className="h-[550px] w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-900 bg-[#aad3df] relative">
      <MapContainer 
        center={[20, 0] as any} 
        zoom={2} 
        minZoom={2}
        maxBounds={[[-90, -180], [90, 180]]}
        scrollWheelZoom={true} 
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Couche des polygones de fuseaux */}
        {timezoneData && (
          <GeoJSON 
            data={timezoneData} 
            style={timezoneStyle} 
            onEachFeature={onEachTimezone}
          />
        )}

        {/* AJOUT : Affichage des points pour chaque ville de ton tableau */}
        {markers && markers.map((city, idx) => (
          <CircleMarker 
            key={idx} 
            center={city.coords} 
            radius={5} 
            pathOptions={{ 
              color: 'white', 
              fillColor: '#1e293b', 
              fillOpacity: 1, 
              weight: 2 
            }}
          >
            <Tooltip direction="top" offset={[0, -5]} opacity={1}>
              <div className="text-xs font-bold px-1">
                {city.ville} <span className="text-blue-600">({city.offset})</span>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}

        <ZoomControl position="bottomright" />
      </MapContainer>
      
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-[11px] font-bold text-slate-700 z-[1000] shadow-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          Interactif : Survolez les zones ou les villes
        </div>
      </div>
    </div>
  );
}
