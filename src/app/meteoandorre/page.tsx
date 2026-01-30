"use client";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

const PAROISSES = [
  { id: "andorra-la-vella", pos: [42.5063, 1.5218], label: "Andorra la Vella" },
  { id: "canillo", pos: [42.5676, 1.5976], label: "Canillo" },
  { id: "encamp", pos: [42.5361, 1.5828], label: "Encamp" },
  { id: "escaldes-engordany", pos: [42.5072, 1.5341], label: "Escaldes-Engordany" },
  { id: "la-massana", pos: [42.5449, 1.5148], label: "La Massana" },
  { id: "ordino", pos: [42.5562, 1.5332], label: "Ordino" },
  { id: "sant-julia-de-loria", pos: [42.4637, 1.4913], label: "Sant Julià de Lòria" },
];

export default function MapAndorre({ onCityChange }: { onCityChange: (id: string) => void }) {
  const [showMap, setShowMap] = useState(false);
  const [customIcon, setCustomIcon] = useState<L.Icon | null>(null);

  useEffect(() => {
    // 1. On vérifie qu'on est bien côté client (navigateur)
    if (typeof window !== "undefined") {
      // 2. On crée l'icône seulement ici
      const icon = L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      setCustomIcon(icon);

      // Nettoyage Leaflet
      const container = L.DomUtil.get('map-container-andorre');
      if (container !== null) { 
        (container as any)._leaflet_id = null; 
      }
      
      setShowMap(true);
    }
    return () => setShowMap(false);
  }, []);

  // Si on est sur le serveur, on affiche juste un cadre vide (pour éviter l'erreur window)
  if (!showMap || !customIcon) {
    return <div className="h-[400px] w-full bg-slate-100 rounded-[1.5rem] animate-pulse" />;
  }

  return (
    <div id="map-container-andorre" className="h-[400px] w-full rounded-[1.5rem] overflow-hidden border border-slate-200">
      <MapContainer center={[42.54, 1.56]} zoom={11} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {PAROISSES.map((p) => (
          <Marker 
            key={p.id} 
            position={p.pos as [number, number]} 
            icon={customIcon} // Utilisation de l'icône créée dans l'useEffect
            eventHandlers={{ click: () => onCityChange(p.id) }}
          >
            <Popup><div className="font-bold">{p.label}</div></Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
