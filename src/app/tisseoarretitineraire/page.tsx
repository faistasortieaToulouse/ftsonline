'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from "next/link";
import { ArrowLeft, MapPin, Route, Bus, Search, Loader2 } from "lucide-react";

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

  // TRI : Ligne d'abord, puis Itinéraire
  const finalStops = useMemo(() => {
    return data
      .filter(s => {
        const matchLine = selectedLine === "all" || s.ligne === selectedLine;
        const matchSearch = s.nom_arret.toLowerCase().includes(searchTerm.toLowerCase());
        return matchLine && matchSearch;
      })
      .sort((a, b) => {
        // Tri par ligne (numérique si possible)
        const lineSort = a.ligne.localeCompare(b.ligne, undefined, { numeric: true });
        if (lineSort !== 0) return lineSort;
        // Si même ligne, tri par nom d'itinéraire
        return a.nom_iti.localeCompare(b.nom_iti);
      });
  }, [data, selectedLine, searchTerm]);

  const uniqueLines = useMemo(() => {
    return Array.from(new Set(data.map(d => d.ligne))).sort((a, b) => 
      a.localeCompare(b, undefined, { numeric: true })
    );
  }, [data]);

  // Initialisation Carte & Marqueurs
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
      
      // Ajout des marqueurs avec vérification des coordonnées
      finalStops.slice(0, 300).forEach(stop => {
        if (stop.geo_point_2d?.lat && stop.geo_point_2d?.lon) {
          L.circleMarker([stop.geo_point_2d.lat, stop.geo_point_2d.lon], {
            radius: 5, color: '#f43f5e', fillColor: '#f43f5e', fillOpacity: 0.6, weight: 1
          })
          .bindPopup(`<b>${stop.nom_arret}</b><br/>Ligne ${stop.ligne}`)
          .addTo(markersLayer.current);
        }
      });
    };

    initMap();
  }, [loading, finalStops]);

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <Link href="/" className="text-blue-600 font-bold flex items-center gap-2">
          <ArrowLeft size={18} /> Retour Accueil
        </Link>

        <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row gap-4 items-center justify-between">
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Route className="text-rose-500" /> Arrêts par Itinéraire
          </h1>
          <div className="flex gap-2">
            <select 
              className="p-2 bg-slate-100 rounded-lg font-bold text-sm"
              value={selectedLine} onChange={(e) => setSelectedLine(e.target.value)}
            >
              <option value="all">Toutes les lignes</option>
              {uniqueLines.map(l => <option key={l} value={l}>Ligne {l}</option>)}
            </select>
            <input 
              type="text" placeholder="Rechercher un arrêt..." 
              className="p-2 border rounded-lg text-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="h-[400px] rounded-2xl overflow-hidden border shadow-inner">
          <div ref={mapRef} className="h-full w-full z-0" />
        </div>

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 font-bold text-slate-500 border-b">
              <tr>
                <th className="p-3">Ligne</th>
                <th className="p-3">Itinéraire</th>
                <th className="p-3">Arrêt</th>
                <th className="p-3">Ordre</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {finalStops.slice(0, 150).map((stop, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-3 font-black text-blue-600">{stop.ligne}</td>
                  <td className="p-3 text-xs text-slate-500">{stop.nom_iti}</td>
                  <td className="p-3 font-bold">{stop.nom_arret}</td>
                  <td className="p-3 text-slate-400">{stop.ordre}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
