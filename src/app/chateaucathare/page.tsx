'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// --- Importation des données et du type ---
import { chateauxData, Chateau } from '../api/chateaucathare/route'; 
type ChateauType = Chateau;

// --- Imports dynamiques pour Leaflet (SSR Safe) ---
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

// --- Composant de la Carte Leaflet ---
const CatharLeafletMap: React.FC<{ chateaux: ChateauType[]; filters: { emblematic: boolean; secondary: boolean } }> = ({ chateaux, filters }) => {
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);

  const filteredChateaux = useMemo(() => {
    return chateaux.filter(chateau => {
      if (chateau.type === 'Emblematic' && filters.emblematic) return true;
      if (chateau.type === 'Secondary' && filters.secondary) return true;
      return false;
    });
  }, [chateaux, filters]);

  if (!L) return <div style={{ height: '70vh' }} className="flex items-center justify-center bg-gray-100">Chargement de la carte...</div>;

  return (
    <div className="mb-8 border rounded-lg overflow-hidden shadow-inner">
      <MapContainer 
        center={[43.05, 2.2]} 
        zoom={9} 
        style={{ height: '70vh', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {filteredChateaux.map((chateau) => {
          // Création d'une icône personnalisée numérotée (similaire au style Google précédent)
          const isEmblematic = chateau.type === 'Emblematic';
          const color = isEmblematic ? '#b30000' : '#0066b3';
          const size = isEmblematic ? 30 : 24;

          const customIcon = L.divIcon({
            className: 'custom-chateau-icon',
            html: `
              <div style="
                background-color: ${color};
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                border: 2px solid white;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: ${size / 2.2}px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.4);
              ">
                ${chateau.id}
              </div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });

          return (
            <Marker key={chateau.id} position={[chateau.lat, chateau.lng]} icon={customIcon}>
              <Popup>
                <div className="text-sm">
                  <strong className="text-lg">{chateau.id}. {chateau.name}</strong><br/>
                  <span className="text-gray-600">{chateau.city} ({chateau.department})</span><br/>
                  <hr className="my-1"/>
                  <span className={`font-bold ${isEmblematic ? 'text-red-700' : 'text-blue-700'}`}>
                    Type: {isEmblematic ? 'Emblématique' : 'Secondaire'}
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

// --- Composant Principal de la Page ---
export default function ChateauxCatharesPage() {
  const [filters, setFilters] = useState({
    emblematic: true,
    secondary: true,
  });

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
  const currentCount = chateauxData.filter(c => (c.type === 'Emblematic' && filters.emblematic) || (c.type === 'Secondary' && filters.secondary)).length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

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
          <span className="text-red-800 font-medium">Sites Emblématiques ({totalEmblematic})</span>
        </label>
        
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.secondary}
            onChange={() => handleFilterChange('secondary')}
            className="form-checkbox text-blue-600 h-5 w-5"
          />
          <span className="text-blue-800 font-medium">Autres Forteresses ({totalSecondary})</span>
        </label>

        <button
            onClick={handleToggleAll}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-3 rounded text-sm transition-colors"
        >
            {allActive(filters) ? 'Désactiver tout' : 'Afficher tout'}
        </button>
      </div>
      
      <p className="font-semibold text-lg mb-4 text-gray-700">
        {currentCount} lieux affichés sur {totalMarkers} au total.
      </p>

      {/* Remplacement par la carte Leaflet */}
      <CatharLeafletMap chateaux={chateauxData} filters={filters} />
      
      {/* 3. Liste des châteaux (Inchangée) */}
      <h2 className="text-2xl font-semibold mb-4 mt-8 text-gray-800">Liste complète des châteaux ({totalMarkers})</h2>
      
      <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
        <table className="w-full text-left border-collapse bg-white text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border-b border-gray-300 font-bold w-12 text-center">#ID</th>
              <th className="p-3 border-b border-gray-300 font-bold">Nom</th>
              <th className="p-3 border-b border-gray-300 font-bold">Commune</th>
              <th className="p-3 border-b border-gray-300 font-bold">Département</th>
              <th className="p-3 border-b border-gray-300 font-bold">Type</th>
            </tr>
          </thead>
          <tbody>
            {chateauxData.map((c, i) => (
              <tr key={c.id} className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}>
                <td className="p-3 border-b border-gray-200 font-bold text-center text-gray-600">{c.id}</td>
                <td className="p-3 border-b border-gray-200 font-bold text-blue-900">{c.name}</td>
                <td className="p-3 border-b border-gray-200">{c.city}</td>
                <td className="p-3 border-b border-gray-200">{c.department}</td>
                <td className="p-3 border-b border-gray-200">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.type === 'Emblematic' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {c.type === 'Emblematic' ? 'Emblématique' : 'Secondaire'}
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

function allActive(f: {emblematic: boolean, secondary: boolean}) {
    return f.emblematic && f.secondary;
}
