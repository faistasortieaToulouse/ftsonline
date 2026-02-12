'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from "next/link";
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, Loader2, Search } from "lucide-react";
import type { Map, LayerGroup, LatLngBounds } from 'leaflet';

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
  
  const [nameRange, setNameRange] = useState("all");
  const [lineRange, setLineRange] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<Map | null>(null);
  const markersLayer = useRef<LayerGroup | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Récupération des données (Inchangé mais typé)
  useEffect(() => {
    async function fetchStops() {
      try {
        const response = await fetch('/api/tisseotia');
        const rawData = await response.json();
        const dataArray = Array.isArray(rawData) ? rawData : [];

        const cleanedData: PhysicalStop[] = dataArray.map((item: any) => ({
          id: item.id_hastus || Math.random().toString(),
          name: item.nom_tia || "Nom inconnu",
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

  // 2. Logique de Filtrage
  const filteredStops = useMemo(() => {
    return stops.filter(s => {
      // Filtre géographique
      if (mapBounds) {
        if (!mapBounds.contains([s.lat, s.lng])) return false;
      }

      // Filtre par nom (A-E)
      if (nameRange !== "all") {
        const firstLetter = s.name?.[0]?.toUpperCase() || "";
        if (!nameRange.includes(firstLetter)) return false;
      }

      // Filtre par ligne
      if (lineRange !== "all") {
        if (!s.lines.some(l => l.startsWith(lineRange))) return false;
      }

      // Filtre par recherche texte
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        return s.name.toLowerCase().includes(lowerQuery) || 
               s.city.toLowerCase().includes(lowerQuery);
      }

      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [stops, mapBounds, nameRange, lineRange, searchQuery]);

  // 3. Initialisation Leaflet
  useEffect(() => {
    if (isLoading || !mapRef.current || mapInstance.current) return;
    
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      
      // Fix icônes
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, { 
        zoomControl: false,
        tap: false 
      }).setView(TOULOUSE_CENTER, 14);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      
      const layers = L.layerGroup().addTo(map);
      markersLayer.current = layers;
      mapInstance.current = map;

      map.on('moveend', () => {
        setMapBounds(map.getBounds());
      });

      // Initialisation du premier bounds
      setMapBounds(map.getBounds());
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

  // 4. Update Marqueurs (Utilisation de circleMarker pour la performance)
  useEffect(() => {
    if (!isMapReady || !markersLayer.current) return;

    const renderMarkers = async () => {
      const L = (await import('leaflet')).default;
      markersLayer.current?.clearLayers();
      
      // On limite à 150 pour garder une carte fluide
      filteredStops.slice(0, 150).forEach((stop) => {
        const marker = L.circleMarker([stop.lat, stop.lng], {
          radius: 6,
          fillColor: "#FF5500", 
          color: "white",
          weight: 2,
          fillOpacity: 0.9
        });

        marker.bindPopup(`
          <div class="font-sans">
            <p class="font-bold text-sm">${stop.name}</p>
            <p class="text-xs text-gray-500">${stop.city}</p>
            <div class="mt-1 flex flex-wrap gap-1">
              ${stop.lines.slice(0, 5).map(l => `<span class="bg-gray-100 px-1 rounded text-[9px]">${l}</span>`).join('')}
            </div>
          </div>
        `);
        marker.addTo(markersLayer.current!);
      });
    };

    renderMarkers();
  }, [filteredStops, isMapReady]);

  const focusStop = (lat: number, lng: number) => {
    mapInstance.current?.flyTo([lat, lng], 17, { duration: 1.2 });
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-orange-500" size={40} />
        <p className="text-slate-500 font-medium">Récupération du réseau Tisséo...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
       <header className="h-16 bg-white border-b px-4 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft size={20}/>
            </Link>
            <h1 className="font-bold text-slate-800">Points d'arrêt Tisséo</h1>
          </div>
          <div className="text-xs font-bold bg-orange-100 text-orange-600 px-3 py-1.5 rounded-full border border-orange-200">
            {filteredStops.length} résultat{filteredStops.length > 1 ? 's' : ''}
          </div>
       </header>

       <div className="flex flex-1 overflow-hidden">
          <aside className="w-full lg:w-[400px] flex flex-col border-r bg-white z-10">
            <div className="p-4 space-y-3 border-b bg-slate-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input 
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Rechercher un arrêt ou une ville..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select 
                  value={nameRange} 
                  onChange={e => setNameRange(e.target.value)} 
                  className="text-xs border border-slate-200 p-2 rounded-md bg-white outline-none focus:border-orange-500"
                >
                   <option value="all">Tous les noms</option>
                   <option value="ABCDE">A - E</option>
                   <option value="FGHIJ">F - J</option>
                   <option value="KLMNO">K - O</option>
                </select>
                <select 
                  value={lineRange} 
                  onChange={e => setLineRange(e.target.value)} 
                  className="text-xs border border-slate-200 p-2 rounded-md bg-white outline-none focus:border-orange-500"
                >
                   <option value="all">Toutes les lignes</option>
                   <option value="L">Linéo (L)</option>
                   <option value="T">Tramway (T)</option>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredStops.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm italic">
                    Aucun arrêt ne correspond à vos critères dans cette zone.
                </div>
              ) : (
                filteredStops.map(stop => (
                  <button 
                    key={stop.id}
                    onClick={() => focusStop(stop.lat, stop.lng)}
                    className="w-full text-left p-4 hover:bg-orange-50/50 transition-colors group"
                  >
                    <p className="font-semibold text-sm text-slate-700 group-hover:text-orange-600 transition-colors">{stop.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">{stop.city}</p>
                    {stop.lines.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                            {stop.lines.slice(0, 4).map(l => (
                                <span key={l} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                    {l}
                                </span>
                            ))}
                        </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </aside>

          <div className="hidden lg:block flex-1 relative bg-slate-200">
            <div ref={mapRef} className="absolute inset-0 z-0" />
            <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md border border-slate-200 text-[11px] font-medium text-slate-600">
              Déplacez la carte pour mettre à jour la liste
            </div>
          </div>
       </div>
    </div>
  );
}
