'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from "next/link";
import { ArrowLeft, Database, Bus, Map as MapIcon, ChevronDown, ListFilter, Hash } from "lucide-react";

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
  
  // États des Tranches
  const [nameRange, setNameRange] = useState("all");
  const [lineRange, setLineRange] = useState("all");
  const [mapBounds, setMapBounds] = useState<any>(null);

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

  // 2. Filtrage par Zone Carte (Bounding Box)
  const stopsInZone = useMemo(() => {
    return stopAreas.filter(s => {
      if (!mapBounds) return true;
      return s.lat <= mapBounds._northEast.lat && 
             s.lat >= mapBounds._southWest.lat &&
             s.lng <= mapBounds._northEast.lng &&
             s.lng >= mapBounds._southWest.lng;
    });
  }, [stopAreas, mapBounds]);

  // 3. Filtrage Final (Zone + Tranche Nom + Tranche Ligne)
  const finalStops = useMemo(() => {
    return stopsInZone.filter(s => {
      const firstLetter = s.name?.[0]?.toUpperCase() || "";
      
      // Filtre Tranche Nom (A-E, F-J, etc.)
      const matchesNameRange = nameRange === "all" || nameRange.includes(firstLetter);

      // Filtre Tranche Ligne (Lignes qui contiennent le chiffre de la tranche)
      // Note: Pour les lignes, on cherche si le numéro commence par le chiffre choisi
      const matchesLineRange = lineRange === "all" || s.line.split(',').some(l => l.trim().startsWith(lineRange));

      return matchesNameRange && matchesLineRange;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [stopsInZone, nameRange, lineRange]);

  // 4. Initialisation Carte
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
      const update = () => setMapBounds(mapInstance.current.getBounds());
      mapInstance.current.on('moveend', update);
      update();
      setIsMapReady(true);
    };
    initMap();
  }, [isLoading]);

  // 5. Update Markers
  useEffect(() => {
    if (!isMapReady) return;
    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      markersLayer.current.clearLayers();
      finalStops.slice(0, 150).forEach((stop) => {
        L.circleMarker([stop.lat, stop.lng], {
          radius: 5, fillColor: "#e11d48", color: "white", weight: 1, fillOpacity: 0.8
        }).bindPopup(`<strong>${stop.name}</strong><br/>Lignes: ${stop.line}`).addTo(markersLayer.current);
      });
    };
    updateMarkers();
  }, [isMapReady, finalStops]);

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col gap-4 bg-slate-50 min-h-screen">
      <nav>
        <Link href="/" className="inline-flex items-center gap-2 text-rose-600 font-bold hover:underline">
          <ArrowLeft size={18} /> Retour
        </Link>
      </nav>

      <header className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <MapIcon className="text-rose-500" /> Tisséo : Exploration par zone
        </h1>
        <div className="text-xs font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-500 uppercase">
          {finalStops.length} Résultats
        </div>
      </header>

      {/* Carte */}
      <div className="h-[400px] rounded-2xl overflow-hidden shadow-inner border bg-slate-200 relative z-0">
        <div ref={mapRef} className="h-full w-full" />
      </div>

      {/* LES TRANCHES (Sous la carte) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Tranches Alphabétiques (Nom) */}
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-600 mb-2">
            <ListFilter size={16} /> Tranche Alphabétique (Nom)
          </label>
          <div className="relative">
            <select 
              className="w-full p-3 bg-slate-50 border rounded-lg appearance-none outline-none focus:ring-2 focus:ring-rose-500"
              value={nameRange}
              onChange={(e) => setNameRange(e.target.value)}
            >
              <option value="all">Tous les noms dans cette zone</option>
              <option value="ABCDE">Tranche A - E</option>
              <option value="FGHIJ">Tranche F - J</option>
              <option value="KLMNO">Tranche K - O</option>
              <option value="PQRST">Tranche P - T</option>
              <option value="UVWXYZ">Tranche U - Z</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          </div>
        </div>

        {/* Tranches Numériques (Lignes) */}
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-600 mb-2">
            <Hash size={16} /> Tranche de Lignes (Commence par...)
          </label>
          <div className="relative">
            <select 
              className="w-full p-3 bg-slate-50 border rounded-lg appearance-none outline-none focus:ring-2 focus:ring-rose-500"
              value={lineRange}
              onChange={(e) => setLineRange(e.target.value)}
            >
              <option value="all">Toutes les lignes dans cette zone</option>
              <option value="L">Lignes "L" (Linéo)</option>
              <option value="1">Lignes commençant par 1 (14, 15, 18...)</option>
              <option value="2">Lignes commençant par 2 (20, 21, 27...)</option>
              <option value="3">Lignes commençant par 3 (31, 34...)</option>
              <option value="4">Lignes commençant par 4 (44, 45...)</option>
              <option value="5">Lignes commençant par 5 (50, 56...)</option>
              <option value="6">Lignes commençant par 6 (63, 67...)</option>
              <option value="7">Lignes commençant par 7 (70, 78...)</option>
              <option value="8">Lignes commençant par 8 (81, 83...)</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          </div>
        </div>
      </div>

      {/* Tableau Final */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 sticky top-0 border-b font-bold text-slate-600">
              <tr>
                <th className="p-4">Nom de l'Arrêt</th>
                <th className="p-4">Lignes</th>
                <th className="p-4">Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {finalStops.map((stop) => (
                <tr key={stop.id} className="hover:bg-rose-50/50 transition-colors">
                  <td className="p-4 font-bold flex items-center gap-2">
                    <Bus size={14} className="text-rose-500" /> {stop.name}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {stop.line.split(',').map((l, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-[10px] font-black rounded border">
                          {l.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-[10px] uppercase font-bold text-slate-400">{stop.mode}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {finalStops.length === 0 && (
            <div className="p-10 text-center text-slate-400 italic">
              Aucun arrêt trouvé. Essayez de bouger la carte ou de changer de tranche.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
