'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from "next/link";
import { ArrowLeft, MapPin, Route, Bus, Info, Loader2, Search } from "lucide-react";

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

export default function PointArretItinerairePage() {
  const [data, setData] = useState<StopRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLine, setSelectedLine] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);

  // Chargement des données
  useEffect(() => {
    fetch('/api/pointarretitineraire')
      .then(res => res.json())
      .then(json => {
        setData(Array.isArray(json) ? json : []);
        setLoading(false);
      })
      .catch(err => console.error("Erreur fetch:", err));
  }, []);

  // Liste des lignes uniques pour le filtre
  const uniqueLines = useMemo(() => {
    const lines = Array.from(new Set(data.map(d => d.ligne)));
    return lines.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [data]);

  // Filtrage
  const filteredStops = useMemo(() => {
    return data.filter(s => {
      const matchLine = selectedLine === "all" || s.ligne === selectedLine;
      const matchSearch = s.nom_arret.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.nom_iti.toLowerCase().includes(searchTerm.toLowerCase());
      return matchLine && matchSearch;
    });
  }, [data, selectedLine, searchTerm]);

  // Initialisation Carte
  useEffect(() => {
    if (loading || !mapRef.current || mapInstance.current) return;

    import('leaflet').then((L) => {
      import('leaflet/dist/leaflet.css');
      mapInstance.current = L.default.map(mapRef.current!).setView([43.6047, 1.4442], 12);
      L.default.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(mapInstance.current);
      markersLayer.current = L.default.layerGroup().addTo(mapInstance.current);
    });
  }, [loading]);

  // Mise à jour des marqueurs
  useEffect(() => {
    if (!markersLayer.current) return;
    import('leaflet').then((L) => {
      markersLayer.current.clearLayers();
      filteredStops.slice(0, 200).forEach(stop => {
        L.default.circleMarker([stop.geo_point_2d.lat, stop.geo_point_2d.lon], {
          radius: 6, color: '#ef4444', fillColor: '#fca5a5', fillOpacity: 0.8, weight: 2
        })
        .bindPopup(`<strong>${stop.nom_arret}</strong><br/>Ligne ${stop.ligne}<br/><small>${stop.nom_iti}</small>`)
        .addTo(markersLayer.current);
      });
    });
  }, [filteredStops]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
      <p className="font-medium text-slate-600">Chargement des itinéraires...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-bold">
          <ArrowLeft size={20} /> Retour
        </Link>

        <header className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
              <Route className="text-red-500" size={32} /> Arrêts par Itinéraire
            </h1>
            <p className="text-slate-500 mt-1">Visualisez les points d'arrêts selon le parcours des lignes.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total filtré</div>
              <div className="text-2xl font-black text-blue-600">{filteredStops.length}</div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panneau de contrôle */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase flex items-center gap-2 mb-2">
                  <Bus size={14} /> Choisir une Ligne
                </label>
                <select 
                  className="w-full p-3 rounded-xl bg-slate-100 border-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500"
                  value={selectedLine}
                  onChange={(e) => setSelectedLine(e.target.value)}
                >
                  <option value="all">Toutes les lignes</option>
                  {uniqueLines.map(line => (
                    <option key={line} value={line}>Ligne {line}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-slate-400 uppercase flex items-center gap-2 mb-2">
                  <Search size={14} /> Rechercher
                </label>
                <input 
                  type="text"
                  placeholder="Nom de l'arrêt ou itinéraire..."
                  className="w-full p-3 rounded-xl bg-slate-100 border-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-blue-600 p-5 rounded-3xl text-white shadow-lg shadow-blue-200">
               <div className="flex items-start gap-3">
                 <Info className="shrink-0" />
                 <p className="text-sm leading-relaxed">
                   Un même arrêt peut apparaître plusieurs fois s'il appartient à des itinéraires différents (Aller/Retour ou déviations).
                 </p>
               </div>
            </div>
          </div>

          {/* Carte */}
          <div className="lg:col-span-2 h-[500px] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden z-0">
            <div ref={mapRef} className="h-full w-full" />
          </div>
        </div>

        {/* Tableau des résultats */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-black uppercase">
              <tr>
                <th className="p-4">Ordre</th>
                <th className="p-4">Arrêt</th>
                <th className="p-4">Ligne & Itinéraire</th>
                <th className="p-4">Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStops.slice(0, 100).map((stop, idx) => (
                <tr key={`${stop.id_hastus}-${idx}`} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-blue-600 font-bold">{stop.ordre}</td>
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{stop.nom_arret}</div>
                    <div className="text-[10px] text-slate-400 font-mono tracking-tighter">ID: {stop.id_hastus}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-slate-800 text-white text-[10px] font-black rounded mr-2">
                      {stop.ligne}
                    </span>
                    <span className="text-xs text-slate-600 italic">{stop.nom_iti}</span>
                  </td>
                  <td className="p-4 uppercase text-[10px] font-bold text-slate-400">
                    {stop.mode}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStops.length > 100 && (
            <div className="p-4 text-center text-slate-400 text-sm italic border-t">
              Affichage limité aux 100 premiers résultats sur {filteredStops.length}. Utilisez les filtres pour affiner.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
