"use client";

import { MapContainer, TileLayer, GeoJSON, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

export default function MapWorld() {
  const [timezoneData, setTimezoneData] = useState(null);

  useEffect(() => {
    fetch('/api/fuseaux')
      .then(res => {
        if (!res.ok) throw new Error("Réponse API corrompue");
        return res.json();
      })
      .then(data => {
        console.log("Fuseaux chargés avec succès !");
        setTimezoneData(data);
      })
      .catch(err => console.error("Erreur front-end:", err));
  }, []);

  /**
   * 1. STYLE DYNAMIQUE : On colore chaque bande selon son décalage UTC
   * Cela permet de voir les fuseaux au premier coup d'oeil.
   */
  const timezoneStyle = (feature: any) => {
    // Dans ne_10m_time_zones, le décalage est souvent dans 'zone' ou 'time_zone'
    const offset = feature.properties?.zone || feature.properties?.time_zone || 0;
    
    // On crée un dégradé de couleur (du bleu au violet/rouge selon l'heure)
    // -12h = bleu froid, +12h = violet/rose chaud
    const hue = ((offset + 12) * 15); 
    
    return {
      fillColor: `hsl(${hue}, 70%, 60%)`,
      weight: 1,
      opacity: 0.7,
      color: 'white', // Ligne séparatrice entre les bandes
      fillOpacity: 0.35, // Un peu plus opaque pour être plus "parlant"
    };
  };

  /**
   * 2. INTERACTION : Au survol et au clic
   */
  const onEachTimezone = (feature: any, layer: any) => {
    const zoneName = feature.properties?.name || feature.properties?.tzid || "Zone inconnue";
    const offset = feature.properties?.time_zone ?? feature.properties?.zone ?? "0";
    
    // Popup plus élégant
    layer.bindPopup(`
      <div style="font-family: sans-serif; padding: 5px;">
        <strong style="font-size: 14px; color: #1e293b;">${zoneName}</strong><br/>
        <span style="color: #6366f1; font-weight: bold;">UTC ${offset >= 0 ? '+' : ''}${offset}:00</span>
      </div>
    `);

    layer.on({
      // Effet au survol : la bande devient plus foncée
      mouseover: (e: any) => {
        const l = e.target;
        l.setStyle({ fillOpacity: 0.7, weight: 2 });
        l.bringToFront();
      },
      // On remet le style normal quand la souris part
      mouseout: (e: any) => {
        const l = e.target;
        l.setStyle({ fillOpacity: 0.35, weight: 1 });
      },
      // Clic : Tu pourrais ici déclencher un filtre sur ton tableau
      click: (e: any) => {
        console.log("Zone cliquée :", zoneName, "Offset:", offset);
      }
    });
  };

  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-900 bg-[#aad3df]">
      <MapContainer 
        center={[20, 0] as any} 
        zoom={2} 
        minZoom={2}
        maxBounds={[[-90, -180], [90, 180]]} // Empêche de dériver dans le vide
        scrollWheelZoom={true} 
        className="h-full w-full"
        zoomControl={false} // Désactivé pour le placer manuellement
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

        <ZoomControl position="bottomright" />
      </MapContainer>
      
      {/* Petite légende d'aide */}
      <div className="absolute bottom-2 left-2 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-slate-600 z-[1000] shadow-sm">
        Survolez une bande pour voir le décalage UTC
      </div>
    </div>
  );
}
