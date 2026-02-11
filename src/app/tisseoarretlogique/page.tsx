'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import { ArrowLeft, Search, ChevronDown, MapPin, Database, Bus } from "lucide-react";

// --- Interface Tisséo v2 ---
interface StopArea {
  id: string;
  name: string;
  cityName: string;
  lat: number;
  lng: number;
}

const TOULOUSE_CENTER: [number, number] = [43.6047, 1.4442];

export default function TisseoArretLogiquePage() {
  const [stopAreas, setStopAreas] = useState<StopArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Charger les données de l'API Tisséo (via votre API route interne)
  useEffect(() => {
    async function fetchStopAreas() {
      try {
        // Remplacez par votre endpoint réel (ex: api/tisseo/stop_areas)
        const response = await fetch('/api/tisseo/stop_areas'); 
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data = await response.json();
        
        // On adapte les données reçues au format de notre interface
        const formattedData = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          cityName: item.cityName,
          lat: parseFloat(item.y), // Tisséo v2 renvoie souvent Y pour latitude
          lng: parseFloat(item.x)  // et X pour longitude
        }));
        
        setStopAreas(formattedData);
      } catch (error) {
        console.error("Erreur de chargement Tisséo:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStopAreas();
  }, []);

  // 2. Initialisation de la carte Leaflet (Strictement Client-Side)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoading) return;

    const initMap = async () => {
      // Imports dynamiques pour éviter les erreurs de build SSR
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      
      if (mapInstance.current) return;
      
      mapInstance.current = L.map(mapRef.current!).setView(TOULOUSE_CENTER, 13);
      
      // Fond de carte sombre pour le look "Radar"
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO'
      }).addTo(mapInstance.current);
      
      markersLayer.current = L.layerGroup().addTo(mapInstance.current);
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

  // Filtrage des arrêts
  const filteredStops = stopAreas
    .filter(s => 
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.cityName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  // 3. Mise à jour des marqueurs quand la liste filtrée change
  useEffect(() => {
    if (!isMapReady || !mapInstance.current) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      markersLayer.current.clearLayers();
      
      filteredStops.slice(0, 100).forEach((stop, i) => { // Limite à 100 pour la performance
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 9px; box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);">${i + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        
        L.marker([stop.lat, stop.lng], { icon: customIcon })
          .bindPopup(`<strong>${stop.name}</strong><br/>${stop.cityName}`)
          .addTo(markersLayer.current);
      });
    };

    updateMarkers();
  }, [isMapReady, filteredStops]);

  return (
    <div className="max-w-7xl mx-auto p-4 bg-[#050505] min-h-screen text-white">
      <nav className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-red-500 font-bold hover:underline">
          <ArrowLeft size={18} /> Retour au Radar
        </Link>
      </nav>

      <header className="mb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">
              📡 Zones d'arrêts <span className="text-red-600">Tisséo</span>
            </h1>
            <div className="flex items-center gap-2 text-slate-400 font-bold text-sm mt-2">
              <Database size={16} />
              <span>{isLoading ? 'Synchronisation...' : `${filteredStops.length} zones détectées`}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Barre de recherche */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input 
          type="text"
          placeholder="Rechercher un arrêt (ex: Marengo, Jean Jaurès...)"
          className="w-full bg-white/5 pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:ring-2 focus:ring-red-600 outline-none transition-all text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Conteneur de la carte avec style "Glassmorphism" */}
      <div className="mb-8 border border-white/10 rounded-2xl bg-white/5 h-[40vh] md:h-[55vh] relative z-0 overflow-hidden shadow-2xl"> 
        <div ref={mapRef} className="h-full w-full" />
      </div>

      {/* Liste des arrêts */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase font-bold text-[11px]">
            <tr>
              <th className="p-4 w-12 text-center">#</th>
              <th className="p-4">Nom de la Zone</th>
              <th className="p-4 hidden md:table-cell">Commune</th>
              <th className="p-4 text-right">Identifiant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredStops.map((stop, i) => (
              <tr 
                key={stop.id}
                onClick={() => setExpandedId(expandedId === stop.id ? null : stop.id)}
                className={`cursor-pointer transition-colors ${expandedId === stop.id ? 'bg-red-600/10' : 'hover:bg-white/5'}`}
              >
                <td className="p-4 text-center font-bold text-slate-600">{i + 1}</td>
                <td className="p-4 font-bold">
                    <div className="flex items-center gap-2">
                        <Bus size={14} className="text-red-500" />
                        {stop.name}
                    </div>
                </td>
                <td className="p-4 hidden md:table-cell text-slate-400">{stop.cityName}</td>
                <td className="p-4 text-right font-mono text-[10px] text-red-400">{stop.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
