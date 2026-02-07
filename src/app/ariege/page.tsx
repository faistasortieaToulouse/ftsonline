'use client';

import React, { useEffect, useState, useRef } from 'react';
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  ChevronDown,
  ChevronUp,
  MapPin,
  Star,
  Landmark
} from "lucide-react";

// --- Interface de type ---
interface SiteAriege {
  id: number;
  commune: string;
  description: string;
  niveau: number;
  categorie: 'incontournable' | 'remarquable' | 'suggéré';
  lat: number;
  lng: number;
}

const ARIÈGE_CENTER: [number, number] = [42.9667, 1.6000];

const getMarkerColor = (categorie: SiteAriege['categorie']): string => {
  switch (categorie) {
    case 'incontournable': return '#ef4444'; // Rouge
    case 'remarquable': return '#f97316';    // Orange
    case 'suggéré': return '#3b82f6';       // Bleu
    default: return '#3b82f6';
  }
};

export default function AriegeMapPage() {
  const [sitesData, setSitesData] = useState<SiteAriege[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // --- Fetch des données ---
  useEffect(() => {
    async function fetchSites() {
      try {
        const response = await fetch('/api/ariege');
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data: SiteAriege[] = await response.json();
        setSitesData(data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSites();
  }, []);

  const filteredSites = sitesData
    .filter(s =>
      s.commune.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.commune.localeCompare(b.commune));

  // --- Initialisation Carte ---
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoading) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current!).setView(ARIÈGE_CENTER, 9);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);

      markersLayer.current = L.layerGroup().addTo(mapInstance.current);
      setIsMapReady(true);
    };

    initMap();
  }, [isLoading]);

  // --- Mise à jour des marqueurs ---
  useEffect(() => {
    if (!isMapReady || !mapInstance.current) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      markersLayer.current.clearLayers();

      filteredSites.forEach((site, i) => {
        const color = getMarkerColor(site.categorie);
        const customIcon = L.divIcon({
          html: `
            <div style="
              background:${color};
              width:26px;
              height:26px;
              border-radius:50%;
              border:2px solid white;
              display:flex;
              align-items:center;
              justify-content:center;
              color:white;
              font-weight:bold;
              font-size:10px;
              box-shadow:0 2px 4px rgba(0,0,0,.3)
            ">
              ${i + 1}
            </div>
          `,
          className: 'custom-marker-container',
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        L.marker([site.lat, site.lng], { icon: customIcon })
          .bindPopup(`<strong>${site.commune}</strong><br/>${site.description}`)
          .addTo(markersLayer.current);
      });
    };

    updateMarkers();
  }, [isMapReady, filteredSites]);

  return (
    <div className="max-w-7xl mx-auto p-4 bg-slate-50 min-h-screen">
      <nav className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-800 font-bold hover:underline">
          <ArrowLeft size={18} /> Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold italic text-slate-900">
          🏔️ Sites Touristiques en Ariège (09)
        </h1>
        <div className="flex flex-wrap gap-4 mt-3 text-sm font-bold uppercase tracking-wider">
          <span className="text-red-600">🔴 Incontournable</span>
          <span className="text-orange-500">🟠 Remarquable</span>
          <span className="text-blue-600">🔵 Suggéré</span>
        </div>
      </header>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Rechercher une commune ou un monument..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="mb-8 h-[35vh] md:h-[50vh] rounded-2xl overflow-hidden shadow-md border border-slate-200">
        <div ref={mapRef} className="h-full w-full" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-900 uppercase font-bold text-[11px]">
            <tr>
              <th className="p-4 w-12 text-center">#</th>
              <th className="p-4">Commune</th>
              <th className="p-4 hidden md:table-cell">Monument ou site emblématique</th>
              <th className="p-4 hidden md:table-cell text-center">Niveau</th>
              <th className="p-4">Catégorie</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredSites.map((site, i) => (
              <React.Fragment key={site.id}>
                <tr
                  onClick={() => setExpandedId(expandedId === i ? null : i)}
                  className={`cursor-pointer transition-colors ${expandedId === i ? 'bg-emerald-50/40' : 'hover:bg-slate-50'}`}
                >
                  <td className="p-4 text-center font-bold text-slate-400 align-middle">{i + 1}</td>

                  <td className="p-4 font-bold text-slate-900 align-middle">
                    <div className="flex items-center gap-2">
                      {site.commune}
                      <div className="md:hidden flex-shrink-0">
                        {expandedId === i ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                      </div>
                    </div>
                  </td>

                  {/* Monument : visible sur PC, caché sur mobile (va dans l'accordéon) */}
                  <td className="p-4 hidden md:table-cell text-slate-800 align-middle font-normal">
                    {site.description}
                  </td>

                  {/* Niveau : visible sur PC, caché sur mobile (va dans l'accordéon) */}
                  <td className="p-4 hidden md:table-cell text-center font-bold text-base align-middle" style={{ color: getMarkerColor(site.categorie) }}>
                    {site.niveau}
                  </td>

                  {/* Catégorie : TOUJOURS visible */}
                  <td
                    className="p-4 font-bold text-base align-middle"
                    style={{ color: getMarkerColor(site.categorie) }}
                  >
                    {site.categorie.charAt(0).toUpperCase() + site.categorie.slice(1)}
                  </td>
                </tr>

                {/* ACCORDÉON MOBILE (Monument + Niveau) */}
                {expandedId === i && (
                  <tr className="bg-emerald-50/20 md:hidden">
                    <td colSpan={3} className="p-4 pt-2 pb-5">
                      <div className="flex flex-col gap-4 py-3 border-t border-emerald-100">
                        
                        {/* Bloc Monument */}
                        <div className="flex gap-3">
                          <Landmark size={18} className="text-emerald-700 mt-1 flex-shrink-0" />
                          <div>
                            <span className="block text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-1">
                              Monument ou site emblématique
                            </span>
                            <p className="text-sm text-slate-800 font-normal leading-relaxed">
                              {site.description}
                            </p>
                          </div>
                        </div>

                        {/* Bloc Niveau */}
                        <div className="flex items-center gap-3">
                          <Star size={18} className="text-emerald-700 flex-shrink-0" />
                          <div>
                            <span className="block text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-1">
                              Niveau d'intérêt
                            </span>
                            <span className="text-lg font-black" style={{ color: getMarkerColor(site.categorie) }}>
                              {site.niveau} / 10
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 italic">
                          <MapPin size={14} /> Localisé en Ariège (09)
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