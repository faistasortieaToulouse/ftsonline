"use client";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

const iconAndorre = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
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
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const container = L.DomUtil.get('map-container-andorre');
    if (container !== null) { (container as any)._leaflet_id = null; }
    setShowMap(true);
    return () => setShowMap(false);
  }, []);

  return (
    <div id="map-container-andorre" className="h-[400px] w-full rounded-[1.5rem] overflow-hidden">
      {showMap && (
        <MapContainer center={[42.54, 1.56]} zoom={11} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {PAROISSES.map((p) => (
            <Marker key={p.id} position={p.pos as [number, number]} icon={iconAndorre}
              eventHandlers={{ click: () => onCityChange(p.id) }}>
              <Popup><div className="font-bold">{p.label}</div></Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}