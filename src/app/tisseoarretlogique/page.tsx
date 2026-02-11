'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from "next/link";
import { ArrowLeft, Search, Database, Bus, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

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

  // 2. Logique de Filtrage et de Tri
  const filteredStops = useMemo(() => {
    let result = stopAreas.filter(s => 
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.line?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

  // 3. Découpage pour la pagination
  const totalPages = Math.ceil(filteredStops.length / itemsPerPage);
  const paginatedStops = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStops.slice(start, start + itemsPerPage);
  }, [filteredStops, currentPage]);

  // Reset de la page si on recherche
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  // 4. Initialisation de la carte
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
    return () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } };
  }, [isLoading]);

  // 5. Mise à jour des marqueurs (On affiche uniquement ceux de la page en cours pour la performance)
  useEffect(() => {
    if (!isMapReady || !mapInstance.current) return;
    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      markersLayer.current.clearLayers();
      paginatedStops.forEach((stop) => {
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: #e11d48; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });
        L.marker([stop.lat, stop.lng], { icon: customIcon })
          .bindPopup(`<strong>${stop.name}</strong><br/>Lignes: ${stop.line}`)
          .addTo(markersLayer.current);
      });
    };
    updateMarkers();
  }, [isMapReady, paginatedStops]);

  const handleSort = (key: keyof StopArea) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 min-h-screen bg-slate-50">
      <nav className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-rose-600 font-bold hover:underline">
          <ArrowLeft size={18} /> Retour
        </Link>
      </nav>

      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">📍 Arrêts Logiques Tisséo</h1>
          <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
            <Database size={14} />
            <span>{isLoading ? 'Chargement...' : `${filteredStops.length} arrêts trouvés`}</span>
          </div>
        </div>

        {/* Sélecteur de tranche (Pagination) */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 hover:bg-slate-100 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <select 
              value={currentPage} 
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="bg-transparent font-medium text-sm outline-none cursor-pointer px-2"
            >
              {Array.from({ length: totalPages }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Tranche {i * itemsPerPage + 1} - {Math.min((i + 1) * itemsPerPage, filteredStops.length)}
                </option>
              ))}
            </select>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 hover:bg-slate-100 disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </header>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Filtrer par nom ou ligne (ex: Capitole, L1...)"
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="mb-8 border border-slate-200 rounded-xl h-[400px] relative z-0 overflow-hidden shadow-inner bg-slate-200"> 
        <div ref={mapRef} className="h-full w-full" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold sticky top-0">
            <tr>
              <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-2">Nom <ArrowUpDown size={14} /></div>
              </th>
              <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('line')}>
                <div className="flex items-center gap-2">Lignes <ArrowUpDown size={14} /></div>
              </th>
              <th className="p-4">Mode</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedStops.map((stop) => (
              <tr key={stop.id} className="hover:bg-rose-50/30 transition-colors group">
                <td className="p-4 font-medium flex items-center gap-3">
                  <Bus size={16} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {stop.name}
                </td>
                <td className="p-4 text-slate-600 font-mono text-xs">{stop.line}</td>
                <td className="p-4">
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded uppercase">
                    {stop.mode}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredStops.length === 0 && !isLoading && (
          <div className="p-12 text-center text-slate-400">
            Aucun arrêt ne correspond à votre recherche.
          </div>
        )}
      </div>
    </div>
  );
}
