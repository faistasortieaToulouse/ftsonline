"use client";

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

const VILLES_AUDE = [
  { id: "carcassonne", pos: [43.212, 2.351], label: "Carcassonne", dept: "11", nomDept: "Aude" },
  { id: "lezignan", pos: [43.203, 2.757], label: "Lézignan", dept: "11", nomDept: "Aude" },
  { id: "narbonne", pos: [43.183, 3.004], label: "Narbonne", dept: "11", nomDept: "Aude" },
];

export default function MapAude({ onCityChange }: { onCityChange: (id: string) => void }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current || (mapRef.current as any)._leaflet_id) return;

    import('leaflet').then((L) => {
      if (!mapRef.current || (mapRef.current as any)._leaflet_id) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const createTextLabel = (name: string, dept: string, nomDept: string) => {
        return L.divIcon({
          className: 'custom-label-aude',
          html: `
            <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
              <div style="background-color: white; padding: 3px 10px; border-radius: 6px; border: 1.5px solid #4f46e5; box-shadow: 0 3px 8px rgba(0,0,0,0.15); min-width: 90px; text-align: center;">
                <div style="font-weight: 800; font-size: 11px; color: #1e1b4b; white-space: nowrap; font-family: sans-serif;">${name}</div>
                <div style="font-size: 7px; color: #6366f1; font-weight: bold; text-transform: uppercase; font-family: sans-serif;">${dept} - ${nomDept}</div>
              </div>
              <div style="width: 2px; height: 6px; background-color: #4f46e5;"></div>
            </div>`,
          iconSize: [0, 0]
        });
      };

      // Zoom un peu plus large pour voir les 3 villes
      mapInstance.current = L.map(mapRef.current).setView([43.20, 2.65], 9);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);

      VILLES_AUDE.forEach((v) => {
        const marker = L.marker(v.pos as [number, number], { 
          icon: createTextLabel(v.label, v.dept, v.nomDept) 
        }).addTo(mapInstance.current!);

        marker.on('click', () => {
          onCityChange(v.id);
          // Petit effet visuel : on centre légèrement sur la ville cliquée
          mapInstance.current.panTo(v.pos);
        });
      });

      setTimeout(() => mapInstance.current?.invalidateSize(), 100);
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [onCityChange]);

  return (
    <div className="h-[350px] w-full relative">
      <style jsx global>{`
        .custom-label-aude {
          background: none !important;
          border: none !important;
        }
      `}</style>
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}