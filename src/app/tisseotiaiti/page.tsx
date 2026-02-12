'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import Link from "next/link";
import { ArrowLeft, Search, Bus, ChevronRight, Ruler, Loader2, Info } from "lucide-react";

// Fonction Haversine pour calculer la distance réelle entre points GPS
const calculatePathDistance = (coords: [number, number][]) => {
  let total = 0;
  const R = 6371; // Rayon de la terre en km
  const toRad = (v: number) => (v * Math.PI) / 180;

  for (let i = 0; i < coords.length - 1; i++) {
    const [lon1, lat1] = coords[i];
    const [lon2, lat2] = coords[i + 1];
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    total += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  return total;
};

export default function TisseoMapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const layersRef = useRef<any>({ traces: null, arrets: null });

  const [allIti, setAllIti] = useState<any[]>([]);
  const [allStops, setAllStops] = useState<any[]>([]);
  const [selectedLigne, setSelectedLigne] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [distance, setDistance] = useState<string>("0");

  // Chargement initial des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resIti, resStops] = await Promise.all([
          fetch('/api/tisseotiaiti'),
          fetch('/api/tisseotia')
        ]);
        setAllIti(await resIti.json());
        setAllStops(await resStops.json());
      } catch (e) {
        console.error("Erreur de chargement", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Initialisation de Leaflet
  useEffect(() => {
    if (isLoading || !mapRef.current || mapInstance.current) return;

    import('leaflet').then((L) => {
      const map = L.map(mapRef.current!).setView([43.6047, 1.4442], 12);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
      layersRef.current.traces = L.layerGroup().addTo(map);
      layersRef.current.arrets = L.layerGroup().addTo(map);
      mapInstance.current = map;
    });
  }, [isLoading]);

  // Extraction des lignes uniques pour la sidebar
  const uniqueLignes = useMemo(() => {
    const map = new Map();
    allIti.forEach(item => {
      if (!map.has(item.ligne)) {
        map.set(item.ligne, { id: item.ligne, color: `rgb(${item.r}, ${item.v}, ${item.b})` });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  }, [allIti]);

  // Mise à jour de la carte (Tracé + Arrêts + Zoom)
  useEffect(() => {
    if (!mapInstance.current || !selectedLigne) return;

    import('leaflet').then((L) => {
      const { traces, arrets } = layersRef.current;
      traces.clearLayers();
      arrets.clearLayers();

      const lineSegments = allIti.filter(d => d.ligne === selectedLigne);
      const lineStops = allStops.filter(s => s.ligne === selectedLigne);
      const bounds = L.latLngBounds([]);
      let totalDistance = 0;

      // Dessiner les segments
      lineSegments.forEach(seg => {
        const rawCoords = seg.geo_shape.geometry.coordinates;
        totalDistance += calculatePathDistance(rawCoords);
        const leafCoords = rawCoords.map((c: any) => [c[1], c[0]] as [number, number]);
        
        L.polyline(leafCoords, { color: `rgb(${seg.r}, ${seg.v}, ${seg.b})`, weight: 6, opacity: 0.8 }).addTo(traces);
        leafCoords.forEach(c => bounds.extend(c));
      });

      setDistance(totalDistance.toFixed(2));

      // Dessiner les arrêts
      lineStops.forEach(stop => {
        L.circleMarker([stop.lat, stop.lon], {
          radius: 5, fillColor: 'white', color: '#1d4ed8', weight: 2, fillOpacity: 1
        }).bindPopup(`<b>${stop.nom_arret}</b>`).addTo(arrets);
      });

      if (bounds.isValid()) mapInstance.current.flyToBounds(bounds, { padding: [50, 50] });
    });
  }, [selectedLigne, allIti, allStops]);

  return (
    <div className="flex h-screen bg-white font-sans">
      
        <nav className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-900 font-bold transition-all group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
            Retour à l'accueil
          </Link>
        </nav>
      
      {/* Sidebar */}
      <aside className="w-80 border-r bg-slate-50 flex flex-col z-20 shadow-lg">
        <div className="p-6 bg-white border-b">
          <div className="flex items-center gap-2 mb-4">
            <Bus className="text-blue-600" size={24} />
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Tisséo Itinéraires</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
            <input 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Chercher une ligne..."
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {isLoading ? (
            <div className="flex flex-col items-center p-10 text-slate-400"><Loader2 className="animate-spin mb-2" /></div>
          ) : (
            uniqueLignes.filter(l => l.id.includes(searchQuery.toUpperCase())).map(l => (
              <button
                key={l.id}
                onClick={() => setSelectedLigne(l.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  selectedLigne === l.id ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-white text-slate-600'
                }`}
              >
                <span className="w-10 h-6 rounded flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: l.color, color: 'white' }}>{l.id}</span>
                <span className="text-sm font-semibold">Ligne {l.id}</span>
                <ChevronRight size={14} className="ml-auto opacity-30" />
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Carte */}
      <main className="flex-1 relative">
        <div ref={mapRef} className="h-full w-full" />
        
        {selectedLigne && (
          <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-3">
            <div className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-white flex items-center gap-4">
              <div className="bg-blue-600 p-2 rounded-lg text-white"><Ruler size={20} /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Distance totale</p>
                <p className="text-lg font-black text-slate-800">{distance} km</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
