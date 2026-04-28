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
    // On s'assure d'avoir un nombre pour le calcul de la couleur
    const raw = feature.properties?.time_zone ?? feature.properties?.zone ?? 0;
    const offset = typeof raw === 'string' ? parseFloat(raw) : raw;
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
    // 1. Récupération propre de l'offset (string ou number)
    const rawOffset = feature.properties?.time_zone ?? feature.properties?.zone ?? 0;
    const numericOffset = typeof rawOffset === 'string' ? parseFloat(rawOffset) : rawOffset;
    
    // 2. Recherche robuste de la ville
    const matchingCity = markers?.find(m => {
      // On extrait juste le nombre de "UTC +1" ou "UTC -5:30"
      const markerVal = parseFloat(m.offset.replace(/[^\d.-]/g, ''));
      return markerVal === numericOffset;
    });

    // 3. Construction du contenu avec sécurité si matchingCity est indéfini
    const cityName = matchingCity ? matchingCity.ville : "Zone Horaire";
    const paysName = matchingCity ? matchingCity.pays : "Région";
    
    // Formatage de l'affichage de l'offset (ex: +1 au lieu de 1)
    const displayOffset = numericOffset >= 0 ? `+${numericOffset}` : numericOffset;

    layer.bindPopup(`
      <div style="font-family: sans-serif; padding: 5px; text-align: center; min-width: 150px;">
        <div style="text-transform: uppercase; font-size: 10px; color: #64748b; font-weight: bold; letter-spacing: 0.5px;">Ville de référence</div>
        <strong style="font-size: 16px; color: #1e293b; display: block; margin: 4px 0;">${cityName}</strong>
        <div style="font-size: 12px; color: #4f46e5; font-weight: bold; background: #f0f1ff; padding: 2px 8px; rounded: 4px; display: inline-block;">
          ${paysName} (UTC ${displayOffset})
        </div>
      </div>
    `, { className: 'custom-timezone-popup' });

    layer.on({
      mouseover: (e: any) => {
        const l = e.target;
        l.setStyle({ fillOpacity: 0.6, weight: 2 });
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
        
        {timezoneData && (
          <GeoJSON 
            data={timezoneData} 
            style={timezoneStyle} 
            onEachFeature={onEachTimezone}
          />
        )}

        {markers && markers.map((city, idx) => (
          <CircleMarker 
            key={`${city.ville}-${idx}`} 
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
                {city.ville} <span className="text-indigo-600">({city.offset})</span>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}

        <ZoomControl position="bottomright" />
      </MapContainer>
      
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl text-[11px] font-bold text-slate-700 z-[1000] shadow-lg border border-slate-200 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></span>
          Cliquez sur une zone pour voir la ville repère
        </div>
      </div>
    </div>
  );
}
