'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from "next/link";
import { ArrowLeft, Search, Database, Bus, ArrowUpDown } from "lucide-react";

interface StopArea {
  id: string;
  name: string;
  line: string;
  mode: string;
  lat: number;
  lng: number;
}

const TOULOUSE_CENTER: [number, number] = [43.6047, 1.4442];

export default function TisseoArretLogiquePage() {
  const [stopAreas, setStopAreas] = useState<StopArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // États pour le tri
  const [sortConfig, setSortConfig] = useState<{ key: keyof StopArea; direction: 'asc' | 'desc' } | null>({
    key: 'name',
    direction: 'asc'
  });

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Charger les données
  useEffect(() => {
    async function fetchStopAreas() {
      try {
        const response = await fetch('/api/tisseoarretlogique');
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data = await response.json();
        
        const formattedData = data.map((item: any) => ({
          id: item.code_log,
          name: item.nom_log,
          line: item.conc_ligne,
          mode: item.conc_mode,
          lat: item.geo_point_2d.lat,
          lng: item.geo_point_2d.lon
        }));
        
        setStopAreas(formattedData);
      } catch (error) {
        console.error("Erreur de chargement JSON:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStopAreas();
  }, []);

  // 2. Initialisation de la carte (Leaflet)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoading) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      
      if (mapInstance.current) return;
      
      mapInstance.current = L.map(mapRef.current!).setView(TOULOUSE_CENTER, 12);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap'
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

  // 3. Logique de Filtrage ET de Tri (useMemo pour la performance)
  const filteredStops = useMemo(() => {
    // Filtrage
    let result = stopAreas.filter(s => 
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.line?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Tri
    if (sortConfig !== null) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [stopAreas, searchQuery, sortConfig]);

  // Fonction pour déclencher le tri
  const handleSort = (key: keyof StopArea) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // 4. Mise à jour des marqueurs sur la carte
  useEffect(() => {
    if (!isMapReady || !mapInstance.current) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      markersLayer.current.clearLayers();
      
      // On affiche les 150 premiers filtrés pour la fluidité de la carte
      filteredStops.slice(0, 150).forEach((stop) => {
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: #e11d48; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });
        
        L.marker([stop.lat, stop.lng], { icon: customIcon })
          .bindPopup(`<strong>${stop.name}</strong><br/>Lignes: ${stop.line}<br/>Mode: ${stop.mode}`)
          .addTo(markersLayer.current);
      });
    };

    updateMarkers();
  }, [isMapReady, filteredStops]);

  return (
    <div className="max-w-7xl mx-auto p-4 min-h-screen bg-slate-50">
      <nav className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-rose-600 font-bold hover:underline">
          <ArrowLeft size={18} /> Retour
        </Link>
      </nav>

      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">📍 Arrêts Logiques Tisséo</h1>
        <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
          <Database size={14} />
          <span>{isLoading ? 'Chargement...' : `${filteredStops.length} arrêts trouvés sur ${stopAreas.length}`}</span>
        </div>
      </header>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Chercher un arrêt ou une ligne (ex: 67, L1, Capitole...)"
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="mb-8 border border-slate-200 rounded-xl h-[400px] relative z-0 overflow-hidden shadow-inner bg-slate-200"> 
        <div ref={mapRef} className="h-full w-full" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
            <tr>
              <th 
                className="p-3 cursor-pointer hover:text-rose-600 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">Nom <ArrowUpDown size={14} /></div>
              </th>
              <th 
                className="p-3 cursor-pointer hover:text-rose-600 transition-colors"
                onClick={() => handleSort('line')}
              >
                <div className="flex items-center gap-1">Lignes <ArrowUpDown size={14} /></div>
              </th>
              <th className="p-3">Mode</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStops.slice(0, 100).map((stop) => (
              <tr key={stop.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-medium">
                  <div className="flex items-center gap-2">
                    <Bus size={14} className="text-rose-500" />
                    {stop.name}
                  </div>
                </td>
                <td className="p-3 text-slate-600 font-mono text-xs">{stop.line}</td>
                <td className="p-3">
                  <span className="capitalize text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded">
                    {stop.mode}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredStops.length > 100 && (
          <div className="p-4 text-center text-slate-400 text-xs italic border-t border-slate-100 bg-slate-50">
            Affichage des 100 premiers résultats. Utilisez la recherche pour affiner.
          </div>
        )}
        
        {filteredStops.length === 0 && !isLoading && (
          <div className="p-10 text-center text-slate-500">
            Aucun arrêt trouvé pour cette recherche.
          </div>
        )}
      </div>
    </div>
  );
}
