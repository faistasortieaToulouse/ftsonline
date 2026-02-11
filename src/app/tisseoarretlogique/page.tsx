'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import { ArrowLeft, Search, Database, Bus } from "lucide-react";

// --- Interface adaptée à ton JSON réel ---
interface StopArea {
  id: string;
  name: string;
  line: string;    // conc_ligne dans ton JSON
  mode: string;    // conc_mode dans ton JSON
  lat: number;
  lng: number;
}

const TOULOUSE_CENTER: [number, number] = [43.6047, 1.4442];

export default function TisseoArretLogiquePage() {
  const [stopAreas, setStopAreas] = useState<StopArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Charger les données depuis ton API locale
  useEffect(() => {
    async function fetchStopAreas() {
      try {
        const response = await fetch('/api/tisseoarretlogique'); 
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data = await response.json();
        
        // MAPPAGE CORRECT DU JSON
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

  // 2. Initialisation de la carte
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

  // Filtrage
  const filteredStops = stopAreas.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.line?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 3. Mise à jour des marqueurs
  useEffect(() => {
    if (!isMapReady || !mapInstance.current) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      markersLayer.current.clearLayers();
      
      // On affiche les 150 premiers pour garder de la fluidité
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
          <span>{isLoading ? 'Chargement du fichier...' : `${filteredStops.length} arrêts chargés`}</span>
        </div>
      </header>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Filtrer par nom ou par ligne (ex: 67, L1...)"
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
              <th className="p-3">Nom</th>
              <th className="p-3">Lignes</th>
              <th className="p-3">Mode</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStops.slice(0, 50).map((stop) => (
              <tr key={stop.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-medium flex items-center gap-2">
                  <Bus size={14} className="text-rose-500" />
                  {stop.name}
                </td>
                <td className="p-3 text-slate-600">{stop.line}</td>
                <td className="p-3 capitalize text-xs bg-slate-100 rounded px-2 py-1 inline-block mt-2 ml-3">
                  {stop.mode}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStops.length > 50 && (
          <div className="p-3 text-center text-slate-400 text-xs italic border-t border-slate-100">
            Affichage limité aux 50 premiers résultats dans le tableau.
          </div>
        )}
      </div>
    </div>
  );
}
