'use client';

import React, { useEffect, useState, useRef } from 'react';
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, Search, ChevronDown, ChevronUp, MapPin, Star, Info, Database } from "lucide-react";

// --- Interface de type ---
interface SiteAriege {
  id: number;
  commune: string;
  description: string;
  niveau: number;
  categorie: 'incontournable' | 'remarquable' | 'suggéré';
  lat: number;
  lng: number;
}

const ARIÈGE_CENTER: [number, number] = [42.9667, 1.6000];

// --- Gestion des couleurs ---
const getMarkerColor = (categorie: SiteAriege['categorie']): string => {
  switch (categorie) {
    case 'incontournable': return '#ef4444'; // Rouge
    case 'remarquable':    return '#f97316'; // Orange
    case 'suggéré':       return '#3b82f6'; // Bleu
    default:               return '#3b82f6';
  }
};

export default function AriegeMapPage() {
  const [sitesData, setSitesData] = useState<SiteAriege[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Fetch des données
  useEffect(() => {
    async function fetchSites() {
      try {
        const response = await fetch('/api/ariege');
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        let data: SiteAriege[] = await response.json();
        setSitesData(data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSites();
  }, []);

  // 2. Filtrage et Tri
  const filteredSites = sitesData
    .filter(s => 
      s.commune?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.commune.localeCompare(b.commune));

  // 3. Initialisation de la carte
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoading) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current!).setView(ARIÈGE_CENTER, 9);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);

      markersLayer.current = L.layerGroup().addTo(mapInstance.current);
      setIsMapReady(true);
    };
    initMap();
  }, [isLoading]);

  // 4. Mise à jour des marqueurs
  useEffect(() => {
    if (!isMapReady || !mapInstance.current) return;
    
    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      markersLayer.current.clearLayers();

      filteredSites.forEach((site, i) => {
        const color = getMarkerColor(site.categorie);
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${color}; width: 26px; height: 26px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${i + 1}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        L.marker([site.lat, site.lng], { icon: customIcon })
          .bindPopup(`<strong>${site.commune}</strong><br/>${site.description}`)
          .addTo(markersLayer.current);
      });
    };
    updateMarkers();
  }, [isMapReady, filteredSites]);

  return (
    <div className="max-w-7xl mx-auto p-4 bg-slate-50 min-h-screen">
      <nav className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-800 font-bold hover:underline transition-all">
          <ArrowLeft size={18} /> Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 italic leading-tight">🏔️ Sites Touristiques en Ariège (09)</h1>
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mt-2">
              <Database size={16} />
              <span>Statut : {filteredSites.length} sites chargés</span>
            </div>
          </div>
          
          {/* Légende alignée à droite avec couleurs assorties */}
          <div className="flex flex-wrap gap-4 text-xs md:text-sm font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5" style={{ color: '#ef4444' }}>
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }}></span> Incontournable
            </span>
            <span className="flex items-center gap-1.5" style={{ color: '#f97316' }}>
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f97316' }}></span> Remarquable
            </span>
            <span className="flex items-center gap-1.5" style={{ color: '#3b82f6' }}>
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }}></span> Suggéré
            </span>
          </div>
        </div>
      </header>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Rechercher une commune ou un monument..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none shadow-sm transition-all text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="mb-8 border rounded-2xl bg-gray-100 h-[35vh] md:h-[50vh] relative z-0 overflow-hidden shadow-md"> 
        <div ref={mapRef} className="h-full w-full" />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[11px]">
            <tr>
              <th className="p-4 w-12 text-center">#</th>
              <th className="p-4">Commune</th>
              <th className="p-4">Monument ou site emblématique</th>
              <th className="p-4 hidden md:table-cell text-center">Niveau</th>
              <th className="p-4 hidden md:table-cell">Catégorie</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSites.map((site, i) => (
              <React.Fragment key={`ariege-${site.id}`}>
                <tr 
                  onClick={() => setExpandedId(expandedId === i ? null : i)}
                  className={`cursor-pointer transition-colors ${expandedId === i ? 'bg-emerald-50/30' : 'hover:bg-slate-50'}`}
                >
                  <td className="p-4 text-center font-bold text-slate-400 align-top">{i + 1}</td>
                  <td className="p-4 font-bold text-slate-900 align-top">{site.commune}</td>
                  <td className="p-4 align-top">
                    <div className="flex items-start gap-2 justify-between">
                      <div className="text-slate-800 leading-relaxed font-normal">{site.description}</div>
                      <div className="md:hidden mt-1 flex-shrink-0">
                        {expandedId === i ? <ChevronUp size={16} className="text-emerald-700" /> : <ChevronDown size={16} className="text-emerald-700" />}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-center align-top font-bold text-base" style={{ color: getMarkerColor(site.categorie) }}>
                    {site.niveau}
                  </td>
                  <td className="p-4 hidden md:table-cell align-top font-bold text-base whitespace-nowrap" style={{ color: getMarkerColor(site.categorie) }}>
                    {site.categorie.charAt(0).toUpperCase() + site.categorie.slice(1)}
                  </td>
                </tr>

                {expandedId === i && (
                  <tr className="bg-emerald-50/20 md:hidden">
                    <td colSpan={3} className="p-4 pt-0">
                      <div className="flex flex-col gap-3 py-3 border-t border-emerald-100">
                        <div className="flex items-center gap-2">
                          <Star size={16} style={{ color: getMarkerColor(site.categorie) }} />
                          <span className="text-sm font-bold whitespace-nowrap" style={{ color: getMarkerColor(site.categorie) }}>
                            {site.categorie.charAt(0).toUpperCase() + site.categorie.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <Info size={16} style={{ color: getMarkerColor(site.categorie) }} />
                          <span className="text-sm">
                            <strong>Niveau :</strong> {site.niveau}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <MapPin size={16} />
                          <span className="text-xs italic">Pyrénées Ariégeoises</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}