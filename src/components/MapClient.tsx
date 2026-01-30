'use client';

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix icônes Leaflet (toujours nécessaire hors MapContainer)
const customIcon = L.icon({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function MapClient({ items }: { items: any[] }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    // Si pas de div ou pas d'items, on ne fait rien
    if (!mapRef.current || items.length === 0) return;

    // Si la carte existe déjà, on ne la recrée pas, on met juste à jour la vue
    if (mapInstance.current) {
      mapInstance.current.setView([items[0].lat, items[0].lon], 13);
      return;
    }

    // 1. Initialisation manuelle
    mapInstance.current = L.map(mapRef.current).setView(
      [items[0].lat, items[0].lon], 
      13
    );

    // 2. Ajout de la couche de tuiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(mapInstance.current);

    // 3. Ajout des marqueurs (Boucle manuelle)
    items.forEach(item => {
      L.marker([item.lat, item.lon], { icon: customIcon })
        .addTo(mapInstance.current!)
        .bindPopup(`
          <strong>${item.name}</strong><br/>
          ${item.installation || ''}<br/>
          ${item.famille || ''}<br/>
          ${item.type || ''}<br/>
          ${item.adresse || ''}
        `);
    });

    // 4. Cleanup : Destruction propre au démontage
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [items]); // On relance si les items changent

  return (
    <div 
      ref={mapRef} 
      className="h-[600px] w-full rounded-lg shadow-md border border-slate-200"
      style={{ zIndex: 0 }}
    />
  );
}