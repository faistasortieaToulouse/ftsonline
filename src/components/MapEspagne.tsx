"use client";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// --- Configuration de l'icône du marqueur ---
const iconEspagne = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// --- Liste des coordonnées pour les marqueurs ---
const MARQUEURS = [
  { id: "ainsa", pos: [42.4170, 0.1388], label: "Ainsa" },
  { id: "huesca", pos: [42.1362, -0.4087], label: "Huesca" },
  { id: "barbastro", pos: [42.0357, 0.1266], label: "Barbastro" },
  { id: "lerida", pos: [41.6176, 0.6236], label: "Lérida" },
  { id: "tremp", pos: [42.1670, 0.8944], label: "Tremp" },
  { id: "berga", pos: [42.1039, 1.8463], label: "Berga" },
  { id: "ripoll", pos: [42.2010, 2.1911], label: "Ripoll" },
  { id: "olot", pos: [42.1810, 2.4901], label: "Olot" },
  { id: "figueras", pos: [42.2665, 2.9610], label: "Figueras" },
  { id: "cadaques", pos: [42.2887, 3.2778], label: "Cadaqués" },
  { id: "portbou", pos: [42.4253, 3.1601], label: "Portbou" },
  { id: "le-perthus", pos: [42.4637, 2.8640], label: "Le Perthus" },
  { id: "pas-de-la-case", pos: [42.5422, 1.7333], label: "Pas de la Case" },
  { id: "bossost", pos: [42.7850, 0.6922], label: "Bossòst" },
  { id: "st-lary", pos: [42.8176, 0.3228], label: "Saint-Lary" },
  { id: "luchon", pos: [42.7894, 0.5950], label: "Bagnères-de-Luchon" },
];

interface MapProps {
  onCityChange: (id: string) => void;
}

export default function MapEspagne({ onCityChange }: MapProps) {
  // Correction pour éviter les bugs de rendu CSS Leaflet sur Next.js
  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, []);

  return (
    <div className="h-[400px] w-full z-0">
      <MapContainer 
        center={[42.3, 1.5]} 
        zoom={8} 
        scrollWheelZoom={false}
        className="h-full w-full rounded-[1.5rem]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {MARQUEURS.map((m) => (
          <Marker 
            key={m.id} 
            position={m.pos as [number, number]} 
            icon={iconEspagne}
            eventHandlers={{
              click: () => {
                onCityChange(m.id);
              },
            }}
          >
            <Popup>
              <div className="text-center">
                <p className="font-bold text-slate-800 m-0">{m.label}</p>
                <p className="text-[10px] text-orange-600 m-0 font-bold uppercase">Cliquez pour la météo</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}