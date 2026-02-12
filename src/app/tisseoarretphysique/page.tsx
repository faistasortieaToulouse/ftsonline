'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from "next/link";
import { ArrowLeft, Bus, Map as MapIcon, ChevronDown, ListFilter, Hash, MapPin, Loader2 } from "lucide-react";

interface PhysicalStop {
  id: string;
  name: string;
  address: string;
  city: string;
  lines: string;
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
  const [mapBounds, setMapBounds] = useState<any>(null);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Récupération et "Nettoyage" des données
  useEffect(() => {
    async function fetchStops() {
      try {
        const response = await fetch('/api/tisseoarretphysique');
        const rawData = await response.json();
        
        // Sécurité : On s'assure que rawData est un tableau
        const dataArray = Array.isArray(rawData) ? rawData : [];

        // Mapping rigoureux pour correspondre à ton JSON
        const cleanedData: PhysicalStop[] = dataArray.map((item: any) => ({
          id: item.id_hastus || Math.random().toString(),
          name: item.nom_arret || "Nom inconnu",
          address: item.adresse || "Adresse non renseignée",
          city: item.commune || "",
          lines: item.conc_ligne || "",
          mode: item.conc_mode || "",
          lat: item.geo_point_2d?.lat || 0,
          lng: item.geo_point_2d?.lon || 0
        })).filter(s => s.lat !== 0); // On retire les points sans coordonnées

        setStops(cleanedData);
      } catch (error) {
        console.error("Erreur de fetch:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStops();
  }, []);

  // 2. Filtrage Géographique (Bounding Box)
  const stopsInZone = useMemo(() => {
    if (!mapBounds) return stops;
    return stops.filter(s => 
      s.lat <= mapBounds._northEast.lat && 
      s.lat >= mapBounds._southWest.lat &&
      s.lng <= mapBounds._northEast.lng &&
      s.lng >= mapBounds._southWest.lng
    );
  }, [stops, mapBounds]);

  // 3. Filtrage par Tranches
  const finalStops = useMemo(() => {
    return stopsInZone.filter(s => {
      const firstLetter = s.name?.[0]?.toUpperCase() || "";
      const matchesName = nameRange === "all" || nameRange.includes(firstLetter);
      const matchesLine = lineRange === "all" || s.lines.split(' ').some(l => l.startsWith(lineRange));
      return matchesName && matchesLine;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [stopsInZone, nameRange, lineRange]);

  // 4. Leaflet Init
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
      update(); // Capture initiale
      setIsMapReady(true);
    };
    initMap();
  }, [isLoading]);

  // 5. Update Marqueurs
  useEffect(() => {
    if (!isMapReady) return;
    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      markersLayer.current.clearLayers();
      finalStops.slice(0, 150).forEach((stop) => {
        L.circleMarker([stop.lat, stop.lng], {
          radius: 5, fillColor: "#3b82f6", color: "white", weight: 1, fillOpacity: 0.8
        }).bindPopup(`<strong>${stop.name}</strong><br/>${stop.lines}`).addTo(markersLayer.current);
      });
    };
    updateMarkers();
  }, [isMapReady, finalStops]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-slate-50">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="text-slate-500 font-bold">Chargement des arrêts physiques...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col gap-4 bg-slate-50 min-h-screen">
      <nav>
        <Link href="/" className="text-blue-600 font-bold flex items-center gap-2 hover:underline">
          <ArrowLeft size={18} /> Retour Accueil
        </Link>
      </nav>

      <header className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <MapPin className="text-blue-500" /> Arrêts Physiques
          </h1>
          <p className="text-slate-500 text-sm">Exploration géographique par tranches</p>
        </div>
        <div className="px-6 py-2 bg-blue-600 text-white rounded-full font-black text-sm shadow-xl shadow-blue-100 transition-all">
          {finalStops.length} arrêts
        </div>
      </header>

      <div className="h-[400px] rounded-3xl overflow-hidden border shadow-xl relative z-0">
        <div ref={mapRef} className="h-full w-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sélecteurs de tranches */}
        <div className="bg-white p-4 rounded-2xl border shadow-sm">
          <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase mb-2">
            <ListFilter size={14} /> Tranche de Nom
          </label>
          <select 
            className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={nameRange} onChange={(e) => setNameRange(e.target.value)}
          >
            <option value="all">Tous les noms</option>
            <option value="ABCDE">A - E</option>
            <option value="FGHIJ">F - J</option>
            <option value="KLMNO">K - O</option>
            <option value="PQRST">P - T</option>
            <option value="UVWXYZ">U - Z</option>
          </select>
        </div>

        <div className="bg-white p-4 rounded-2xl border shadow-sm">
          <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase mb-2">
            <Hash size={14} /> Tranche de Ligne
          </label>
          <select 
            className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={lineRange} onChange={(e) => setLineRange(e.target.value)}
          >
            <option value="all">Toutes les lignes</option>
            <option value="L">Lignes Linéo (L)</option>
            <option value="1">Lignes 10, 14, 15...</option>
            <option value="2">Lignes 20, 21...</option>
            <option value="3">Lignes 30, 31...</option>
            <option value="4">Lignes 40...</option>
            <option value="5">Lignes 50...</option>
            <option value="6">Lignes 60...</option>
            <option value="7">Lignes 70...</option>
            <option value="8">Lignes 80...</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden mb-10">
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b sticky top-0 z-10 font-bold text-slate-500">
              <tr>
                <th className="p-4">Arrêt</th>
                <th className="p-4">Lignes</th>
                <th className="p-4">Commune</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {finalStops.map((stop) => (
                <tr key={stop.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-700">{stop.name}</div>
                    <div className="text-[10px] text-slate-400 uppercase">{stop.address}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {stop.lines.split(' ').map((l, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded border border-blue-100">
                          {l}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-xs text-slate-400">{stop.city}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
