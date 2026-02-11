'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from "next/link";
import { ArrowLeft, Search, Database, Bus, ArrowUpDown, Map as MapIcon, Layers } from "lucide-react";

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
  const [selectedLine, setSelectedLine] = useState("all");
  
  // État pour stocker les limites de la carte (Nord, Sud, Est, Ouest)
  const [mapBounds, setMapBounds] = useState<any>(null);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Chargement des données
  useEffect(() => {
    async function fetchStopAreas() {
      try {
        const response = await fetch('/api/tisseoarretlogique');
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data = await response.json();
        const formattedData = data.map((item: any) => ({
          id: item.code_log,
          name: item.nom_log,
          line: item.conc_ligne || "",
          mode: item.conc_mode || "",
          lat: item.geo_point_2d.lat,
          lng: item.geo_point_2d.lon
        }));
        setStopAreas(formattedData);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStopAreas();
  }, []);

  // 2. Filtrage intelligent (Recherche + Ligne + ZONE VISIBLE)
  const visibleStops = useMemo(() => {
    return stopAreas.filter(s => {
      // Filtre 1 : Recherche texte
      const matchesSearch = s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.line?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filtre 2 : Sélection ligne
      const matchesLine = selectedLine === "all" || s.line.includes(selectedLine);

      // Filtre 3 : ZONE VISIBLE (Si la carte est prête et qu'on a des limites)
      let isInView = true;
      if (mapBounds) {
        isInView = s.lat <= mapBounds._northEast.lat && 
                   s.lat >= mapBounds._southWest.lat &&
                   s.lng <= mapBounds._northEast.lng &&
                   s.lng >= mapBounds._southWest.lng;
      }

      return matchesSearch && matchesLine && isInView;
    });
  }, [stopAreas, searchQuery, selectedLine, mapBounds]);

  // 3. Initialisation Carte
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoading) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      
      if (mapInstance.current) return;
      
      mapInstance.current = L.map(mapRef.current!).setView(TOULOUSE_CENTER, 14);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OSM'
      }).addTo(mapInstance.current);

      markersLayer.current = L.layerGroup().addTo(mapInstance.current);

      // --- LE SECRET : Écouter les mouvements de la carte ---
      const updateVisibleBounds = () => {
        setMapBounds(mapInstance.current.getBounds());
      };

      mapInstance.current.on('moveend', updateVisibleBounds);
      updateVisibleBounds(); // Initialisation au démarrage
      
      setIsMapReady(true);
    };

    initMap();
  }, [isLoading]);

  // 4. Mise à jour des marqueurs (On affiche tout ce qui est filtré par texte/ligne)
  useEffect(() => {
    if (!isMapReady) return;
    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      markersLayer.current.clearLayers();
      
      // On limite l'affichage des points sur la carte à 300 pour la performance
      visibleStops.slice(0, 300).forEach((stop) => {
        const marker = L.circleMarker([stop.lat, stop.lng], {
          radius: 6,
          fillColor: "#e11d48",
          color: "white",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        });
        marker.bindPopup(`<strong>${stop.name}</strong><br/>Lignes: ${stop.line}`).addTo(markersLayer.current);
      });
    };
    updateMarkers();
  }, [isMapReady, visibleStops]);

  // Liste des lignes pour le sélecteur
  const uniqueLines = useMemo(() => {
    const lines = new Set<string>();
    stopAreas.forEach(s => s.line?.split(',').forEach(l => lines.add(l.trim())));
    return Array.from(lines).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [stopAreas]);

  return (
    <div className="max-w-7xl mx-auto p-4 min-h-screen bg-slate-50 flex flex-col gap-4">
      <nav>
        <Link href="/" className="inline-flex items-center gap-2 text-rose-600 font-bold hover:underline">
          <ArrowLeft size={18} /> Retour
        </Link>
      </nav>

      <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <MapIcon className="text-rose-500" /> Exploration Interactive
          </h1>
          <p className="text-sm text-slate-500 italic">Le tableau affiche uniquement les arrêts visibles sur la carte.</p>
        </div>
        <div className="flex gap-2 items-center bg-rose-50 px-4 py-2 rounded-lg border border-rose-100">
          <Layers size={16} className="text-rose-600" />
          <span className="text-rose-700 font-bold">{visibleStops.length}</span>
          <span className="text-rose-600 text-sm font-medium">arrêts dans cette zone</span>
        </div>
      </div>

      {/* Carte (Plus grande pour l'exploration) */}
      <div className="border-4 border-white rounded-2xl h-[500px] relative z-0 overflow-hidden shadow-xl ring-1 ring-slate-200"> 
        <div ref={mapRef} className="h-full w-full" />
      </div>

      {/* Filtres de secours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" placeholder="Chercher dans la zone..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500 bg-white"
          value={selectedLine} onChange={(e) => setSelectedLine(e.target.value)}
        >
          <option value="all">Toutes les lignes de la zone</option>
          {uniqueLines.map(line => <option key={line} value={line}>Ligne {line}</option>)}
        </select>
      </div>

      {/* Tableau Dynamique */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm max-h-[600px] overflow-y-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-slate-600 font-bold">
            <tr>
              <th className="p-4">Nom de l'arrêt</th>
              <th className="p-4">Lignes disponibles</th>
              <th className="p-4 text-right pr-6">Position</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleStops.slice(0, 100).map((stop) => (
              <tr key={stop.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-slate-800">
                  <div className="flex items-center gap-2 italic">
                    <Bus size={14} className="text-rose-500" />
                    {stop.name}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {stop.line.split(',').map(l => (
                      <span key={l} className="px-2 py-0.5 bg-slate-100 border text-[10px] font-bold rounded text-slate-600">
                        {l.trim()}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-4 text-right text-[10px] text-slate-400 font-mono pr-6">
                  {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visibleStops.length === 0 && (
          <div className="p-10 text-center text-slate-400">
            Aucun arrêt dans cette zone. Déplacez la carte ou dézoomez.
          </div>
        )}
      </div>
    </div>
  );
}
