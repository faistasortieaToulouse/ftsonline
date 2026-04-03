'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { ArrowLeft, Fort-tower, MapPin, Info } from "lucide-react";
import "leaflet/dist/leaflet.css";

// --- Importation des données ---
import { chateauxData, Chateau } from '../api/chateaucathare/route'; 

// --- Composant de la Carte ---
const CatharLeafletMap: React.FC<{ 
  chateaux: Chateau[]; 
  filters: { emblematic: boolean; secondary: boolean } 
}> = ({ chateaux, filters }) => {
  
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current!).setView([43.05, 2.2], 9);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      setIsReady(true);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isReady || !mapInstance.current) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;

      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          mapInstance.current.removeLayer(layer);
        }
      });

      const filtered = chateaux.filter(c => 
        (c.type === 'Emblematic' && filters.emblematic) || 
        (c.type === 'Secondary' && filters.secondary)
      );

      filtered.forEach((chateau) => {
        const isEmblematic = chateau.type === 'Emblematic';
        const color = isEmblematic ? '#b30000' : '#0066b3';
        const size = isEmblematic ? 30 : 24;

        const customIcon = L.divIcon({
          className: 'custom-chateau-icon',
          html: `
            <div style="
              background-color: ${color};
              width: ${size}px; height: ${size}px;
              border-radius: 50%; border: 2px solid white;
              color: white; display: flex; align-items: center;
              justify-content: center; font-weight: bold;
              font-size: ${size / 2.2}px; box-shadow: 0 2px 5px rgba(0,0,0,0.4);
            ">
              ${chateau.id}
            </div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        L.marker([chateau.lat, chateau.lng], { icon: customIcon })
          .bindPopup(`
            <div style="font-family: sans-serif; min-width: 180px; text-align: center;">
              <strong style="font-size: 14px; color: ${color};">#${chateau.id} - ${chateau.name}</strong><br/>
              <span style="color: #666; font-size: 12px;">${chateau.city}</span>
              <hr style="margin: 8px 0; border: 0; border-top: 1px solid #eee;"/>
              <a href="#chateau-${chateau.id}" style="
                display: inline-block; 
                background-color: ${color}; 
                color: white; 
                padding: 5px 10px; 
                border-radius: 4px; 
                text-decoration: none; 
                font-size: 11px; 
                font-weight: bold;
              ">Voir dans la liste ↓</a>
            </div>
          `)
          .addTo(mapInstance.current);
      });
    };

    updateMarkers();
  }, [isReady, filters, chateaux]);

  return (
    <div className="mb-8 border rounded-xl overflow-hidden shadow-lg bg-gray-100 relative h-[60vh] md:h-[70vh]">
      <div ref={mapRef} className="h-full w-full z-0" />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10 font-bold text-gray-400 animate-pulse">
          Chargement de la carte des citadelles...
        </div>
      )}
    </div>
  );
};

// --- Composant Principal ---
export default function ChateauxCatharesPage() {
  const [filters, setFilters] = useState({
    emblematic: true,
    secondary: true,
  });

  const handleFilterChange = (type: 'emblematic' | 'secondary') => {
    setFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const allActive = filters.emblematic && filters.secondary;
  
  const handleToggleAll = () => {
    setFilters({ emblematic: !allActive, secondary: !allActive });
  };

  const filteredChateaux = chateauxData.filter(c => 
    (c.type === 'Emblematic' && filters.emblematic) || 
    (c.type === 'Secondary' && filters.secondary)
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-white">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-900">🗺️ Châteaux Cathares : Citadelles et Forteresses</h1>
        
        <div className="flex flex-wrap gap-6 items-center bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="font-bold text-slate-700 uppercase text-xs tracking-wider">Filtres :</span>
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input type="checkbox" checked={filters.emblematic} onChange={() => handleFilterChange('emblematic')} className="h-5 w-5 accent-red-700" />
            <span className="text-red-800 font-bold group-hover:underline">🚩 Sites Emblématiques</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input type="checkbox" checked={filters.secondary} onChange={() => handleFilterChange('secondary')} className="h-5 w-5 accent-blue-700" />
            <span className="text-blue-800 font-bold group-hover:underline">🏰 Forteresses & Castra</span>
          </label>
          <button onClick={handleToggleAll} className="ml-auto bg-white hover:bg-slate-100 border border-slate-300 py-1.5 px-4 rounded-lg text-sm font-bold shadow-sm transition-all">
            {allActive ? 'Tout masquer' : 'Tout afficher'}
          </button>
        </div>
      </header>

      <p className="font-bold text-slate-500 mb-4">{filteredChateaux.length} lieux chargés sur la carte.</p>

      <CatharLeafletMap chateaux={chateauxData} filters={filters} />
      
      <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
        <Info className="text-blue-600" /> Liste détaillée des sites
      </h2>

      {/* --- TABLEAU DES CHATEAUX --- */}
      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-md">
        <table className="w-full border-collapse text-left text-sm bg-white">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="p-4 font-bold w-16 text-center">#</th>
              <th className="p-4 font-bold w-1/3">Nom du Château</th>
              <th className="p-4 font-bold">Commune</th>
              <th className="p-4 font-bold text-center">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredChateaux.map((chateau) => (
              <tr 
                key={chateau.id} 
                id={`chateau-${chateau.id}`}
                className={`transition-colors scroll-mt-20 hover:bg-slate-50`}
              >
                <td className="p-4 text-center font-bold text-slate-400">{chateau.id}</td>
                <td className="p-4">
                  <div className="font-bold text-slate-900 text-base">{chateau.name}</div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <MapPin size={14} className="text-slate-400" />
                    {chateau.city}
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    chateau.type === 'Emblematic' 
                    ? 'bg-red-100 text-red-700 border border-red-200' 
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}>
                    {chateau.type === 'Emblematic' ? 'Emblématique' : 'Secondaire'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
