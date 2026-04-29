"use client";

import { MapContainer, TileLayer, GeoJSON, ZoomControl, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';

// Interface pour typer les données reçues de PAYS_DATA
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

  // Correction pour les icônes Leaflet par défaut (évite les bugs d'affichage)
  useEffect(() => {
    fetch('/api/fuseaux')
      .then(res => {
        if (!res.ok) throw new Error("Réponse API corrompue");
        return res.json();
      })
      .then(data => setTimezoneData(data))
      .catch(err => console.error("Erreur front-end:", err));
  }, []);

  // Fonction utilitaire pour normaliser l'offset et faciliter la comparaison
  const normalizeOffset = (offsetStr: string): number => {
    // Transforme "UTC +5:30" ou "UTC -4" en nombre décimal (ex: 5.5 ou -4)
    const match = offsetStr.match(/UTC\s*([+-]?\d+)(?::(\d+))?/);
    if (!match) return 0;
    const hours = parseInt(match[1]);
    const minutes = match[2] ? parseInt(match[2]) / 60 : 0;
    return hours >= 0 ? hours + minutes : hours - minutes;
  };

  // Style des bandes de couleurs
  const timezoneStyle = (feature: any) => {
    // Récupère l'offset depuis le GeoJSON (vérifiez si c'est 'zone', 'time_zone' ou 'utc_offset' dans votre JSON)
    const offset = feature.properties?.time_zone ?? feature.properties?.zone ?? feature.properties?.utc_offset ?? 0;
    const hue = ((parseFloat(offset) + 12) * 15); 
    
    return {
      fillColor: `hsl(${hue}, 70%, 60%)`,
      weight: 1,
      opacity: 0.7,
      color: 'white',
      fillOpacity: 0.4, // Augmenté légèrement pour la visibilité
    };
  };

  const onEachTimezone = (feature: any, layer: any) => {
    // 1. Récupérer l'offset brut du polygone
    const rawOffset = feature.properties?.time_zone ?? feature.properties?.zone ?? feature.properties?.utc_offset ?? 0;
    const numericOffset = parseFloat(rawOffset);

    // 2. Chercher la ville correspondante avec une tolérance pour les nombres flottants
    const matchingCity = markers?.find(m => {
      const markerVal = normalizeOffset(m.offset);
      return Math.abs(markerVal - numericOffset) < 0.01; // Tolérance pour éviter les erreurs de calcul (ex: 5.5 vs 5.50001)
    });

    // 3. Contenu de la Popup
    const cityName = matchingCity ? matchingCity.ville : "Zone Horaire";
    const paysName = matchingCity ? matchingCity.pays : "Région";
    const displayOffset = numericOffset >= 0 ? `+${numericOffset}` : numericOffset;

    layer.bindPopup(`
      <div style="font-family: sans-serif; padding: 5px; text-align: center; min-width: 120px;">
        <div style="text-transform: uppercase; font-size: 10px; color: #64748b; font-weight: bold; letter-spacing: 0.05em;">Ville de référence</div>
        <strong style="font-size: 16px; color: #1e293b; display: block; margin: 4px 0;">${cityName}</strong>
        <div style="font-size: 12px; color: #3b82f6; font-weight: bold;">
          ${paysName} <br/> <span style="color: #64748b; font-size: 10px;">(UTC ${displayOffset})</span>
        </div>
      </div>
    `);

    layer.on({
      mouseover: (e: any) => {
        const l = e.target;
        l.setStyle({ fillOpacity: 0.7, weight: 2 });
      },
      mouseout: (e: any) => {
        const l = e.target;
        l.setStyle({ fillOpacity: 0.4, weight: 1 });
      },
      click: (e: any) => {
        // Zoom automatique sur la zone au clic
        const l = e.target;
        if (l.getBounds) e.target._map.fitBounds(l.getBounds());
      }
    });
  };

  return (
    <div className="h-[550px] w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-900 bg-[#aad3df] relative">
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        minZoom={2}
        maxBounds={[[-85, -180], [85, 180]]}
        scrollWheelZoom={true} 
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
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
            radius={6} 
            pathOptions={{ 
              color: 'white', 
              fillColor: '#0f172a', 
              fillOpacity: 1, 
              weight: 2 
            }}
          >
            <Tooltip direction="top" offset={[0, -5]} opacity={1}>
              <div className="text-xs font-bold px-1">
                {city.ville} <span className="text-blue-600 font-mono">({city.offset})</span>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}

        <ZoomControl position="bottomright" />
      </MapContainer>
      
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl text-[11px] font-bold text-slate-700 z-[1000] shadow-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
          CLIQUEZ SUR UNE ZONE OU UN POINT
        </div>
      </div>
    </div>
  );
}
