'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Musee } from '../api/museetarn/route'; 
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ChevronDown, ChevronUp, MapPin, Tag, Search, Loader2 } from "lucide-react";

// CENTRE DU TARN (Albi environ)
const TARN_CENTER: [number, number] = [43.928, 2.148];
const THEME_COLOR = '#b91c1c'; // Rouge Brique Albi

export default function MuseeTarnPage() {
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
        const response = await fetch('/api/museetarn'); 
        if (!response.ok) throw new Error("Erreur lors de la récupération des données du Tarn.");
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

  // 2. Logique de tri et filtrage
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

  // 3. Initialisation Carte
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData) return;
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (mapInstance.current) return;
      mapInstance.current = L.map(mapRef.current!).setView(TARN_CENTER, 9);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);
      markersLayer.current = L.layerGroup().addTo(mapInstance.current);
      setIsMapReady(true);
    };
    initMap();
  }, [isLoadingData]);

  // 4. Mise à jour des marqueurs
  useEffect(() => {
    if (!isMapReady || !mapInstance.current) return;
    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      markersLayer.current.clearLayers();

      filteredAndSortedMusees.forEach((m, i) => {
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${THEME_COLOR}; width: 26px; height: 26px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 11px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">${i + 1}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const popupContent = `
          <div style="text-align: center; font-family: sans-serif; min-width: 140px;">
            <strong style="color: ${THEME_COLOR}; display: block; margin-bottom: 2px;">${i + 1}. ${m.nom}</strong>
            <span style="font-size: 11px; color: #64748b; display: block; margin-bottom: 8px;">${m.commune}</span>
            <a href="#tarn-${i}" 
               style="display: inline-block; background-color: ${THEME_COLOR}; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 10px; font-weight: bold; text-transform: uppercase;">
               Détails ↓
            </a>
          </div>
        `;

        L.marker([m.lat, m.lng], { icon: customIcon })
          .bindPopup(popupContent)
          .addTo(markersLayer.current);
      });
    };
    updateMarkers();
  }, [isMapReady, filteredAndSortedMusees]);

  if (error) return <div className="p-10 text-red-700 text-center font-bold italic">Erreur : {error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 bg-slate-50 min-h-screen font-sans">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-red-800 font-bold hover:underline group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 leading-tight italic uppercase tracking-tighter">
          🍷 Musées & Patrimoine du Tarn (81)
        </h1>
        <p className="text-red-700 mt-1 font-bold italic text-sm uppercase tracking-wider">
          {isLoadingData ? 'Chargement des trésors tarnais...' : `${filteredAndSortedMusees.length} sites culturels à découvrir.`}
        </p>
      </header>

      {/* Barre de recherche */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text"
          placeholder="Rechercher à Albi, Castres, Gaillac, Cordes..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl border-none focus:ring-2 focus:ring-red-600 outline-none shadow-sm transition-all bg-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* CARTE */}
      <div
        ref={mapRef}
        className="mb-12 border-4 border-white rounded-[2.5rem] bg-slate-200 shadow-2xl overflow-hidden h-[45vh] md:h-[65vh] relative z-0"
      >
        {!isMapReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 z-10 backdrop-blur-sm">
            <Loader2 className="animate-spin h-10 w-10 text-red-700 mb-2" />
            <p className="text-red-700 font-black text-xs uppercase tracking-widest">Préparation de la carte...</p>
          </div>
        )}
      </div>

      {/* TABLEAU */}
      <div className="bg-white border-none rounded-3xl shadow-xl overflow-hidden mb-12">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-900 text-white">
            <tr className="uppercase text-[10px] tracking-widest font-black">
              <th className="p-5 w-12 text-center">#</th>
              <th className="p-5 cursor-pointer hover:text-red-400 transition-colors" onClick={() => handleSort('commune')}>
                Commune {sortKey === 'commune' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
              </th>
              <th className="p-5 cursor-pointer hover:text-red-400 transition-colors" onClick={() => handleSort('nom')}>
                Nom du Site {sortKey === 'nom' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
              </th>
              <th className="p-5 hidden md:table-cell">Catégorie</th>
              <th className="p-5 hidden lg:table-cell">Adresse</th>
              <th className="p-5 w-16 text-center">Web</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAndSortedMusees.map((m, i) => (
              <React.Fragment key={`tarn-${i}`}>
                <tr 
                  id={`tarn-${i}`}
                  onClick={() => setExpandedId(expandedId === i ? null : i)}
                  className={`cursor-pointer transition-colors scroll-mt-24 ${expandedId === i ? 'bg-red-50' : 'hover:bg-slate-50'}`}
                >
                  <td className="p-5 text-center font-black text-red-700 align-top">{i + 1}</td>
                  <td className="p-5 font-black text-slate-700 align-top uppercase tracking-tighter">{m.commune}</td>
                  <td className="p-5 align-top">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-slate-900 text-base leading-tight">{m.nom}</div>
                      <div className="md:hidden text-red-600">
                        {expandedId === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </td>
                  <td className="p-5 hidden md:table-cell align-top">
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                      {m.categorie}
                    </span>
                  </td>
                  <td className="p-5 hidden lg:table-cell align-top text-slate-400 italic text-xs leading-relaxed whitespace-normal max-w-xs">
                    {m.adresse}
                  </td>
                  <td className="p-5 text-center align-top">
                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:scale-125 transition-transform inline-block" onClick={(e) => e.stopPropagation()}>
                      <ExternalLink size={20} />
                    </a>
                  </td>
                </tr>

                {expandedId === i && (
                  <tr className="bg-red-50/30 md:hidden lg:hidden animate-in fade-in duration-300">
                    <td colSpan={6} className="p-5 pt-0">
                      <div className="flex flex-col gap-3 py-4 border-t border-red-100">
                        <div className="flex items-start gap-3 text-slate-600">
                          <Tag size={16} className="mt-0.5 text-red-500 flex-shrink-0" />
                          <span className="text-xs font-semibold"><strong>Type :</strong> {m.categorie}</span>
                        </div>
                        <div className="flex items-start gap-3 text-slate-600">
                          <MapPin size={16} className="mt-0.5 text-red-500 flex-shrink-0" />
                          <span className="text-xs font-semibold italic leading-relaxed whitespace-normal"><strong>Adresse :</strong> {m.adresse}</span>
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

      <footer className="py-12 border-t border-slate-200 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
            Département du Tarn • 2026 • Pays de Cocagne
        </p>
      </footer>
    </div>
  );
}
