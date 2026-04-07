'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Musee } from '../api/museepo/route';
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ChevronDown, ChevronUp, MapPin, Tag, Search, Loader2 } from "lucide-center";
import { Search as SearchIcon } from "lucide-react";

// CENTRE DES PYRÉNÉES-ORIENTALES (Perpignan environ)
const PO_CENTER: [number, number] = [42.698, 2.895];
const THEME_COLOR = '#d97706'; // Ambre Sang et Or

export default function MuseePOPage() {
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
        const response = await fetch('/api/museepo');
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
      mapInstance.current = L.map(mapRef.current!).setView(PO_CENTER, 9);
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

        const popupContent = `
          <div style="text-align: center; font-family: sans-serif; min-width: 140px; padding: 4px;">
            <strong style="color: ${THEME_COLOR}; display: block; margin-bottom: 2px;">${i + 1}. ${m.nom}</strong>
            <span style="font-size: 11px; color: #64748b; display: block; margin-bottom: 8px;">${m.commune}</span>
            <a href="#po-${i}" 
               style="display: inline-block; background-color: ${THEME_COLOR}; color: white; padding: 5px 10px; border-radius: 6px; text-decoration: none; font-size: 10px; font-weight: bold; text-transform: uppercase;">
               Détails ↓
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

  if (error) return <div className="p-10 text-amber-700 text-center font-bold italic">Erreur : {error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 bg-slate-50 min-h-screen font-sans">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-amber-700 font-bold hover:underline group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 leading-tight uppercase tracking-tight italic">
          ☀️ Culture en Pays Catalan (66)
        </h1>
        <p className="text-slate-500 font-medium italic mt-1">
          {isLoadingData ? 'Chargement du patrimoine...' : `${filteredMusees.length} escales culturelles entre mer et montagne.`}
        </p>
      </header>

      <div className="relative mb-8">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text"
          placeholder="Rechercher à Perpignan, Céret, Collioure..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 outline-none shadow-sm transition-all bg-white"
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
            <Loader2 className="animate-spin h-10 w-10 text-amber-600 mb-2" />
            <p className="text-amber-600 font-black text-xs uppercase tracking-widest">Préparation de la carte...</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-black mb-6 text-slate-800 flex items-center gap-3">
        <span className="h-1.5 w-12 bg-amber-600 rounded-full"></span>
        LES MUSÉES DU DÉPARTEMENT
      </h2>

      {/* TABLEAU */}
      <div className="bg-white border-none rounded-3xl shadow-xl overflow-hidden mb-12">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-900 text-white">
            <tr className="uppercase text-[10px] tracking-widest font-black">
              <th className="p-5 w-12 md:w-16 text-center">N°</th>
              <th className="p-5 hidden md:table-cell w-40">Commune</th>
              <th className="p-5">Nom du Site</th>
              <th className="p-5 hidden md:table-cell w-48 text-center">Catégorie</th>
              <th className="p-5 hidden lg:table-cell w-72">Adresse</th>
              <th className="p-5 w-16 text-center">Web</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredMusees.map((m, i) => (
              <React.Fragment key={`po-${i}`}>
                <tr 
                  id={`po-${i}`}
                  onClick={() => setExpandedId(expandedId === i ? null : i)}
                  className={`cursor-pointer transition-colors scroll-mt-24 ${expandedId === i ? 'bg-amber-50' : 'hover:bg-slate-50'}`}
                >
                  <td className="p-5 text-center font-black text-amber-600 align-top">{i + 1}</td>
                  <td className="p-5 hidden md:table-cell font-bold text-slate-700 align-top">{m.commune}</td>
                  <td className="p-5 align-top">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-slate-900 text-base leading-tight">{m.nom}</div>
                      <div className="md:hidden text-amber-500">
                        {expandedId === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                    <div className="text-[10px] text-amber-600 font-black md:hidden mt-1 uppercase italic tracking-wider">{m.commune}</div>
                  </td>
                  <td className="p-5 hidden md:table-cell align-top text-center">
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                        {m.categorie}
                    </span>
                  </td>
                  <td className="p-5 hidden lg:table-cell text-slate-400 font-medium italic text-xs align-top leading-relaxed whitespace-normal break-words">
                    {m.adresse}
                  </td>
                  <td className="p-5 text-center align-top">
                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:scale-125 transition-transform inline-block" onClick={(e) => e.stopPropagation()}>
                      <ExternalLink size={20} />
                    </a>
                  </td>
                </tr>

                {expandedId === i && (
                  <tr className="bg-amber-50/30 md:hidden animate-in fade-in duration-300">
                    <td colSpan={3} className="p-5 pt-0">
                      <div className="flex flex-col gap-3 py-4 border-t border-amber-100">
                        <div className="flex items-start gap-3 text-slate-600">
                          <Tag size={16} className="mt-0.5 text-amber-500 flex-shrink-0" />
                          <span className="text-xs font-semibold"><strong>Catégorie :</strong> {m.categorie}</span>
                        </div>
                        <div className="flex items-start gap-3 text-slate-600">
                          <MapPin size={16} className="mt-0.5 text-amber-500 flex-shrink-0" />
                          <span className="text-xs font-semibold leading-relaxed italic"><strong>Adresse :</strong> {m.adresse}</span>
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
            Pyrénées-Orientales • 2026 • Tourisme Sang et Or
        </p>
      </footer>
    </div>
  );
}
