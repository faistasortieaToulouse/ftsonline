"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // 1. Initialisation de la carte
    mapInstance.current = L.map(mapRef.current).setView([42.3, 1.5], 8);

    // 2. Couche de tuiles (OSM)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    // 3. Configuration de l'icône
    const iconEspagne = L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    // 4. Ajout des marqueurs
    MARQUEURS.forEach((m) => {
      const marker = L.marker(m.pos as [number, number], { icon: iconEspagne })
        .addTo(mapInstance.current!)
        .bindPopup(`
          <div style="text-align: center; font-family: sans-serif;">
            <p style="font-weight: bold; color: #1e293b; margin: 0;">${m.label}</p>
            <p style="font-size: 10px; color: #ea580c; margin: 0; font-weight: bold; text-transform: uppercase;">
              Cliquez pour la météo
            </p>
          </div>
        `);

      // Événement au clic
      marker.on('click', () => {
        onCityChange(m.id);
      });
    });

    // 5. Cleanup : On détruit la carte quand le composant est démonté
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [onCityChange]);

  return (
    <div 
      ref={mapRef} 
      className="h-[400px] w-full z-0 rounded-[1.5rem]" 
      style={{ overflow: 'hidden' }}
    />
  );
}