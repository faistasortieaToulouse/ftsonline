'use client';

import { useEffect, useRef, useState } from "react";
import 'leaflet/dist/leaflet.css';

interface EtatUSA {
  nom: string;
  genre: string;
  ordre_entree: number;
  date_entree: string;
  description: string;
  lat: number;
  lng: number;
}

export default function EtatsUSAPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [etats, setEtats] = useState<EtatUSA[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetch("/api/EtatsUSA")
      .then(async (res) => {
        const data = await res.json();
        if (Array.isArray(data)) setEtats(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || mapInstance.current) return;
      const L = (await import('leaflet')).default;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // OPTIMISATION MOBILE : On désactive le scrollWheelZoom pour faciliter la navigation sur la page
      mapInstance.current = L.map(mapRef.current, {
        scrollWheelZoom: false, 
        tap: true // Active le support tactile propre
      }).setView([39.8283, -98.5795], 4);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);

      setIsReady(true);
    };
    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isReady || !mapInstance.current || etats.length === 0) return;
    const addMarkers = async () => {
      const L = (await import('leaflet')).default;
      const markersGroup = L.featureGroup();

      etats.forEach((etat) => {
        if (etat.lat && etat.lng) {
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color:#2563eb; color:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-weight:bold; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3); font-size:10px;">${etat.ordre_entree}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const marker = L.marker([etat.lat, etat.lng], { icon: customIcon });
          marker.bindTooltip(`<strong>${etat.nom}</strong>`, { direction: 'top', offset: [0, -10] });
          marker.bindPopup(`
            <div style="color: black; padding: 2px; font-family: sans-serif; max-width: 200px;">
              <strong style="font-size: 14px;">#${etat.ordre_entree} - ${etat.nom}</strong><br>
              <small style="color: #666;">Entrée : ${new Date(etat.date_entree).toLocaleDateString('fr-FR')}</small>
              <p style="font-size: 12px; margin-top: 5px;">${etat.description}</p>
            </div>
          `);
          marker.addTo(markersGroup);
        }
      });
      markersGroup.addTo(mapInstance.current);
    };
    addMarkers();
  }, [isReady, etats]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      <header className="mb-6 md:mb-10">
        {/* Titre adaptatif : plus petit sur mobile */}
        <h1 className="text-2xl md:text-4xl font-black text-blue-900 flex flex-wrap items-center gap-2 md:gap-3">
          <span>🇺🇸</span> Ordre d'entrée des États
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-2 italic">Chronologie de l'Union</p>
      </header>

      {/* Carte adaptative : moins haute sur mobile */}
      <div
        ref={mapRef}
        className="h-[40vh] md:h-[60vh] w-full mb-8 border-2 md:border-4 border-white shadow-xl rounded-2xl bg-slate-100 overflow-hidden z-0"
      >
        {!isReady && (
          <div className="flex items-center justify-center h-full bg-white/50">
            <p className="animate-pulse font-bold text-blue-600">Chargement...</p>
          </div>
        )}
      </div>

      <h2 className="text-xl md:text-2xl font-bold mb-6 text-red-700 flex items-center gap-2">
        <span className="h-1 w-8 bg-red-700 rounded"></span> Palmarès
      </h2>

      {/* Grille : 1 col (mobile), 2 cols (tablette), 3 cols (desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {etats.map((etat, i) => (
          <div 
            key={i} 
            className="p-4 md:p-5 border-l-4 border-blue-600 bg-white shadow-md rounded-r-lg hover:shadow-lg transition-all active:scale-95 md:active:scale-100"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-2xl md:text-3xl font-black text-slate-100">#{etat.ordre_entree}</span>
              <span className="text-[10px] font-bold uppercase px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                {etat.date_entree}
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-blue-900">{etat.nom}</h3>
            <p className="text-xs md:text-sm text-gray-600 mt-2 line-clamp-3 md:line-clamp-none">
              {etat.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
