'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MuseeTarnGaronne as Musee } from '../api/museetarngaronne/route'; 
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ChevronDown, ChevronUp, MapPin, Tag, Search, Loader2 } from "lucide-react";

const THEME_COLOR = '#1e3a8a';

export default function MuseeTarnGaronnePage() {
  const [musees, setMusees] = useState<Musee[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [sortKey, setSortKey] = useState<keyof Musee>('commune');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Récupération des données
  useEffect(() => {
    async function fetchMusees() {
      try {
        const response = await fetch('/api/museetarngaronne'); 
        if (!response.ok) throw new Error("Erreur lors de la récupération des données.");
        const data: Musee[] = await response.json();
        setMusees(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchMusees();
  }, []);

  // 2. Initialisation Carte
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData || musees.length === 0) return;
    
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (mapInstance.current) return;

      const centerLat = musees.reduce((sum, m) => sum + m.lat, 0) / musees.length;
      const centerLng = musees.reduce((sum, m) => sum + m.lng, 0) / musees.length;

      mapInstance.current = L.map(mapRef.current!).setView([centerLat, centerLng], 9);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      markersLayer.current = L.layerGroup().addTo(mapInstance.current);
      
      // On simule un petit délai pour s'assurer que les tuiles chargent ou on valide direct
      setIsMapReady(true);
    };
    initMap();
  }, [isLoadingData, musees]);

  // 3. Mise à jour des marqueurs
  useEffect(() => {
    if (!isMapReady || !mapInstance.current) return;
    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      markersLayer.current.clearLayers();

      filteredAndSortedMusees.forEach((m, i) => {
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${THEME_COLOR}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${i + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        L.marker([m.lat, m.lng], { icon: customIcon })
          .bindPopup(`<strong>${m.nom}</strong><br/>${m.commune}`)
          .addTo(markersLayer.current);
      });
    };
    updateMarkers();
  }, [isMapReady, searchQuery, sortKey, sortDirection]); // Ajout des dépendances pour rafraîchir les numéros

  const handleSort = (key: keyof Musee) => {
    const direction = key === sortKey && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(direction);
  };

  const filteredAndSortedMusees = musees
    .filter(m => 
      m.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.commune?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = (a[sortKey] || '').toString().toLowerCase();
      const bVal = (b[sortKey] || '').toString().toLowerCase();
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  if (error) return <div className="p-10 text-red-700 text-center font-bold italic">Erreur : {error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 bg-slate-50 min-h-screen">
      <nav className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-800 font-bold hover:underline transition-all">
          <ArrowLeft size={18} /> Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight italic">🏰 Musées du Tarn-et-Garonne (82)</h1>
        <p className="text-blue-700 mt-1 font-medium italic text-sm">
          {isLoadingData ? 'Chargement des données...' : `${filteredAndSortedMusees.length} sites culturels répertoriés.`}
        </p>
      </header>

      {/* Barre de recherche toujours visible une fois les données chargées */}
      {!isLoadingData && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Rechercher à Montauban, Moissac..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-800 outline-none shadow-sm transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* --- EMPLACEMENT DE LA CARTE AVEC LOADER INTÉGRÉ --- */}
      <div
        ref={mapRef}
        className="mb-8 border rounded-2xl bg-gray-100 shadow-inner overflow-hidden h-[40vh] md:h-[60vh] relative"
        style={{ zIndex: 0 }}
      >
        {(!isMapReady || isLoadingData) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-50/90 z-10 border-2 border-dashed border-blue-100 rounded-2xl">
            <Loader2 className="animate-spin h-12 w-12 text-blue-700 mb-4" />
            <p className="text-blue-700 font-bold text-xl italic animate-pulse">
              🚀 En cours de chargement...
            </p>
          </div>
        )}
      </div>

      {/* Tableau des résultats */}
      {!isLoadingData && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
              <tr>
                <th className="p-4 w-12 text-center">#</th>
                <th className="p-4 cursor-pointer hover:text-blue-800" onClick={() => handleSort('commune')}>Commune</th>
                <th className="p-4 cursor-pointer hover:text-blue-800" onClick={() => handleSort('nom')}>Nom</th>
                <th className="p-4 hidden md:table-cell">Catégorie</th>
                <th className="p-4 w-16 text-center">Lien</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAndSortedMusees.map((m, i) => (
                <tr key={i} onClick={() => setExpandedId(expandedId === i ? null : i)} className="hover:bg-slate-50 cursor-pointer">
                  <td className="p-4 text-center font-bold text-blue-900">{i + 1}</td>
                  <td className="p-4 font-bold text-slate-700">{m.commune}</td>
                  <td className="p-4 text-slate-900 font-medium">{m.nom}</td>
                  <td className="p-4 hidden md:table-cell text-slate-500 text-xs italic">{m.categorie}</td>
                  <td className="p-4 text-center">
                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-blue-600" onClick={(e) => e.stopPropagation()}>
                      <ExternalLink size={18} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
