'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from "next/link";
// IMPORT DU CSS ICI (ou dans layout.tsx)
import 'leaflet/dist/leaflet.css';
import { 
  ArrowLeft, 
  Loader2, 
  Search 
} from "lucide-react";

// --- Types ---
interface PhysicalStop {
  id: string;
  name: string;
  address: string;
  city: string;
  lines: string[];
  mode: string;
  lat: number;
  lng: number;
}

const TOULOUSE_CENTER: [number, number] = [43.6047, 1.4442];

export default function TisseoArretPhysiquePage() {
  const [stops, setStops] = useState<PhysicalStop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtres
  const [nameRange, setNameRange] = useState("all");
  const [lineRange, setLineRange] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mapBounds, setMapBounds] = useState<any>(null);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Récupération des données
  useEffect(() => {
    async function fetchStops() {
      try {
        const response = await fetch('/api/tisseotia');
        const rawData = await response.json();
        const dataArray = Array.isArray(rawData) ? rawData : [];

        const cleanedData: PhysicalStop[] = dataArray.map((item: any) => ({
          id: item.id_hastus || Math.random().toString(),
          name: item.nom_arret || "Nom inconnu",
          address: item.adresse || "Adresse non renseignée",
          city: item.commune || "",
          lines: item.conc_ligne ? item.conc_ligne.split(' ') : [],
          mode: item.conc_mode || "",
          lat: item.geo_point_2d?.lat || 0,
          lng: item.geo_point_2d?.lon || 0
        })).filter(s => s.lat !== 0);

        setStops(cleanedData);
      } catch (error) {
        console.error("Erreur de fetch:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStops();
  }, []);

  // 2. Logique de Filtrage (Corrigé pour Leaflet Bounds)
  const filteredStops = useMemo(() => {
    return stops.filter(s => {
      let isInMap = true;
      if (mapBounds) {
        const ne = mapBounds.getNorthEast();
        const sw = mapBounds.getSouthWest();
        isInMap = s.lat <= ne.lat && s.lat >= sw.lat &&
                  s.lng <= ne.lng && s.lng >= sw.lng;
      }

      const firstLetter = s.name?.[0]?.toUpperCase() || "";
      const matchesNameRange = nameRange === "all" || nameRange.includes(firstLetter);
      const matchesLine = lineRange === "all" || s.lines.some(l => l.startsWith(lineRange));
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.city.toLowerCase().includes(searchQuery.toLowerCase());

      return isInMap && matchesNameRange && matchesLine && matchesSearch;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [stops, mapBounds, nameRange, lineRange, searchQuery]);

  // 3. Initialisation Leaflet
  useEffect(() => {
    if (isLoading || !mapRef.current || mapInstance.current) return;
    
    let L: any;
    const initMap = async () => {
      const leaflet = await import('leaflet');
      L = leaflet.default;
      
      // Fix pour les icônes par défaut de Leaflet dans Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      mapInstance.current = L.map(mapRef.current!, { 
        zoomControl: false,
        tap: false 
      }).setView(TOULOUSE_CENTER, 14);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);

      L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);
      markersLayer.current = L.layerGroup().addTo(mapInstance.current);
      
      const update = () => {
        setMapBounds(mapInstance.current.getBounds());
      };

      mapInstance.current.on('moveend', update);
      update();
      setIsMapReady(true);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isLoading]);

  // 4. Update Marqueurs (Nettoyage immédiat)
  useEffect(() => {
    if (!isMapReady || !markersLayer.current) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      markersLayer.current.clearLayers();
      
      filteredStops.slice(0, 100).forEach((stop) => {
        const marker = L.circleMarker([stop.lat, stop.lng], {
          radius: 6,
          fillColor: "#FF5500", 
          color: "white",
          weight: 2,
          fillOpacity: 0.9
        });

        marker.bindPopup(`<b>${stop.name}</b><br/><small>${stop.city}</small>`);
        marker.addTo(markersLayer.current);
      });
    };

    updateMarkers();
  }, [filteredStops, isMapReady]);

  const focusStop = (lat: number, lng: number) => {
    if (mapInstance.current) {
      mapInstance.current.flyTo([lat, lng], 17, { duration: 1.2 });
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-orange-500" size={40} />
        <p className="text-slate-500">Chargement des données Tisséo...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
       {/* Header Simplifié */}
       <header className="h-16 bg-white border-b px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Link href="/"><ArrowLeft size={20}/></Link>
            <h1 className="font-bold">Réseau Tisséo</h1>
          </div>
          <div className="text-xs font-bold bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
            {filteredStops.length} arrêts visibles
          </div>
       </header>

       <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-full lg:w-[400px] flex flex-col border-r bg-white">
            <div className="p-4 space-y-3 shadow-sm z-10">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input 
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={nameRange} onChange={e => setNameRange(e.target.value)} className="text-xs border p-2 rounded-md">
                   <option value="all">Tous les noms</option>
                   <option value="ABCDE">A - E</option>
                </select>
                <select value={lineRange} onChange={e => setLineRange(e.target.value)} className="text-xs border p-2 rounded-md">
                   <option value="all">Toutes les lignes</option>
                   <option value="L">Linéo</option>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredStops.map(stop => (
                <div 
                  key={stop.id}
                  onClick={() => focusStop(stop.lat, stop.lng)}
                  className="p-4 border-b hover:bg-orange-50 cursor-pointer transition-colors"
                >
                  <p className="font-semibold text-sm">{stop.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase">{stop.city}</p>
                </div>
              ))}
            </div>
          </aside>

          {/* Map Container */}
          <div className="hidden lg:block flex-1 relative">
            <div ref={mapRef} className="absolute inset-0 z-0" />
            <div className="absolute top-4 left-4 z-[1000] bg-white/80 backdrop-blur p-2 rounded shadow text-[10px]">
              Déplacez la carte pour filtrer
            </div>
          </div>
       </div>
    </div>
  );
}
