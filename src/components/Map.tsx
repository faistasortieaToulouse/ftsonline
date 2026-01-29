"use client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Configuration de l'icône par défaut (obligatoire pour corriger le bug d'affichage Leaflet/Next.js)
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Composant pour déplacer la vue de la carte
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 10);
  }, [center, map]);
  return null;
}

const COORDS = {
  toulouse: [43.6045, 1.4442],
  carcassonne: [43.2122, 2.3537],
  montpellier: [43.6108, 3.8767]
};

export default function Map({ ville }: { ville: string }) {
  const position = (COORDS[ville as keyof typeof COORDS] || COORDS.toulouse) as [number, number];

  return (
    <div className="h-[400px] w-full z-0">
      <MapContainer 
        center={position} 
        zoom={10} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup className="capitalize">
            Météo actuelle : {ville}
          </Popup>
        </Marker>
        <ChangeView center={position} />
      </MapContainer>
    </div>
  );
}
