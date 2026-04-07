'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Musee } from '../api/museeariege/route';
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ChevronDown, ChevronUp, MapPin, Tag, Search, Loader2 } from "lucide-react";

const ARIEGE_CENTER: [number, number] = [42.96, 1.60];
const THEME_COLOR = '#8b5cf6';

export default function MuseeAriegePage() {
  const [musees, setMusees] = useState<Musee[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    async function fetchMusees() {
      try {
        const response = await fetch('/api/museeariege'); 
        if (!response.ok) throw new Error("Erreur réseau");
        const data: Musee[] = await response.json();
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

  const filteredMusees = musees.filter(m => 
    m.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.commune?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData) return;
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (mapInstance.current) return;
      mapInstance.current = L.map(mapRef.current!).setView(ARIEGE_CENTER, 9);
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
      filteredMusees.forEach((m, i) => {
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${THEME_COLOR}; width: 26px; height: 26px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 11px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">${i + 1}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        // Contenu de la popup avec le LIEN ANCRE
        const popupContent = `
          <div style="text-align: center; font-family: sans-serif; min-width: 140px;">
            <strong style="color: ${THEME_COLOR}; display: block; margin-bottom: 2px;">${i + 1}. ${m.nom}</strong>
            <span style="font-size: 11px; color: #64748b; display: block; margin-bottom: 8px;">${m.commune}</span>
            <a href="#musee-row-${i}" 
               style="display: inline-block; background-color: ${THEME_COLOR}; color: white; padding: 5px 10px; border-radius: 6px; text-decoration: none; font-size: 10px; font-weight: bold; text-transform: uppercase;">
               Voir détails ↓
            </a>
          </div>
        `;

        L.marker([m.lat, m.lng], { icon: customIcon })
          .bindPopup(popupContent)
          .addTo(markersGroupRef.current);
      });
    };
    updateMarkers();
  }, [isMapReady, filteredMusees]);

  if (error) return <div className="p-10 text-center text-red-500 font-bold italic">Erreur : {error}</div>;

  return (
    <div className="p-4 max-w-7xl mx-auto bg-slate-50 min-h-screen font-sans">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-violet-700 font-bold hover:underline">
          <ArrowLeft size={20} /> Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">⛰️ Musées et Patrimoine de l'Ariège (09)</h1>
      </header>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Rechercher un musée, une ville..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 outline-none shadow-sm transition-all bg-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div
        ref={mapRef}
        className="mb-12 border-4 border-white rounded-[2.5rem] bg-slate-200 shadow-2xl relative overflow-hidden h-[45vh] md:h-[60vh] z-0"
      >
        {!isMapReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 z-10 backdrop-blur-sm">
            <Loader2 className="animate-spin h-8 w-8 text-violet-600 mb-2" />
            <p className="text-violet-600 font-black text-xs uppercase tracking-widest">Initialisation de la carte…</p>
          </div>
        )}
      </div>

      <h2 className="text-xl font-black mb-6 text-slate-800 flex items-center gap-3">
        <span className="h-1.5 w-12 bg-violet-500 rounded-full"></span>
        INVENTAIRE DES SITES ({filteredMusees.length})
      </h2>

      <div className="overflow-hidden border-none rounded-3xl shadow-xl bg-white">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="p-5 w-12 md:w-16 text-center font-black uppercase text-[10px] tracking-widest">N°</th>
              <th className="p-5 hidden md:table-cell w-32 font-black uppercase text-[10px] tracking-widest">Commune</th>
              <th className="p-5 font-black uppercase text-[10px] tracking-widest">Nom du Site</th>
              <th className="p-5 hidden md:table-cell w-48 font-black uppercase text-[10px] tracking-widest text-center">Catégorie</th>
              <th className="p-5 hidden lg:table-cell font-black uppercase text-[10px] tracking-widest">Adresse</th>
              <th className="p-5 w-16 text-center font-black uppercase text-[10px] tracking-widest">Lien</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredMusees.map((m, i) => (
              <React.Fragment key={`group-${i}`}>
                <tr 
                  id={`musee-row-${i}`} // ID CIBLE POUR L'ANCRE
                  onClick={() => setExpandedId(expandedId === i ? null : i)}
                  className={`cursor-pointer transition-colors scroll-mt-24 ${expandedId === i ? 'bg-violet-50' : 'hover:bg-slate-50'}`}
                >
                  <td className="p-5 text-center font-black text-violet-400 align-top">{i + 1}</td>
                  <td className="p-5 hidden md:table-cell font-bold text-slate-700 align-top">{m.commune}</td>
                  <td className="p-5 align-top">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-slate-900 leading-tight">{m.nom}</div>
                      <div className="md:hidden text-violet-400">
                        {expandedId === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                    <div className="text-[10px] text-violet-600 font-black md:hidden mt-1 uppercase italic">{m.commune}</div>
                  </td>
                  <td className="p-5 hidden md:table-cell align-top text-center">
                    <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                      {m.categorie}
                    </span>
                  </td>
                  <td className="p-5 hidden lg:table-cell text-slate-400 font-medium italic text-xs align-top whitespace-normal leading-relaxed">
                    {m.adresse}
                  </td>
                  <td className="p-5 text-center align-top">
                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:scale-125 transition-transform inline-block" onClick={(e) => e.stopPropagation()}>
                      <ExternalLink size={20} />
                    </a>
                  </td>
                </tr>

                {expandedId === i && (
                  <tr className="bg-violet-50/30 md:hidden animate-in fade-in duration-300">
                    <td colSpan={3} className="p-5 pt-0">
                      <div className="flex flex-col gap-3 py-4 border-t border-violet-100">
                        <div className="flex items-start gap-3 text-slate-600">
                          <Tag size={16} className="mt-0.5 text-violet-400 flex-shrink-0" />
                          <span className="text-xs font-medium"><strong>Catégorie :</strong> {m.categorie}</span>
                        </div>
                        <div className="flex items-start gap-3 text-slate-600">
                          <MapPin size={16} className="mt-0.5 text-violet-400 flex-shrink-0" />
                          <span className="text-xs font-medium"><strong>Adresse :</strong> {m.adresse}</span>
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

      <footer className="mt-20 py-10 border-t border-slate-200 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em]">
            Patrimoine Ariégeois • 2026 • Culture Pyrénées
        </p>
      </footer>
    </div>
  );
}
