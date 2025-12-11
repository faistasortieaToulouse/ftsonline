// src/app/chateaucathare/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Script from "next/script";

// --- Importation des données et du type depuis l'API des Châteaux ---
import { chateauxData, Chateau } from '../api/chateaucathare/route'; 
type ChateauType = Chateau;

// --- Styles pour les différents types de marqueurs ---
const PIN_STYLE: Record<ChateauType['type'], google.maps.MarkerOptions['icon']> = {
  Emblematic: {
    // Les principaux, en rouge vif
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: '#b30000',
    fillOpacity: 0.9,
    strokeWeight: 1,
    scale: 8,
  },
  Secondary: {
    // Les secondaires, en bleu ou gris
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: '#0066b3',
    fillOpacity: 0.8,
    strokeWeight: 0.5,
    scale: 6,
  },
};

// --- Composant Carte Interne pour gérer les marqueurs ---
const CatharMap: React.FC<{ chateaux: ChateauType[]; filters: { emblematic: boolean; secondary: boolean } }> = ({ chateaux, filters }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Filtre les châteaux à afficher en fonction des options sélectionnées
  const filteredChateaux = useMemo(() => {
    return chateaux.filter(chateau => {
      if (chateau.type === 'Emblematic' && filters.emblematic) return true;
      if (chateau.type === 'Secondary' && filters.secondary) return true;
      return false;
    });
  }, [chateaux, filters]);

  // 1. Initialisation de la carte (après chargement du script)
  useEffect(() => {
    if (!mapRef.current || !window.google?.maps) return;
    
    // Si la carte n'est pas encore initialisée
    if (!mapInstanceRef.current) {
      // Centre initial (Aude/Ariège)
      const center = { lat: 43.05, lng: 2.0 };
      
      const mapOptions: google.maps.MapOptions = {
        center: center,
        zoom: 9,
        gestureHandling: "greedy",
        mapId: "CATHAR_CASTLES_MAP", 
      };

      mapInstanceRef.current = new google.maps.Map(mapRef.current!, mapOptions);
      setIsMapLoaded(true);
    }
    
  }, [isMapLoaded]); // Dépend de son propre état pour s'assurer que l'initialisation ne se fait qu'une fois.

  // 2. Mise à jour des marqueurs quand les filtres changent
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isMapLoaded) return; // N'exécute que si la carte est chargée

    // Supprime les anciens marqueurs
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Crée les nouveaux marqueurs
    filteredChateaux.forEach(chateau => {
      const marker = new google.maps.Marker({
        position: { lat: chateau.lat, lng: chateau.lng },
        map: map,
        title: `${chateau.name} (${chateau.type})`,
        icon: PIN_STYLE[chateau.type], // Utilise l'icône définie
      });
      
      const infowindow = new google.maps.InfoWindow({
        content: `
          <div>
            <strong>${chateau.name}</strong> (${chateau.city})<br/>
            Département: ${chateau.department}<br/>
            Type: ${chateau.type === 'Emblematic' ? 'Emblématique' : 'Secondaire'}
          </div>`
      });

      marker.addListener("click", () => {
        infowindow.open(map, marker);
      });

      markersRef.current.push(marker);
    });

  }, [filteredChateaux, isMapLoaded]); 

  return (
      <div 
        ref={mapRef} 
        style={{ height: '70vh', width: '100%' }} 
        className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center"
      >
        {!isMapLoaded && <p>Chargement de la carte Google Maps...</p>}
      </div>
  );
};


// --- Composant Principal de la Page ---
export default function ChateauxCatharesPage() {
  
  const [filters, setFilters] = useState({
    emblematic: true,
    secondary: false,
  });
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const handleFilterChange = (type: 'emblematic' | 'secondary') => {
    setFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };
  
  const handleToggleAll = () => {
      const allActive = filters.emblematic && filters.secondary;
      setFilters({ 
          emblematic: !allActive, 
          secondary: !allActive 
      });
  };

  const totalEmblematic = chateauxData.filter(c => c.type === 'Emblematic').length;
  const totalSecondary = chateauxData.filter(c => c.type === 'Secondary').length;
  const totalMarkers = chateauxData.length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      
      {/* 1. Chargement de l'API Google Maps */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=marker`}
        strategy="afterInteractive"
        onLoad={() => setIsScriptLoaded(true)}
      />

      <h1 className="text-3xl font-extrabold mb-6">🗺️ Châteaux Cathares : Citadelles et Forteresses</h1>
      
      {/* Contrôles de filtrage */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <span className="font-semibold">Afficher :</span>
        
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.emblematic}
            onChange={() => handleFilterChange('emblematic')}
            className="form-checkbox text-red-600 h-5 w-5"
          />
          <span>Sites Emblématiques ({totalEmblematic})</span>
        </label>
        
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.secondary}
            onChange={() => handleFilterChange('secondary')}
            className="form-checkbox text-blue-600 h-5 w-5"
          />
          <span>Autres Forteresses ({totalSecondary})</span>
        </label>

        <button
            onClick={handleToggleAll}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-3 rounded text-sm"
        >
            {filters.emblematic && filters.secondary ? 'Désactiver tout' : 'Afficher tout'}
        </button>
      </div>
      
      <p className="font-semibold text-lg mb-4">
        {chateauxData.length} lieux au total.
      </p>

      {/* 2. Affichage de la Carte */}
      {isScriptLoaded ? (
         <CatharMap chateaux={chateauxData} filters={filters} />
      ) : (
         <div style={{ height: "70vh", width: "100%" }} className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center">
            <p>Chargement du script Google Maps...</p>
         </div>
      )}
      
      {/* 3. Liste des châteaux */}
      <h2 className="text-2xl font-semibold mb-4 mt-8">Liste complète des châteaux ({totalMarkers})</h2>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead style={{ backgroundColor: "#f0f0f0" }}>
          <tr>
            <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left" }}>Nom</th>
            <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left" }}>Commune</th>
            <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left" }}>Département</th>
            <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left" }}>Type</th>
          </tr>
        </thead>
        <tbody>
          {chateauxData.map((c, i) => (
            <tr key={c.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f9f9f9" }}>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{c.name}</td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{c.city}</td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{c.department}</td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                {c.type === 'Emblematic' ? 'Emblématique (Principal)' : 'Secondaire'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
