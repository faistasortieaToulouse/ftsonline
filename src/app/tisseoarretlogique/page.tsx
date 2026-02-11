'use client';

import React, { useEffect, useState, useRef } from 'react';
// Importation du CSS uniquement côté client pour éviter les erreurs de build
import Link from "next/link";
import { ArrowLeft, Search, ChevronDown, MapPin, Info, Database, Waves } from "lucide-react";

// --- Interface synchronisée ---
interface SiteTG {
  id: number;
  commune: string;
  site: string; 
  niveau: number;
  categorie: 'incontournable' | 'remarquable' | 'suggéré';
  lat: number;
  lng: number;
}

const TG_CENTER: [number, number] = [44.05, 1.40];

const getThemeColor = (categorie: string): string => {
  const cat = categorie?.toLowerCase() || '';
  if (cat.includes('incontournable')) return '#ef4444'; 
  if (cat.includes('remarquable'))    return '#f97316'; 
  if (cat.includes('suggéré') || cat.includes('suggere')) return '#0891b2'; 
  return '#0891b2';
};

export default function TarnGaronneMapPage() {
  const [sitesData, setSitesData] = useState<SiteTG[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Charger les données API
  useEffect(() => {
    async function fetchSites() {
      try {
        const response = await fetch('/api/tarngaronne');
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data: SiteTG[] = await response.json();
        setSitesData(data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSites();
  }, []);

  // 2. Initialisation de la carte (Strictement Client-Side)
  useEffect(() => {
    // Sécurité supplémentaire : On ne fait rien si window n'existe pas ou si on charge
    if (typeof window === "undefined" || !mapRef.current || isLoading) return;

    const initMap = async () => {
      // Import dynamique de Leaflet et du CSS
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      
      if (mapInstance.current) return;
      
      mapInstance.current = L.map(mapRef.current!).setView(TG_CENTER, 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);
      
      markersLayer.current = L.layerGroup().addTo(mapInstance.current);
      setIsMapReady(true);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isLoading]);

  const filteredSites = sitesData
    .filter(s => 
      s.commune?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.site?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.commune.localeCompare(b.commune));

  // 3. Mise à jour des marqueurs
  useEffect(() => {
    if (!isMapReady || !mapInstance.current) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      markersLayer.current.clearLayers();
      
      filteredSites.forEach((site, i) => {
        const color = getThemeColor(site.categorie);
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${color}; width: 26px; height: 26px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${i + 1}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });
        
        L.marker([site.lat, site.lng], { icon: customIcon })
          .bindPopup(`<strong>${site.commune}</strong><br/>${site.site}`)
          .addTo(markersLayer.current);
      });
    };

    updateMarkers();
  }, [isMapReady, filteredSites]);

  return (
    <div className="max-w-7xl mx-auto p-4 bg-emerald-50/20 min-h-screen">
      {/* ... (Reste de votre JSX identique) ... */}
      <nav className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-800 font-bold hover:underline">
          <ArrowLeft size={18} /> Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 italic leading-tight">🌳 Sites du Tarn-et-Garonne (82)</h1>
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mt-2">
              <Database size={16} />
              <span>Statut : {isLoading ? 'Chargement...' : `${filteredSites.length} sites trouvés`}</span>
            </div>
          </div>
          {/* Légende couleurs */}
          <div className="flex flex-wrap gap-4 text-xs md:text-sm font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5" style={{ color: '#ef4444' }}>
              <span className="w-3 h-3 rounded-full bg-red-500"></span> Incontournable
            </span>
            <span className="flex items-center gap-1.5" style={{ color: '#f97316' }}>
              <span className="w-3 h-3 rounded-full bg-orange-500"></span> Remarquable
            </span>
            <span className="flex items-center gap-1.5" style={{ color: '#0891b2' }}>
              <span className="w-3 h-3 rounded-full bg-cyan-600"></span> Suggéré
            </span>
          </div>
        </div>
      </header>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Rechercher Moissac, Montauban, Bruniquel..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm transition-all text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Conteneur de la carte */}
      <div className="mb-8 border border-emerald-100 rounded-2xl bg-gray-100 h-[35vh] md:h-[50vh] relative z-0 overflow-hidden shadow-md"> 
        <div ref={mapRef} className="h-full w-full" />
      </div>

      {/* Tableau des données */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[11px]">
            <tr>
              <th className="p-4 w-10 text-center">#</th>
              <th className="p-4">Commune</th>
              <th className="p-4 hidden md:table-cell w-1/2">Monument emblématique</th>
              <th className="p-4 text-right md:text-left">Catégorie</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSites.map((site, i) => (
              <React.Fragment key={`tg-${site.id}`}>
                <tr 
                  onClick={() => setExpandedId(expandedId === i ? null : i)}
                  className={`cursor-pointer transition-colors ${expandedId === i ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}`}
                >
                  <td className="p-4 text-center font-bold text-slate-400">{i + 1}</td>
                  <td className="p-4 font-bold text-slate-900">{site.commune}</td>
                  <td className="p-4 hidden md:table-cell text-slate-800">{site.site}</td>
                  <td className="p-4 text-right md:text-left font-bold capitalize" style={{ color: getThemeColor(site.categorie) }}>
                    {site.categorie}
                  </td>
                </tr>
                {/* Mobile expansion row... */}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
