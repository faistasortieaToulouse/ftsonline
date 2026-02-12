'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from "next/link";
import { ArrowLeft, Bus, Map as MapIcon, Navigation, Loader2, Info, MapPin } from "lucide-react";

const TOULOUSE_CENTER: [number, number] = [43.6047, 1.4442];

export default function TisseoTadPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const geojsonLayer = useRef<any>(null); // Couche pour les polygones
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Récupération des données TAD
  useEffect(() => {
    async function fetchTad() {
      try {
        const response = await fetch('/api/tisseotad');
        const data = await response.json();
        setZones(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erreur de fetch TAD:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTad();
  }, []);

  // 2. Initialisation de la carte Leaflet
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoading) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      
      if (mapInstance.current) return;

      // Création de la carte
      mapInstance.current = L.map(mapRef.current!).setView(TOULOUSE_CENTER, 10);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);

      // Création du groupe pour les polygones
      geojsonLayer.current = L.featureGroup().addTo(mapInstance.current);
      
      setIsMapReady(true);
    };

    initMap();
  }, [isLoading]);

  // 3. Mise à jour des Polygones sur la carte
  useEffect(() => {
    if (!isMapReady) return;

    const drawPolygons = async () => {
      const L = (await import('leaflet')).default;
      geojsonLayer.current.clearLayers();

      zones.forEach((zone) => {
        if (!zone.geo_shape?.geometry) return;

        // Leaflet attend [Lat, Lon], Tisséo fournit [Lon, Lat]
        // On inverse les coordonnées du polygone
        const latLngs = zone.geo_shape.geometry.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]);

        const polygon = L.polygon(latLngs, {
          fillColor: `rgb(${zone.r}, ${zone.v}, ${zone.b})`,
          color: `rgb(${zone.r}, ${zone.v}, ${zone.b})`,
          weight: 2,
          fillOpacity: 0.5,
        });

        polygon.bindPopup(`
          <div style="font-family: sans-serif;">
            <b style="font-size: 14px;">Zone ${zone.id_tad}</b><br/>
            <span style="color: #666;">Départ : ${zone.arret_dep}</span>
          </div>
        `);

        polygon.addTo(geojsonLayer.current);
      });

      // Ajuster la vue pour voir tous les polygones si présents
      if (zones.length > 0) {
        mapInstance.current.fitBounds(geojsonLayer.current.getBounds(), { padding: [20, 20] });
      }
    };

    drawPolygons();
  }, [isMapReady, zones]);

  // 4. Fonction pour "FlyTo" vers une zone
  const handleFlyTo = (zone: any) => {
    if (!mapInstance.current) return;
    setSelectedZoneId(zone.id_tad);
    mapInstance.current.flyTo([zone.geo_point_2d.lat, zone.geo_point_2d.lon], 12, {
      duration: 1.5
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-slate-50">
        <Loader2 className="animate-spin text-orange-500" size={48} />
        <p className="text-slate-500 font-bold italic">Initialisation des zones TAD...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col gap-4 bg-slate-50 min-h-screen">
      <nav>
        <Link href="/" className="text-slate-600 font-bold flex items-center gap-2 hover:text-orange-600 transition-colors">
          <ArrowLeft size={18} /> Retour
        </Link>
      </nav>

      <header className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tighter uppercase">
            <Bus className="text-orange-500" size={32} /> Tisséo TAD
          </h1>
          <p className="text-slate-400 text-sm font-medium">Cartographie interactive des transports à la demande</p>
        </div>
        <div className="px-5 py-2 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">
          {zones.length} Zones répertoriées
        </div>
      </header>

      {/* ZONE CARTE */}
      <div className="h-[500px] rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative z-0">
        <div ref={mapRef} className="h-full w-full" />
      </div>

      {/* LISTE DES ZONES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {zones.map((zone) => (
          <div 
            key={zone.id_tad} 
            className={`bg-white p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${selectedZoneId === zone.id_tad ? 'border-orange-500 shadow-lg scale-[1.02]' : 'border-transparent shadow-sm hover:border-slate-200'}`}
            onClick={() => handleFlyTo(zone)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `rgb(${zone.r}, ${zone.v}, ${zone.b})` }} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zone #{zone.id_tad}</span>
              </div>
              <Navigation size={18} className={selectedZoneId === zone.id_tad ? "text-orange-500" : "text-slate-300"} />
            </div>

            <h2 className="text-xl font-black text-slate-800 mb-1 leading-none">{zone.arret_dep}</h2>
            <p className="text-xs font-bold text-orange-600 uppercase italic mb-4">Point de rabattement</p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-3">
              <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Périmètre</span>
                <p className="text-[11px] leading-tight text-slate-600 font-medium">
                  {zone.commune}
                </p>
              </div>
            </div>

            <button 
              className="mt-6 w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-orange-600 transition-colors"
            >
              Voir le périmètre sur la carte
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
