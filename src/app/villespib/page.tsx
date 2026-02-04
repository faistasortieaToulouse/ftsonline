'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// CSS obligatoire pour Leaflet
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes Leaflet dans Next.js
const icon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function VillesPIBPage() {
  const [villes, setVilles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/villespib');
        const data = await response.json();
        setVilles(data.classement_pib_france || []);
      } catch (error) {
        console.error("Erreur fetch:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-center">Chargement des données économiques...</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b p-4 shadow-sm">
        <h1 className="text-xl font-bold text-blue-900">Top 100 PIB des Villes de France</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Barre latérale : Liste des villes */}
        <aside className="w-1/4 overflow-y-auto border-r bg-white">
          {villes.map((v) => (
            <div key={v.rang} className="p-4 border-b hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">#{v.rang}</span>
                <span className="text-green-600 font-mono font-bold text-sm">{v.pib_mds_euros} Md€</span>
              </div>
              <h3 className="font-semibold mt-1">{v.ville}</h3>
              <p className="text-xs text-gray-500 line-clamp-1">{v.secteurs_cles}</p>
            </div>
          ))}
        </aside>

        {/* Zone Carte */}
        <main className="flex-1 relative">
          <MapContainer 
            center={[46.6, 2.2]} 
            zoom={6} 
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {villes.map((v) => (
              <Marker key={v.rang} position={[v.lat, v.lng]} icon={icon}>
                <Popup>
                  <div className="text-sm">
                    <strong className="text-lg">{v.ville}</strong> <br />
                    <span className="text-blue-600 font-bold">PIB : {v.pib_mds_euros} Milliards d'euros</span> <br />
                    <hr className="my-1" />
                    <strong>Secteurs :</strong> {v.secteurs_cles}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </main>
      </div>
    </div>
  );
}
