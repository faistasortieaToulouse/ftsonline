'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from "next/link";
import { 
  ArrowLeft, 
  MapPin, 
  Loader2, 
  Filter, 
  Search, 
  Navigation,
  Info
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

  // 1. Récupération des données (Inchangé)
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

  // 2. Logique de Filtrage
  const filteredStops = useMemo(() => {
    return stops.filter(s => {
      const isInMap = mapBounds 
        ? s.lat <= mapBounds._northEast.lat && s.lat >= mapBounds._southWest.lat &&
          s.lng <= mapBounds._northEast.lng && s.lng >= mapBounds._southWest.lng
        : true;

      const firstLetter = s.name?.[0]?.toUpperCase() || "";
      const matchesNameRange = nameRange === "all" || nameRange.includes(firstLetter);
      const matchesLine = lineRange === "all" || s.lines.some(l => l.startsWith(lineRange));
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.city.toLowerCase().includes(searchQuery.toLowerCase());

      return isInMap && matchesNameRange && matchesLine && matchesSearch;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [stops, mapBounds, nameRange, lineRange, searchQuery]);

  // 3. Initialisation Leaflet SÉCURISÉE
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoading) return;
    
    let L: any;
    const initMap = async () => {
      L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      
      // Sécurité : évite de créer plusieurs instances sur le même DOM
      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current!, { 
        zoomControl: false,
        tap: false // Améliore le scroll sur mobile
      }).setView(TOULOUSE_CENTER, 14);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OSM CartoDB'
      }).addTo(mapInstance.current);

      L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

      markersLayer.current = L.layerGroup().addTo(mapInstance.current);
      
      const update = () => {
        if (mapInstance.current) {
          setMapBounds(mapInstance.current.getBounds());
        }
      };

      mapInstance.current.on('moveend', update);
      update();
      setIsMapReady(true);
    };

    initMap();

    // NETTOYAGE : très important pour Next.js
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isLoading]);

  // 4. Update Marqueurs (Optimisé)
  useEffect(() => {
    if (!isMapReady || !markersLayer.current) return;

    const renderMarkers = async () => {
      const L = (await import('leaflet')).default;
      markersLayer.current.clearLayers();
      
      // On limite à 150 pour garder une fluidité parfaite
      filteredStops.slice(0, 150).forEach((stop) => {
        const marker = L.circleMarker([stop.lat, stop.lng], {
          radius: 7,
          fillColor: "#FF5500", 
          color: "white",
          weight: 2,
          fillOpacity: 1
        });

        marker.bindPopup(`
          <div style="min-width: 150px;">
            <b style="font-size: 14px; color: #1e293b;">${stop.name}</b><br/>
            <span style="font-size: 11px; color: #64748b;">${stop.city}</span>
            <div style="display: flex; gap: 4px; margin-top: 8px; flex-wrap: wrap;">
              ${stop.lines.slice(0, 5).map(l => `<span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; border: 1px solid #e2e8f0;">${l}</span>`).join('')}
            </div>
          </div>
        `);
        
        marker.addTo(markersLayer.current);
      });
    };

    renderMarkers();
  }, [isMapReady, filteredStops]);

  // Fonction pour centrer la carte sur un arrêt précis (quand on clique dans la liste)
  const focusStop = (lat: number, lng: number) => {
    if (mapInstance.current) {
      mapInstance.current.flyTo([lat, lng], 17, { duration: 1.5 });
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-white">
        <Loader2 className="animate-spin text-orange-500" size={48} />
        <p className="text-slate-600 font-medium">Chargement de la carte Tisseotia...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b sticky top-0 z-[1000]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold tracking-tight">Arrêts Physiques</h1>
          </div>
          <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg shadow-orange-200">
            {filteredStops.length} arrêts
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-80px)]">
        
        {/* Colonne Gauche : Filtres et Liste */}
        <div className="lg:col-span-5 flex flex-col gap-4 overflow-hidden">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Chercher un arrêt..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-orange-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select className="p-2 text-sm bg-white border rounded-xl" value={nameRange} onChange={e => setNameRange(e.target.value)}>
               <option value="all">Noms : Tous</option>
               <option value="ABCDE">A - E</option>
               <option value="FGHIJ">F - J</option>
               <option value="KLMNO">K - O</option>
               <option value="PQRST">P - T</option>
               <option value="UVWXYZ">U - Z</option>
            </select>
            <select className="p-2 text-sm bg-white border rounded-xl" value={lineRange} onChange={e => setLineRange(e.target.value)}>
               <option value="all">Lignes : Toutes</option>
               <option value="L">Linéos (L)</option>
               <option value="T">Tram (T)</option>
               <option value="1">Lignes 10-19</option>
               <option value="2">Lignes 20-29</option>
            </select>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-y-auto flex-1">
            {filteredStops.map((stop) => (
              <div 
                key={stop.id} 
                onClick={() => focusStop(stop.lat, stop.lng)}
                className="p-4 hover:bg-orange-50 cursor-pointer border-b last:border-0 transition-colors group"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800 group-hover:text-orange-600">{stop.name}</span>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded uppercase">{stop.city}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {stop.lines.map((l, i) => (
                    <span key={i} className="text-[9px] font-bold px-1.5 py-0.5 bg-white border rounded text-slate-600">{l}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne Droite : Carte */}
        <div className="lg:col-span-7 bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden relative">
          <div ref={mapRef} className="w-full h-full z-10" />
          
          {/* Badge flottant sur la carte */}
          <div className="absolute top-4 left-4 z-[1001] bg-white/90 backdrop-blur-md p-3 rounded-2xl border shadow-sm max-w-[200px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Zone active</p>
            <p className="text-xs text-slate-600 leading-tight">Déplacez la carte pour filtrer la liste.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
