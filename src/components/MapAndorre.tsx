"use client";

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

const PAROISSES = [
  { id: "andorra-la-vella", pos: [42.5063, 1.5218], label: "Andorra la Vella" },
  { id: "canillo", pos: [42.5676, 1.5976], label: "Canillo" },
  { id: "encamp", pos: [42.5361, 1.5828], label: "Encamp" },
  { id: "escaldes-engordany", pos: [42.5072, 1.5341], label: "Escaldes" },
  { id: "la-massana", pos: [42.5449, 1.5148], label: "La Massana" },
  { id: "ordino", pos: [42.5562, 1.5332], label: "Ordino" },
  { id: "sant-julia-de-loria", pos: [42.4637, 1.4913], label: "Sant Julià" },
];

export default function MapAndorre({ onCityChange }: { onCityChange: (id: string) => void }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    // 1. Vérification de sécurité pour éviter la double initialisation
    if (!mapRef.current) return;
    
    // Si l'instance existe déjà ou si le DOM contient déjà une carte Leaflet
    if (mapInstance.current || (mapRef.current as any)._leaflet_id) return;

    import('leaflet').then((L) => {
      // Re-vérification après l'import dynamique au cas où le composant aurait été démonté
      if (!mapRef.current || (mapRef.current as any)._leaflet_id) return;

      // Supprimer les punaises par défaut
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const createTextLabel = (name: string) => {
        return L.divIcon({
          className: 'custom-label-andorre',
          html: `
            <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
              <div style="background-color: white; padding: 3px 8px; border-radius: 5px; border: 1.5px solid #4f46e5; box-shadow: 0 2px 5px rgba(0,0,0,0.1); min-width: 80px; text-align: center;">
                <div style="font-weight: 800; font-size: 10px; color: #1e1b4b; font-family: sans-serif;">${name}</div>
                <div style="font-size: 7px; color: #6366f1; font-weight: bold; text-transform: uppercase; font-family: sans-serif;">Andorre</div>
              </div>
              <div style="width: 2px; height: 5px; background-color: #4f46e5;"></div>
            </div>`,
          iconSize: [0, 0]
        });
      };

      // Initialisation de la carte
      const map = L.map(mapRef.current).setView([42.54, 1.56], 11);
      mapInstance.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      PAROISSES.forEach((p) => {
        const marker = L.marker(p.pos as [number, number], { 
          icon: createTextLabel(p.label) 
        }).addTo(map);

        marker.on('click', () => {
          onCityChange(p.id);
        });
      });

      // Correction de l'affichage (tuiles grises)
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    });

    // Nettoyage au démontage
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [onCityChange]);

  return (
    <div className="h-[400px] w-full rounded-[1.5rem] overflow-hidden border border-slate-200 shadow-inner relative">
      <style jsx global>{`
        .custom-label-andorre {
          background: none !important;
          border: none !important;
        }
      `}</style>
      <div ref={mapRef} className="h-full w-full" style={{ zIndex: 0 }} />
    </div>
  );
}