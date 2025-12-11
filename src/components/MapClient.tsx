'use client';
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function MapClient({ items }: { items: any[] }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || items.length === 0) return null;

  const center: [number, number] = [items[0].lat, items[0].lon];

  return (
    <MapContainer
      key={items.map(i => i.id).join('-')}
      center={center}
      zoom={13}
      scrollWheelZoom
      className="h-[600px] w-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {items.map(item => (
        <Marker key={item.id} position={[item.lat, item.lon]}>
          <Popup>
            <strong>{item.name}</strong><br/>
            {item.installation}<br/>
            {item.famille}<br/>
            {item.type}<br/>
            {item.adresse}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
