'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "leaflet/dist/leaflet.css";

// --- Importation des données ---
import { chateauxData, Chateau } from '../api/chateaucathare/route'; 

// --- Composant de la Carte (Méthode Ref / Manuelle) ---
const CatharLeafletMap: React.FC<{ 
  chateaux: Chateau[]; 
  filters: { emblematic: boolean; secondary: boolean } 
}> = ({ chateaux, filters }) => {
  
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // 1. Initialisation de la carte
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      // Si une instance existe déjà, on ne fait rien
      if (mapInstance.current) return;

      // Création de l'instance
      mapInstance.current = L.map(mapRef.current).setView([43.05, 2.2], 9);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      setIsReady(true);
    };

    initMap();

    // NETTOYAGE : Détruit la carte quand on quitte la page
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 2. Gestion des marqueurs (se déclenche quand filters ou isReady change)
  useEffect(() => {
    if (!isReady || !mapInstance.current) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;

      // On supprime les anciens marqueurs pour ne pas les doubler
      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          mapInstance.current.removeLayer(layer);
        }
      });

      // Filtrage des données
      const filtered = chateaux.filter(c => 
        (c.type === 'Emblematic' && filters.emblematic) || 
        (c.type === 'Secondary' && filters.secondary)
      );

      // Ajout des nouveaux marqueurs
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
            <div style="font-family: sans-serif; min-width: 150px;">
              <strong style="font-size: 14px;">${chateau.id}. ${chateau.name}</strong><br/>
              <span style="color: #666;">${chateau.city}</span><br/>
              <hr style="margin: 5px 0; border: 0; border-top: 1px solid #eee;"/>
              <span style="font-weight: bold; color: ${color};">
                Type: ${isEmblematic ? 'Emblématique' : 'Secondaire'}
              </span>
            </div>
          `)
          .addTo(mapInstance.current);
      });
    };

    updateMarkers();
  }, [isReady, filters, chateaux]);

  return (
    <div className="mb-8 border rounded-lg overflow-hidden shadow-inner bg-gray-100 relative h-[70vh]">
      <div ref={mapRef} className="h-full w-full z-0" />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          Chargement de la carte...
        </div>
      )}
    </div>
  );
};

// --- Composant Principal (Reste du code identique) ---
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

  const currentCount = chateauxData.filter(c => 
    (c.type === 'Emblematic' && filters.emblematic) || 
    (c.type === 'Secondary' && filters.secondary)
  ).length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold">
          <ArrowLeft size={20} /> Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-6">🗺️ Châteaux Cathares : Citadelles et Forteresses</h1>
      
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <span className="font-semibold">Afficher :</span>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" checked={filters.emblematic} onChange={() => handleFilterChange('emblematic')} className="h-5 w-5" />
          <span className="text-red-800 font-medium">Emblématiques</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" checked={filters.secondary} onChange={() => handleFilterChange('secondary')} className="h-5 w-5" />
          <span className="text-blue-800 font-medium">Forteresses</span>
        </label>
        <button onClick={handleToggleAll} className="bg-gray-200 hover:bg-gray-300 py-1 px-3 rounded text-sm font-semibold">
          {allActive ? 'Désactiver tout' : 'Afficher tout'}
        </button>
      </div>

      <p className="font-semibold text-lg mb-4 text-gray-700">{currentCount} lieux affichés.</p>

      <CatharLeafletMap chateaux={chateauxData} filters={filters} />
      
      {/* Tableau en bas inchangé... */}
    </div>
  );
}