'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Musee as MuseeAveyron } from '../api/museeaveyron/route'; 
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ChevronDown, ChevronUp, MapPin, Tag, Search } from "lucide-react";

const AVEYRON_CENTER: [number, number] = [44.35, 2.57];
const THEME_COLOR = '#4f46e5'; 

export default function MuseeAveyronPage() {
  const [musees, setMusees] = useState<MuseeAveyron[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Fetch des données
  useEffect(() => {
    async function fetchMusees() {
      try {
        const response = await fetch('/api/museeaveyron');
        if (!response.ok) throw new Error("Erreur réseau");
        const data: MuseeAveyron[] = await response.json();
        data.sort((a, b) => a.commune.localeCompare(b.commune));
        setMusees(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchMusees();
  }, []);

  // 2. Filtrage
  const filteredMusees = musees.filter(m => 
    m.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.commune?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 3. Initialisation Carte
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData) return;
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (mapInstance.current) return;
      mapInstance.current = L.map(mapRef.current!).setView(AVEYRON_CENTER, 9);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);
      markersGroupRef.current = L.layerGroup().addTo(mapInstance.current);
      setIsMapReady(true);
    };
    initMap();
  }, [isLoadingData]);

  // 4. Mise à jour des Marqueurs
  useEffect(() => {
    if (!isMapReady || !mapInstance.current) return;
    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      markersGroupRef.current.clearLayers();
      filteredMusees.forEach((m, i) => {
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${THEME_COLOR}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${i + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        L.marker([m.lat, m.lng], { icon: customIcon }).bindPopup(`<strong>${m.nom}</strong><br/>${m.commune}`).addTo(markersGroupRef.current);
      });
    };
    updateMarkers();
  }, [isMapReady, filteredMusees]);

  if (error) return <div className="p-10 text-red-500 text-center font-bold">Erreur : {error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 bg-slate-50 min-h-screen">
      <nav className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-700 font-bold hover:underline">
          <ArrowLeft size={18} /> Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">🐑 Musées et Patrimoine de l'Aveyron (12)</h1>
      </header>

      {/* Barre de recherche */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Rechercher à Rodez, Millau, Conques..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="mb-8 border rounded-2xl bg-gray-100 h-[35vh] md:h-[50vh] relative z-0 overflow-hidden shadow-md"> 
        <div ref={mapRef} className="h-full w-full" />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
            <tr>
              <th className="p-4 w-12 md:w-16 text-center">N°</th>
              <th className="p-4 hidden md:table-cell w-32">Commune</th>
              <th className="p-4">Nom du Site</th>
              <th className="p-4 hidden md:table-cell w-48">Catégorie</th>
              <th className="p-4 hidden lg:table-cell w-72">Adresse</th>
              <th className="p-4 w-16 text-center">Lien</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredMusees.map((m, i) => (
              <React.Fragment key={`group-${i}`}>
                <tr 
                  onClick={() => setExpandedId(expandedId === i ? null : i)}
                  className={`cursor-pointer transition-colors ${expandedId === i ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
                >
                  <td className="p-4 text-center font-bold text-indigo-500 align-top">{i + 1}</td>
                  <td className="p-4 hidden md:table-cell font-semibold text-slate-700 align-top">{m.commune}</td>
                  <td className="p-4 align-top">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-slate-900 leading-tight">{m.nom}</div>
                      <div className="md:hidden">
                        {expandedId === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                    </div>
                    <div className="text-[10px] text-indigo-600 font-bold md:hidden mt-1 uppercase italic leading-none">{m.commune}</div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-slate-500 align-top leading-relaxed">{m.categorie}</td>
                  <td className="p-4 hidden lg:table-cell text-slate-500 italic text-xs align-top whitespace-normal break-words leading-relaxed">
                    {m.adresse}
                  </td>
                  <td className="p-4 text-center align-top">
                    {m.url ? (
                      <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-blue-600" onClick={(e) => e.stopPropagation()}>
                        Web <ExternalLink size={18} />
                      </a>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                </tr>

                {expandedId === i && (
                  <tr className="bg-indigo-50/30 md:hidden">
                    <td colSpan={3} className="p-4 pt-0">
                      <div className="flex flex-col gap-2 py-3 border-t border-indigo-100">
                        <div className="flex items-start gap-2 text-slate-600">
                          <Tag size={14} className="mt-0.5 text-indigo-400 flex-shrink-0" />
                          <span className="text-xs"><strong>Catégorie :</strong> {m.categorie}</span>
                        </div>
                        <div className="flex items-start gap-2 text-slate-600">
                          <MapPin size={14} className="mt-0.5 text-indigo-400 flex-shrink-0" />
                          <span className="text-xs whitespace-normal"><strong>Adresse :</strong> {m.adresse}</span>
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