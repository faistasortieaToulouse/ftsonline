'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from "next/link";
import { ArrowLeft, Bus, Map as MapIcon, ChevronDown, ListFilter, Hash, MapPin } from "lucide-react";

interface PhysicalStop {
  id_hastus: string;
  nom_arret: string;
  adresse: string;
  commune: string;
  conc_ligne: string;
  conc_mode: string;
  geo_point_2d: { lon: number; lat: number };
}

const TOULOUSE_CENTER: [number, number] = [43.6047, 1.4442];

export default function TisseoArretPhysiquePage() {
  const [stops, setStops] = useState<PhysicalStop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // États des Filtres
  const [nameRange, setNameRange] = useState("all");
  const [lineRange, setLineRange] = useState("all");
  const [mapBounds, setMapBounds] = useState<any>(null);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Chargement des données Physiques
  useEffect(() => {
    async function fetchStops() {
      try {
        const response = await fetch('/api/tisseoarretphysique');
        const data = await response.json();
        setStops(data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStops();
  }, []);

  // 2. Filtrage par Zone Carte
  const stopsInZone = useMemo(() => {
    return stops.filter(s => {
      if (!mapBounds) return true;
      const { lat, lon } = s.geo_point_2d;
      return lat <= mapBounds._northEast.lat && 
             lat >= mapBounds._southWest.lat &&
             lon <= mapBounds._northEast.lon &&
             lon >= mapBounds._southWest.lon;
    });
  }, [stops, mapBounds]);

  // 3. Filtrage par Tranches (Nom et Ligne)
  const finalStops = useMemo(() => {
    return stopsInZone.filter(s => {
      // Tranche Nom
      const firstLetter = s.nom_arret?.[0]?.toUpperCase() || "";
      const matchesName = nameRange === "all" || nameRange.includes(firstLetter);

      // Tranche Ligne
      const lines = s.conc_ligne.split(' ');
      const matchesLine = lineRange === "all" || lines.some(l => l.startsWith(lineRange));

      return matchesName && matchesLine;
    }).sort((a, b) => a.nom_arret.localeCompare(b.nom_arret));
  }, [stopsInZone, nameRange, lineRange]);

  // 4. Init Carte
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoading) return;
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current!).setView(TOULOUSE_CENTER, 13);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);

      markersLayer.current = L.layerGroup().addTo(mapInstance.current);
      const update = () => setMapBounds(mapInstance.current.getBounds());
      mapInstance.current.on('moveend', update);
      update();
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
      finalStops.slice(0, 200).forEach((stop) => {
        L.circleMarker([stop.geo_point_2d.lat, stop.geo_point_2d.lon], {
          radius: 6, fillColor: "#0ea5e9", color: "white", weight: 2, fillOpacity: 0.9
        }).bindPopup(`
          <div class="font-sans">
            <strong class="text-blue-600">${stop.nom_arret}</strong><br/>
            <span class="text-xs text-gray-500">${stop.adresse}</span><br/>
            <div class="mt-1 font-bold text-gray-700">Lignes: ${stop.conc_ligne}</div>
          </div>
        `).addTo(markersLayer.current);
      });
    };
    updateMarkers();
  }, [isMapReady, finalStops]);

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
            <MapPin className="text-blue-500" /> Arrêts Physiques Tisséo
          </h1>
          <p className="text-slate-500 text-sm italic">Données d'exploitation temps réel par emplacement</p>
        </div>
        <div className="px-4 py-2 bg-blue-500 text-white rounded-xl font-bold text-sm shadow-blue-100 shadow-lg">
          {finalStops.length} arrêts filtrés
        </div>
      </header>

      {/* Carte */}
      <div className="h-[400px] rounded-3xl overflow-hidden border-4 border-white shadow-xl relative z-0">
        <div ref={mapRef} className="h-full w-full" />
      </div>

      {/* Les Tranches de sélection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border shadow-sm">
          <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase mb-3 tracking-widest">
            <ListFilter size={14} /> Tranche de Nom
          </label>
          <div className="relative">
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              value={nameRange} onChange={(e) => setNameRange(e.target.value)}
            >
              <option value="all">Tous les noms de la zone</option>
              <option value="ABCDE">De A à E</option>
              <option value="FGHIJ">De F à J</option>
              <option value="KLMNO">De K à O</option>
              <option value="PQRST">De P à T</option>
              <option value="UVWXYZ">De U à Z</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border shadow-sm">
          <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase mb-3 tracking-widest">
            <Hash size={14} /> Tranche de Ligne
          </label>
          <div className="relative">
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              value={lineRange} onChange={(e) => setLineRange(e.target.value)}
            >
              <option value="all">Toutes les lignes de la zone</option>
              <option value="L">Lignes Linéo (L)</option>
              <option value="1">Série 10 (14, 15...)</option>
              <option value="2">Série 20 (21, 27...)</option>
              <option value="3">Série 30 (33, 34...)</option>
              <option value="4">Série 40 (44, 45...)</option>
              <option value="5">Série 50 (54, 55...)</option>
              <option value="6">Série 60 (63, 66...)</option>
              <option value="7">Série 70 (70, 76...)</option>
              <option value="8">Série 80 (80, 83...)</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>
        </div>
      </div>

      {/* Tableau des arrêts physiques */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden mb-10">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
              <tr>
                <th className="p-4 text-slate-500 font-bold">Arrêt & Adresse</th>
                <th className="p-4 text-slate-500 font-bold">Lignes (Physique)</th>
                <th className="p-4 text-slate-500 font-bold">Commune</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {finalStops.map((stop) => (
                <tr key={stop.id_hastus} className="hover:bg-blue-50/40 transition-colors group">
                  <td className="p-4">
                    <div className="font-bold text-slate-700">{stop.nom_arret}</div>
                    <div className="text-[11px] text-slate-400 uppercase tracking-tighter">{stop.adresse}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {stop.conc_ligne.split(' ').map((l, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 text-[10px] font-black rounded text-blue-600 group-hover:border-blue-200">
                          {l}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-xs font-medium text-slate-500">
                    {stop.commune}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {finalStops.length === 0 && (
            <div className="p-20 text-center text-slate-400 font-medium italic">
              Aucun arrêt physique trouvé avec ces critères dans cette zone.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
