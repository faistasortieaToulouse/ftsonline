'use client';

import { useEffect, useRef, useState, CSSProperties } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp, MapPin, Info } from "lucide-react";
import type { SitePatrimoine31 } from '../api/patrimoine31/route';

type Site = SitePatrimoine31;

const HAUTE_GARONNE_CENTER: [number, number] = [43.73, 1.55];

export default function Patrimoine31MapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);

  const [sitesData, setSitesData] = useState<Site[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    async function fetchSites() {
      try {
        const response = await fetch('/api/patrimoine31');
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data: Site[] = await response.json();
        setSitesData(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des sites:", error);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchSites();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || sitesData.length === 0) return;

    const initLeaflet = async () => {
      const L = (await import('leaflet')).default;

      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current!).setView(HAUTE_GARONNE_CENTER, 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance.current);
        markersLayer.current = L.layerGroup().addTo(mapInstance.current);
        setIsMapReady(true);
      }

      markersLayer.current.clearLayers();

      sitesData.forEach((site, i) => {
        const count = i + 1;
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: #1d4ed8; width: 26px; height: 26px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${count}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const popupContent = `
          <div style="font-family: Arial, sans-serif; font-size: 13px; min-width: 160px; text-align: center;"> 
            <strong style="color: #1d4ed8; display: block; margin-bottom: 4px;">#${count} - ${site.commune}</strong> 
            <p style="margin: 5px 0; line-height: 1.3;"><b>Site :</b> ${site.description}</p>
            <p style="margin: 2px 0; color: #64748b;"><b>Secteur :</b> ${site.secteur}</p>
            <p style="margin: 2px 0; color: #64748b;"><b>Distance :</b> ${site.distanceKm} km</p>
            <hr style="margin: 8px 0; border: 0; border-top: 1px solid #eee;" />
            <a href="#site-patrimoine-${count}" style="display: inline-block; background-color: #1d4ed8; color: white; padding: 5px 10px; border-radius: 4px; text-decoration: none; font-size: 11px; font-weight: bold;">Voir les détails ↓</a>
          </div>
        `;

        L.marker([site.lat, site.lng], { icon: customIcon })
          .bindPopup(popupContent)
          .addTo(markersLayer.current);
      });
    };

    initLeaflet();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [sitesData]);

  return (
    <div className="p-4 max-w-7xl mx-auto min-h-screen bg-white">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-6 text-slate-900">🏰 Patrimoine en Haute-Garonne</h1>

      <div className="flex items-center gap-2 mb-4">
        <div className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full border border-blue-100 font-bold text-sm">
          {isLoadingData ? 'Chargement des données...' : `${sitesData.length} sites historiques chargés`}
        </div>
      </div>

      {/* Carte */}
      <div 
        ref={mapRef} 
        style={{ height: "60vh", width: "100%", zIndex: 0 }} 
        className="mb-8 border rounded-xl bg-gray-100 relative shadow-md overflow-hidden"
      > 
        {(!isMapReady || isLoadingData) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10 backdrop-blur-sm">
            <p className="animate-pulse text-blue-600 font-bold">Initialisation de la carte Haute-Garonne…</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
        <Info className="text-blue-600" /> Inventaire des sites historiques
      </h2>

      {/* Tableau Responsive */}
      <div className="overflow-hidden shadow-md rounded-xl border border-gray-200">
        <table className="w-full border-collapse bg-white">
          <thead className="bg-slate-50 border-b border-gray-200">
            <tr>
              <th style={tableHeaderStyle} className="w-12 text-center text-slate-400">#</th>
              <th style={tableHeaderStyle}>Commune</th>
              <th style={tableHeaderStyle}>Monument / Site</th>
              <th style={tableHeaderStyle} className="hidden md:table-cell text-center w-32">Distance (km)</th>
              <th style={tableHeaderStyle} className="hidden md:table-cell">Secteur</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sitesData.map((site, i) => (
              <SiteRow key={site.id} site={site} index={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Sous-composant pour la ligne extensible ---
function SiteRow({ site, index }: { site: Site; index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const count = index + 1;

  return (
    <>
      <tr 
        id={`site-patrimoine-${count}`}
        className={`transition-colors cursor-pointer md:cursor-default scroll-mt-20 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/30"} hover:bg-blue-50/60`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <td style={tableCellStyle} className="text-center font-bold text-blue-600">{count}</td>
        <td style={tableCellStyle} className="font-bold text-slate-900">{site.commune}</td>
        <td style={tableCellStyle}>
          <div className="flex items-center justify-between">
            <span className="text-slate-700 font-medium">{site.description}</span>
            <span className="md:hidden ml-2 text-blue-400">
              {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </span>
          </div>
        </td>
        {/* Colonnes cachées sur mobile */}
        <td style={tableCellStyle} className="hidden md:table-cell text-center font-bold text-slate-600">{site.distanceKm}</td>
        <td style={tableCellStyle} className="hidden md:table-cell text-slate-500 italic">{site.secteur}</td>
      </tr>

      {/* Accordéon Mobile */}
      {isOpen && (
        <tr className="md:hidden bg-blue-50/30">
          <td colSpan={3} className="p-4 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-extrabold text-blue-800 tracking-wider">Secteur géographique</span>
                <div className="flex items-center gap-1 text-slate-700">
                  <MapPin size={14} className="text-blue-400" />
                  <span>{site.secteur}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-extrabold text-blue-800 tracking-wider">Distance de Toulouse</span>
                <span className="text-slate-700 font-bold">{site.distanceKm} km</span>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// Styles constants
const tableHeaderStyle: CSSProperties = { 
  padding: "14px 12px", 
  textAlign: "left", 
  fontSize: "12px", 
  fontWeight: "800", 
  textTransform: "uppercase",
  letterSpacing: "0.025em"
};

const tableCellStyle: CSSProperties = { 
  padding: "14px 12px", 
  fontSize: "14px",
  borderBottom: "1px solid #f1f5f9"
};
