"use client";

import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapWorld() {
  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden border-4 border-slate-900 shadow-2xl">
      <MapContainer 
        center={[20, 0]} // Centré sur l'Atlantique pour voir tous les continents
        zoom={2} 
        minZoom={2}
        maxBounds={[[-90, -180], [90, 180]]} // Empêche de sortir du monde
        scrollWheelZoom={true}
        className="h-full w-full"
        zoomControl={false} // On le désactive pour le replacer à droite
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  );
}
