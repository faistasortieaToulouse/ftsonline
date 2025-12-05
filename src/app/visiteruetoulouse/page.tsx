'use client';

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Import dynamique pour éviter le problème avec Leaflet côté serveur
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

export default function VisiterRueToulousePage() {
  const [lieux, setLieux] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/visiteruetoulouse")
      .then(res => res.json())
      .then(data => setLieux(data.lieux))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4">Visiter les rues de Toulouse</h1>
      <p className="mb-6 text-muted-foreground">
        Carte interactive des bâtiments et lieux remarquables dans Toulouse.
      </p>

      <div className="w-full h-[600px]">
        <MapContainer center={[43.610, 1.444]} zoom={14} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {lieux.map(lieu => (
            <Marker key={lieu.id} position={[lieu.lat, lieu.lng]}>
              <Popup>
                {lieu.numero} {lieu.rue} : {lieu.lieu}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
