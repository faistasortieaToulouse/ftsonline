'use client';

import { useEffect, useRef, useState, CSSProperties } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
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
          <div style="font-family: Arial; font-size: 13px; min-width: 150px;"> 
            <strong style="color: #1d4ed8;">${count}. ${site.commune}</strong><br/> 
            <p style="margin: 5px 0;"><b>Description :</b> ${site.description}</p>
            <p style="margin: 2px 0;"><b>Secteur :</b> ${site.secteur}</p>
            <p style="margin: 2px 0;"><b>Distance :</b> ${site.distanceKm} km</p>
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
    <div className="p-4 max-w-7xl mx-auto">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-6">🏰 Patrimoine en Haute-Garonne</h1>

      <p className="font-semibold text-lg mb-4 text-slate-700">
        {isLoadingData ? 'Chargement...' : `${sitesData.length} sites chargés.`}
      </p>

      {/* Carte */}
      <div 
        ref={mapRef} 
        style={{ height: "60vh", width: "100%", zIndex: 0 }} 
        className="mb-8 border rounded-lg bg-gray-100 relative shadow-inner overflow-hidden"
      > 
        {(!isMapReady || isLoadingData) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10">
            <p className="animate-pulse text-blue-600 font-medium">Initialisation de la carte…</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-slate-800 text-center md:text-left">Liste des sites historiques</h2>

      {/* Tableau Responsive */}
      <div className="overflow-hidden shadow-sm rounded-lg border border-gray-200">
        <table className="w-full border-collapse bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th style={tableHeaderStyle} className="w-12 text-center">#</th>
              <th style={tableHeaderStyle}>Commune</th>
              <th style={tableHeaderStyle}>Monument / Site</th>
              <th style={tableHeaderStyle} className="hidden md:table-cell text-center">Distance (km)</th>
              <th style={tableHeaderStyle} className="hidden md:table-cell">Secteur</th>
            </tr>
          </thead>
          <tbody>
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

  return (
    <>
      <tr 
        className={`border-b border-gray-100 transition-colors cursor-pointer md:cursor-default ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-blue-50/40`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <td style={tableCellStyle} className="text-center font-bold text-blue-700">{index + 1}</td>
        <td style={tableCellStyle} className="font-semibold">{site.commune}</td>
        <td style={tableCellStyle}>
          <div className="flex items-center justify-between">
            <span>{site.description}</span>
            <span className="md:hidden ml-2 text-blue-400">
              {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </span>
          </div>
        </td>
        {/* Colonnes cachées sur mobile */}
        <td style={tableCellStyle} className="hidden md:table-cell text-center">{site.distanceKm}</td>
        <td style={tableCellStyle} className="hidden md:table-cell">{site.secteur}</td>
      </tr>

      {/* Accordéon Mobile */}
      {isOpen && (
        <tr className="md:hidden bg-blue-50/30">
          <td colSpan={3} className="p-4 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-blue-800">Secteur</span>
                <span className="text-slate-700">{site.secteur}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-blue-800">Distance</span>
                <span className="text-slate-700 font-medium">{site.distanceKm} km</span>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// Styles constants
const tableHeaderStyle: CSSProperties = { padding: "12px 10px", textAlign: "left", fontSize: "13px", fontWeight: "700", borderBottom: "2px solid #ddd" };
const tableCellStyle: CSSProperties = { padding: "12px 10px", fontSize: "14px", borderBottom: "1px solid #eee" };