'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Event } from '@/lib/types';

// Fix icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function EventMap({ events }: { events: Event[] }) {
  return (
    <MapContainer
      center={[43.6045, 1.444]}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {events.map(event => (
        <Marker key={event.id} position={[43.6045, 1.444]}>
          <Popup>
            <strong>{event.name}</strong>
            <p>{event.location}</p>
            <p>{new Date(event.date).toLocaleString()}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
