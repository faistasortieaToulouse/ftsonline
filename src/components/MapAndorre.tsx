"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- Icône Andorre ---
const iconAndorre = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

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
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    // Sécurité : Si le div n'est pas prêt ou si la carte est déjà là, on ne fait rien
    if (!mapRef.current || mapInstance.current) return;

    // 1. Initialisation de la carte (Focus sur Andorre)
    mapInstance.current = L.map(mapRef.current).setView([42.54, 1.56], 11);

    // 2. Couche OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    // 3. Ajout des paroisses
    PAROISSES.forEach((p) => {
      const marker = L.marker(p.pos as [number, number], { icon: iconAndorre })
        .addTo(mapInstance.current!)
        .bindPopup(`<div style="font-weight: bold; font-family: sans-serif;">${p.label}</div>`);

      // Événement au clic
      marker.on('click', () => {
        onCityChange(p.id);
      });
    });

    // 4. Cleanup (Nettoyage OTAN)
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [onCityChange]);

  return (
    <div className="h-[400px] w-full rounded-[1.5rem] overflow-hidden border border-slate-200 shadow-inner">
      <div 
        ref={mapRef} 
        className="h-full w-full"
        style={{ zIndex: 0 }}
      />
    </div>
  );
}