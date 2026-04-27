'use client';

import React, { useEffect, useState, useRef } from 'react';
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { 
  ArrowLeft, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Search, 
  Loader2, 
  Maximize2,
  Store
} from "lucide-react";

// Types
interface Hypermarche {
  id: number;
  name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  type: string;
  area_m2: number | null;
  status: string;
}

// CENTRE DE TOULOUSE
const TOULOUSE_CENTER: [number, number] = [43.6047, 1.4442];
const THEME_COLOR = '#2563eb'; // Bleu moderne "Retail"

export default function HypermarchesPage() {
  const [data, setData] = useState<Hypermarche[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    async function fetchHypermarches() {
      try {
        const response = await fetch('/api/hypermarches');
        if (!response.ok) throw new Error("Erreur réseau");
        const json: Hypermarche[] = await response.json();
        // Tri alphabétique par nom
        json.sort((a, b) => a.name.localeCompare(b.name));
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchHypermarches();
  }, []);

  const filteredData = data.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData) return;
    
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current!).setView(TOULOUSE_CENTER, 11);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);

      markersGroupRef.current = L.layerGroup().addTo(mapInstance.current);
      setIsMapReady(true);
    };
    initMap();
  }, [isLoadingData]);

  useEffect(() => {
    if (!isMapReady || !mapInstance.current) return;
    
    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      markersGroupRef.current.clearLayers();

      filteredData.forEach((item, i) => {
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${THEME_COLOR}; width: 28px; height: 28px; border-radius: 8px; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 10px; box-shadow: 0 3px 8px rgba(0,0,0,0.2);">${i + 1}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const popupContent = `
          <div style="text-align: center; font-family: sans-serif; min-width: 160px; padding: 6px;">
            <strong style="color: ${THEME_COLOR}; display: block; margin-bottom: 2px; font-size: 13px;">${item.name}</strong>
            <span style="font-size: 11px; color: #64748b; display: block; margin-bottom: 8px;">${item.city} (${item.area_m2 || '?'} m²)</span>
            <a href="#store-${item.id}" 
               style="display: inline-block; background-color: ${THEME_COLOR}; color: white; padding: 5px 12px; border-radius: 4px; text-decoration: none; font-size: 10px; font-weight: bold; text-transform: uppercase;">
               Voir infos
            </a>
          </div>
        `;

        L.marker([item.lat, item.lng], { icon: customIcon })
          .bindPopup(popupContent)
          .addTo(markersGroupRef.current);
      });
    };
    updateMarkers();
  }, [isMapReady, filteredData]);

  if (error) return <div className="p-10 text-red-600 text-center font-bold italic">Erreur : {error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 bg-slate-50 min-h-screen font-sans">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Dashboard
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 leading-tight uppercase tracking-tight">
          🛒 Retail Map : Toulouse & Agglo
        </h1>
        <p className="text-slate-500 font-medium italic mt-1">
          {isLoadingData ? 'Chargement des enseignes...' : `${filteredData.length} points de vente référencés sur la zone.`}
        </p>
      </header>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text"
          placeholder="Rechercher une enseigne ou une ville (Blagnac, Labège...)"
          className="w-full pl-12 pr-4 py-4 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all bg-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* CARTE */}
      <div
        ref={mapRef}
        className="mb-12 border-4 border-white rounded-[2.5rem] bg-slate-200 shadow-xl overflow-hidden h-[45vh] md:h-[60vh] relative z-0"
      >
        {!isMapReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 z-10 backdrop-blur-sm">
            <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-2" />
            <p className="text-blue-600 font-black text-xs uppercase tracking-widest">Initialisation de la carte...</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-black mb-6 text-slate-800 flex items-center gap-3">
        <span className="h-1.5 w-12 bg-blue-600 rounded-full"></span>
        LISTE DES SITES DE GRANDE DISTRIBUTION
      </h2>

      {/* TABLEAU */}
      <div className="bg-white border-none rounded-3xl shadow-xl overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-900 text-white">
              <tr className="uppercase text-[10px] tracking-widest font-black">
                <th className="p-5 w-12 text-center">#</th>
                <th className="p-5">Enseigne</th>
                <th className="p-5 hidden md:table-cell">Ville</th>
                <th className="p-5 hidden md:table-cell text-center">Surface</th>
                <th className="p-5 hidden lg:table-cell">Statut</th>
                <th className="p-5 text-center">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item, i) => (
                <React.Fragment key={item.id}>
                  <tr 
                    id={`store-${item.id}`}
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className={`cursor-pointer transition-colors scroll-mt-24 ${expandedId === item.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="p-5 text-center font-black text-blue-600 align-top">{i + 1}</td>
                    <td className="p-5 align-top">
                      <div className="font-bold text-slate-900 text-base leading-tight">{item.name}</div>
                      <div className="text-[10px] text-slate-500 font-bold md:hidden mt-1 uppercase italic">{item.city}</div>
                    </td>
                    <td className="p-5 hidden md:table-cell font-bold text-slate-700 align-top">{item.city}</td>
                    <td className="p-5 hidden md:table-cell align-top text-center font-mono font-bold text-blue-700">
                      {item.area_m2 ? `${item.area_m2} m²` : 'NC'}
                    </td>
                    <td className="p-5 hidden lg:table-cell align-top">
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                        item.status.includes('existant') ? 'bg-slate-100 text-slate-600' : 'bg-green-100 text-green-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-5 text-center align-top">
                      <div className="text-blue-500">
                        {expandedId === item.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </td>
                  </tr>

                  {expandedId === item.id && (
                    <tr className="bg-blue-50/30 animate-in fade-in duration-300">
                      <td colSpan={6} className="p-8 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 border-t border-blue-100">
                          <div className="space-y-3">
                            <div className="flex items-start gap-3 text-slate-600">
                              <MapPin size={18} className="text-blue-500 flex-shrink-0" />
                              <span className="text-sm"><strong>Adresse :</strong> {item.address}</span>
                            </div>
                            <div className="flex items-start gap-3 text-slate-600">
                              <Store size={18} className="text-blue-500 flex-shrink-0" />
                              <span className="text-sm"><strong>Concept :</strong> {item.type}</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3 text-slate-600">
                              <Maximize2 size={18} className="text-blue-500 flex-shrink-0" />
                              <span className="text-sm"><strong>Surface de vente :</strong> {item.area_m2 ? `${item.area_m2} m²` : 'Non renseignée'}</span>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                mapInstance.current.setView([item.lat, item.lng], 15);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="text-xs font-bold text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors uppercase"
                            >
                              Localiser sur la carte
                            </button>
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

      <footer className="py-12 border-t border-slate-200 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
            Observatoire Commerce • Haute-Garonne • 2026
        </p>
      </footer>
    </div>
  );
}
