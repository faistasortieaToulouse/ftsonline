"use client";

import { MapContainer, TileLayer, GeoJSON, ZoomControl, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

interface CityMarker {
  offset: string;
  pays: string;
  ville: string;
  zone: string;
  coords: [number, number];
  autres: string;
}

export default function MapWorld({ markers }: { markers: CityMarker[] }) {
  const [timezoneData, setTimezoneData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/fuseaux')
      .then(res => res.json())
      .then(data => setTimezoneData(data))
      .catch(err => console.error("Erreur chargement GeoJSON:", err));
  }, []);

  // 1. EXTRACTION ROBUSTE : Récupère l'offset du GeoJSON (ex: "5.5" ou 5.5)
  const getOffsetFromFeature = (feature: any): number => {
    const props = feature.properties;
    const val = props?.zone ?? props?.time_zone ?? props?.utc_offset ?? props?.OFFSET ?? 0;
    return typeof val === "string" ? parseFloat(val.replace(',', '.')) : val;
  };

  // 2. NORMALISATION : Transforme "UTC +5:30" en 5.5 ou "UTC -4" en -4
  const normalizeMarkerOffset = (offsetStr: string): number => {
    // Regex pour capturer le signe, l'heure et les minutes optionnelles
    const match = offsetStr.match(/UTC\s*([+-]?\d+)(?::(\d+))?/);
    if (!match) return 0;

    const hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) / 60 : 0;

    // Si l'heure est négative, on soustrait les minutes (ex: -3:30 -> -3.5)
    return hours >= 0 ? hours + minutes : hours - minutes;
  };

  const timezoneStyle = (feature: any) => {
    const offset = getOffsetFromFeature(feature);
    const hue = ((offset + 12) * 15) % 360; 
    
    return {
      fillColor: `hsl(${hue}, 70%, 55%)`,
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.5,
    };
  };

  const onEachTimezone = (feature: any, layer: any) => {
    const numericOffset = getOffsetFromFeature(feature);

    // 3. LIAISON : Comparaison des nombres décimaux
    const matchingCity = markers?.find(m => {
      const markerNumeric = normalizeMarkerOffset(m.offset);
      // Utilisation d'une petite marge d'erreur pour les flottants (0.01)
      return Math.abs(markerNumeric - numericOffset) < 0.01;
    });

    const cityName = matchingCity ? matchingCity.ville : "Zone Horaire";
    const paysName = matchingCity ? matchingCity.pays : "Région";
    
    // Formatage propre pour l'affichage (ex: 5.5 -> +5.5)
    const displayOffset = numericOffset >= 0 ? `+${numericOffset}` : numericOffset;

    layer.bindPopup(`
      <div style="font-family: sans-serif; padding: 5px; text-align: center; min-width: 140px;">
        <div style="text-transform: uppercase; font-size: 10px; color: #64748b; font-weight: bold;">Ville de référence</div>
        <strong style="font-size: 16px; color: #1e293b; display: block; margin: 4px 0;">${cityName}</strong>
        <div style="font-size: 12px; color: #3b82f6; font-weight: bold;">
          ${paysName} <br/> 
          <span style="color: #64748b; font-size: 11px;">(UTC ${displayOffset})</span>
        </div>
      </div>
    `);

    layer.on({
      mouseover: (e: any) => e.target.setStyle({ fillOpacity: 0.8, weight: 2 }),
      mouseout: (e: any) => e.target.setStyle({ fillOpacity: 0.5, weight: 1 }),
    });
  };

  return (
    <div className="h-[550px] w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-900 bg-[#aad3df] relative">
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        minZoom={2}
        maxBounds={[[-85, -180], [85, 180]]}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {timezoneData && (
          <GeoJSON 
            data={timezoneData} 
            style={timezoneStyle} 
            onEachFeature={onEachTimezone}
          />
        )}

        {markers?.map((city, idx) => (
          <CircleMarker 
            key={`${city.ville}-${idx}`} 
            center={city.coords} 
            radius={5} 
            pathOptions={{ color: 'white', fillColor: '#0f172a', fillOpacity: 1, weight: 2 }}
          >
            <Tooltip direction="top">
              <span className="font-bold">{city.ville}</span>
            </Tooltip>
          </CircleMarker>
        ))}

        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  );
}
