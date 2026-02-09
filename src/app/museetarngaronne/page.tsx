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
      setIsMapReady(true);
    };
    initMap();
  }, [isLoadingData, musees]);

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
  }, [isMapReady, searchQuery, sortKey, sortDirection]);

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

      <div
        ref={mapRef}
        className="mb-8 border rounded-2xl bg-gray-100 shadow-inner overflow-hidden h-[40vh] md:h-[60vh] relative"
        style={{ zIndex: 0 }}
      >
        {(!isMapReady || isLoadingData) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 z-10">
            <Loader2 className="animate-spin h-8 w-8 text-violet-600 mb-2" />
            <p className="text-slate-500 animate-pulse text-sm">Chargement de la carte…</p>
          </div>
        )}
      </div>

      {!isLoadingData && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
              <tr>
                <th className="p-4 w-12 text-center">#</th>
                <th className="p-4 cursor-pointer hover:text-blue-800" onClick={() => handleSort('commune')}>
                  Commune {sortKey === 'commune' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                </th>
                <th className="p-4 cursor-pointer hover:text-blue-800" onClick={() => handleSort('nom')}>
                  Nom {sortKey === 'nom' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                </th>
                <th className="p-4 hidden md:table-cell">Catégorie</th>
                <th className="p-4 hidden lg:table-cell">Adresse</th>
                <th className="p-4 w-16 text-center">Lien</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAndSortedMusees.map((m, i) => (
                <React.Fragment key={`tg-${i}`}>
                  <tr 
                    onClick={() => setExpandedId(expandedId === i ? null : i)} 
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${expandedId === i ? 'bg-blue-50/50' : ''}`}
                  >
                    <td className="p-4 text-center font-bold text-blue-900 align-top">{i + 1}</td>
                    <td className="p-4 font-bold text-slate-700 align-top">{m.commune}</td>
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 font-bold leading-tight">{m.nom}</span>
                        <div className="lg:hidden text-blue-800">
                          {expandedId === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell text-slate-500 text-xs italic align-top">{m.categorie}</td>
                    <td className="p-4 hidden lg:table-cell text-slate-500 text-xs align-top">{m.adresse}</td>
                    <td className="p-4 text-center align-top">
                      <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 inline-flex items-center" onClick={(e) => e.stopPropagation()}>
                        Web <ExternalLink size={18} />
                      </a>
                    </td>
                  </tr>
                  
                  {expandedId === i && (
                    <tr className="bg-blue-50/30 lg:hidden">
                      <td colSpan={6} className="p-4 pt-0">
                        <div className="flex flex-col gap-2 py-3 border-t border-blue-100">
                          <div className="flex items-start gap-2 text-slate-600 md:hidden">
                            <Tag size={14} className="mt-0.5 text-blue-500 flex-shrink-0" />
                            <span className="text-xs"><strong>Catégorie :</strong> {m.categorie}</span>
                          </div>
                          <div className="flex items-start gap-2 text-slate-600">
                            <MapPin size={14} className="mt-0.5 text-blue-500 flex-shrink-0" />
                            <span className="text-xs italic"><strong>Adresse :</strong> {m.adresse}</span>
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
      )}
    </div>
  );
}
