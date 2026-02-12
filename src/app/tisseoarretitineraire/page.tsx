'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from "next/link";
import { ArrowLeft, Route, Search, Loader2 } from "lucide-react";

interface StopRoute {
  geo_point_2d: { lon: number; lat: number };
  nom_arret: string;
  ligne: string;
  nom_ligne: string;
  nom_iti: string;
  mode: string;
  id_hastus: string;
  ordre: number;
}

export default function TisseoArretItinerairePage() {
  const [data, setData] = useState<StopRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLine, setSelectedLine] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);

  useEffect(() => {
    fetch('/api/tisseoarretitineraire')
      .then(res => res.json())
      .then(json => {
        setData(Array.isArray(json) ? json : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const finalStops = useMemo(() => {
    return data
      .filter(s => {
        const matchLine = selectedLine === "all" || s.ligne === selectedLine;
        const matchSearch = s.nom_arret.toLowerCase().includes(searchTerm.toLowerCase());
        return matchLine && matchSearch;
      })
      .sort((a, b) => {
        const lineSort = a.ligne.localeCompare(b.ligne, undefined, { numeric: true });
        if (lineSort !== 0) return lineSort;
        return a.nom_iti.localeCompare(b.nom_iti);
      });
  }, [data, selectedLine, searchTerm]);

  const uniqueLines = useMemo(() => {
    return Array.from(new Set(data.map(d => d.ligne))).sort((a, b) => 
      a.localeCompare(b, undefined, { numeric: true })
    );
  }, [data]);

  useEffect(() => {
    if (loading || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current!).setView([43.6047, 1.4442], 12);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);
        markersLayer.current = L.layerGroup().addTo(mapInstance.current);
      }

      markersLayer.current.clearLayers();
      
      finalStops.slice(0, 300).forEach(stop => {
        if (stop.geo_point_2d?.lat && stop.geo_point_2d?.lon) {
          L.circleMarker([stop.geo_point_2d.lat, stop.geo_point_2d.lon], {
            radius: 5, color: '#f43f5e', fillColor: '#f43f5e', fillOpacity: 0.6, weight: 1
          })
          .bindPopup(`<b>${stop.nom_arret}</b><br/>Ligne ${stop.ligne}<br/><i>${stop.nom_iti}</i>`)
          .addTo(markersLayer.current);
        }
      });
    };

    initMap();
  }, [loading, finalStops]);

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* Header simple */}
        <div className="flex items-center justify-between">
          <Link href="/" className="text-blue-600 font-bold flex items-center gap-2 hover:underline">
            <ArrowLeft size={18} /> Retour Accueil
          </Link>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Route className="text-rose-500" size={20} /> Réseau Tisséo
          </h1>
        </div>

        {/* 1. CARTE (En haut) */}
        <div className="h-[450px] rounded-3xl overflow-hidden border-4 border-white shadow-xl">
          <div ref={mapRef} className="h-full w-full z-0" />
        </div>

        {/* 2. FILTRES (Sous la carte) */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un arrêt..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <select 
              className="p-2 bg-blue-50 border border-blue-100 rounded-xl font-bold text-blue-700 text-sm outline-none"
              value={selectedLine} onChange={(e) => setSelectedLine(e.target.value)}
            >
              <option value="all">Toutes les lignes</option>
              {uniqueLines.map(l => <option key={l} value={l}>Ligne {l}</option>)}
            </select>
            
            <div className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold flex items-center">
              {finalStops.length} arrêts
            </div>
          </div>
        </div>

        {/* 3. TABLEAU DES DONNÉES */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 font-bold text-slate-500 border-b">
                <tr>
                  <th className="p-4">Ligne</th>
                  <th className="p-4">Itinéraire</th>
                  <th className="p-4">Arrêt</th>
                  <th className="p-4">Ordre</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {finalStops.slice(0, 100).map((stop, i) => (
                  <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-4 font-black text-blue-600">
                      <span className="bg-blue-100 px-2 py-1 rounded text-xs">{stop.ligne}</span>
                    </td>
                    <td className="p-4 text-xs text-slate-500 max-w-xs truncate">{stop.nom_iti}</td>
                    <td className="p-4 font-bold text-slate-700">{stop.nom_arret}</td>
                    <td className="p-4">
                      <span className="text-slate-400 font-mono text-xs bg-slate-100 px-2 py-0.5 rounded-full">
                        #{stop.ordre}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {finalStops.length > 100 && (
            <div className="p-4 text-center text-slate-400 text-xs italic border-t bg-slate-50">
              Affichage limité aux 100 premiers résultats. Utilisez les filtres pour affiner.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
