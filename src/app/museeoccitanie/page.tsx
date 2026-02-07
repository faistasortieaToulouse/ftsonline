'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MuseeOccitanie as Musee } from '../api/museeoccitanie/route'; 
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ChevronDown, ChevronUp, MapPin, Tag, Search } from "lucide-react";

// CENTRE DE L'OCCITANIE (Albi environ)
const OCCITANIE_CENTER: [number, number] = [43.8, 2.5];
const THEME_COLOR = '#e11d48'; // Rouge Occitanie

export default function MuseeOccitaniePage() {
  const [musees, setMusees] = useState<Musee[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [sortKey, setSortKey] = useState<keyof Musee>('departement');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Récupération des données
  useEffect(() => {
    async function fetchMusees() {
      try {
        const response = await fetch('/api/museeoccitanie'); 
        if (!response.ok) throw new Error("Erreur réseau");
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
      m.commune?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.departement?.toLowerCase().includes(searchQuery.toLowerCase())
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
      mapInstance.current = L.map(mapRef.current!).setView(OCCITANIE_CENTER, 7);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);
      markersLayer.current = L.layerGroup().addTo(mapInstance.current);
      setIsMapReady(true);
    };
    initMap();
  }, [isLoadingData]);

  // 4. Mise à jour des marqueurs (TOUS les marqueurs sans restriction)
  useEffect(() => {
    if (!isMapReady || !mapInstance.current) return;
    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      markersLayer.current.clearLayers();

      filteredAndSortedMusees.forEach((m, i) => {
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${THEME_COLOR}; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${i + 1}</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        L.marker([m.lat, m.lng], { icon: customIcon })
          .bindPopup(`<strong>${m.nom}</strong><br/>${m.commune} (${m.departement})`)
          .addTo(markersLayer.current);
      });
    };
    updateMarkers();
  }, [isMapReady, filteredAndSortedMusees]);

  if (error) return <div className="p-10 text-rose-700 text-center font-bold italic">Erreur : {error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 bg-slate-50 min-h-screen">
      <nav className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-rose-700 font-bold hover:underline">
          <ArrowLeft size={18} /> Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight italic">☀️ Musées d'Occitanie</h1>
        <p className="text-rose-600 mt-1 font-medium italic text-sm">
          {isLoadingData ? 'Chargement...' : `${filteredAndSortedMusees.length} sites culturels affichés.`}
        </p>
      </header>

      {/* Barre de recherche */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Rechercher par nom, ville ou département (ex: 31, Gers...)"
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none shadow-sm transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="mb-8 border rounded-2xl bg-gray-100 h-[40vh] md:h-[55vh] relative z-0 overflow-hidden shadow-md"> 
        <div ref={mapRef} className="h-full w-full" />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
            <tr>
              <th className="p-4 w-12 text-center">#</th>
              <th className="p-4 cursor-pointer" onClick={() => handleSort('departement')}>
                Dép. {sortKey === 'departement' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
              </th>
              <th className="p-4 hidden md:table-cell cursor-pointer" onClick={() => handleSort('commune')}>
                Commune {sortKey === 'commune' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
              </th>
              <th className="p-4 cursor-pointer" onClick={() => handleSort('nom')}>
                Nom {sortKey === 'nom' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
              </th>
              <th className="p-4 hidden lg:table-cell">Catégorie</th>
              <th className="p-4 w-16 text-center">Lien</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAndSortedMusees.map((m, i) => (
              <React.Fragment key={`occ-${i}`}>
                <tr 
                  onClick={() => setExpandedId(expandedId === i ? null : i)}
                  className={`cursor-pointer transition-colors ${expandedId === i ? 'bg-rose-50/50' : 'hover:bg-slate-50'}`}
                >
                  <td className="p-4 text-center font-bold text-rose-700 align-top">{i + 1}</td>
                  <td className="p-4 font-bold text-slate-700 align-top">{m.departement}</td>
                  <td className="p-4 hidden md:table-cell text-slate-600 align-top">{m.commune}</td>
                  <td className="p-4 align-top">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-slate-900 leading-tight">{m.nom}</div>
                      <div className="md:hidden">
                        {expandedId === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                    </div>
                    <div className="md:hidden text-[10px] text-slate-500 mt-1 uppercase font-semibold">
                      {m.commune}
                    </div>
                  </td>
                  <td className="p-4 hidden lg:table-cell align-top text-slate-500 text-xs">
                    {m.categorie}
                  </td>
                  <td className="p-4 text-center align-top">
                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 inline-flex items-center gap-1 font-bold" onClick={(e) => e.stopPropagation()}>
                      Web <ExternalLink size={18} />
                    </a>
                  </td>
                </tr>

                {expandedId === i && (
                  <tr className="bg-rose-50/30 md:hidden lg:hidden">
                    <td colSpan={4} className="p-4 pt-0">
                      <div className="flex flex-col gap-2 py-3 border-t border-rose-100">
                        <div className="flex items-start gap-2 text-slate-600">
                          <Tag size={14} className="mt-0.5 text-rose-400 flex-shrink-0" />
                          <span className="text-xs"><strong>Catégorie :</strong> {m.categorie}</span>
                        </div>
                        <div className="flex items-start gap-2 text-slate-600">
                          <MapPin size={14} className="mt-0.5 text-rose-400 flex-shrink-0" />
                          <span className="text-xs whitespace-normal italic"><strong>Adresse :</strong> {m.adresse}</span>
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