"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- Liste des coordonnées pour les marqueurs ---
const MARQUEURS = [
  { id: "ainsa", pos: [42.4170, 0.1388], label: "Ainsa", zone: "Aragon" },
  { id: "huesca", pos: [42.1362, -0.4087], label: "Huesca", zone: "Aragon" },
  { id: "barbastro", pos: [42.0357, 0.1266], label: "Barbastro", zone: "Aragon" },
  { id: "lerida", pos: [41.6176, 0.6236], label: "Lérida", zone: "Catalogne" },
  { id: "tremp", pos: [42.1670, 0.8944], label: "Tremp", zone: "Catalogne" },
  { id: "berga", pos: [42.1039, 1.8463], label: "Berga", zone: "Catalogne" },
  { id: "ripoll", pos: [42.2010, 2.1911], label: "Ripoll", zone: "Catalogne" },
  { id: "olot", pos: [42.1810, 2.4901], label: "Olot", zone: "Catalogne" },
  { id: "figueras", pos: [42.2665, 2.9610], label: "Figueras", zone: "Catalogne" },
  { id: "cadaques", pos: [42.2887, 3.2778], label: "Cadaqués", zone: "Catalogne" },
  { id: "portbou", pos: [42.4253, 3.1601], label: "Portbou", zone: "Catalogne" },
  { id: "le-perthus", pos: [42.4637, 2.8640], label: "Le Perthus", zone: "Frontière" },
  { id: "pas-de-la-case", pos: [42.5422, 1.7333], label: "Pas de la Case", zone: "Andorre" },
  { id: "bossost", pos: [42.7850, 0.6922], label: "Bossòst", zone: "Val d'Aran" },
  { id: "st-lary", pos: [42.8176, 0.3228], label: "Saint-Lary", zone: "Hautes-Pyrénées" },
  { id: "luchon", pos: [42.7894, 0.5950], label: "Luchon", zone: "Haute-Garonne" },
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
    mapInstance.current = L.map(mapRef.current, {
        scrollWheelZoom: true // Optionnel : évite de zoomer par erreur en scrollant la page
    }).setView([42.3, 1.5], 8);

    // 2. Couche de tuiles (Style clair / Positron recommandé pour faire ressortir les labels)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(mapInstance.current);

    // 3. Fonction pour créer le marqueur HTML (Label)
    const createLabelIcon = (name: string, zone: string) => {
      return L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
            <div style="background-color: white; padding: 4px 10px; border-radius: 8px; border: 2px solid #ea580c; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 80px; text-align: center; cursor: pointer;">
              <div style="font-weight: 900; font-size: 11px; color: #1e293b; line-height: 1.1; white-space: nowrap;">${name}</div>
              <div style="font-size: 8px; font-weight: 700; color: #f97316; text-transform: uppercase; margin-top: 1px;">${zone}</div>
            </div>
            <div style="width: 2px; height: 6px; background-color: #ea580c;"></div>
          </div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });
    };

    // 4. Ajout des marqueurs
    MARQUEURS.forEach((m) => {
      const marker = L.marker(m.pos as [number, number], { 
        icon: createLabelIcon(m.label, m.zone) 
      }).addTo(mapInstance.current!);

      // Événement au clic
      marker.on('click', () => {
        onCityChange(m.id);
        // Petit effet visuel : on centre légèrement la carte sur le marqueur
        mapInstance.current?.panTo(m.pos as [number, number]);
      });
    });

    // 5. Cleanup
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
      className="h-full w-full z-0" 
      style={{ minHeight: '400px' }}
    />
  );
}