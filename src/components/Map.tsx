"use client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Correction pour les icônes par défaut de Leaflet dans Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Petit composant pour recentrer la carte quand on change de ville
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 9);
  }, [center, map]);
  return null;
}

const COORDS = {
  toulouse: [43.6045, 1.4442],
  carcassonne: [43.2122, 2.3537], // L'Aude
  montpellier: [43.6108, 3.8767]  // Occitanie
};

export default function Map({ ville }: { ville: string }) {
  const center = COORDS[ville as keyof typeof COORDS] || COORDS.toulouse;

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden border-4 border-white shadow-xl z-0">
      <MapContainer center={center as any} zoom={9} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center as any} icon={icon}>
          <Popup className="capitalize">{ville}</Popup>
        </Marker>
        <RecenterMap center={center as any} />
      </MapContainer>
    </div>
  );
}
