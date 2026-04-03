'use client';

import { useEffect, useState, useRef } from "react";
import type { ClocherMurSite } from '../../../api/clochermur/route';
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, Loader2, MapPin, Church, Info } from "lucide-react";

const CENTER_LAURAGAIS: [number, number] = [43.48, 1.65];

export default function ClocherMurMapPage() {
  const [sitesData, setSitesData] = useState<ClocherMurSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- REFS pour la Carte ---
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Fetch des données
  useEffect(() => {
    async function fetchSites() {
      try {
        const response = await fetch('/api/clochermur');
        if (!response.ok) throw new Error('Erreur API');
        let data: ClocherMurSite[] = await response.json();
        data.sort((a, b) => a.commune.localeCompare(b.commune, 'fr'));
        setSitesData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSites();
  }, []);

  // 2. Initialisation de la carte
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current!).setView(CENTER_LAURAGAIS, 10);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      setIsMapReady(true);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 3. Mise à jour des Marqueurs
  useEffect(() => {
    if (!isMapReady || !mapInstance.current || sitesData.length === 0) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;

      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          mapInstance.current.removeLayer(layer);
        }
      });

      sitesData.forEach((site, index) => {
        const currentNum = index + 1;
        const icon = L.divIcon({
          className: 'custom-icon',
          html: `<div style="background-color: #2563eb; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${currentNum}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        L.marker([site.lat, site.lng], { icon })
          .bindPopup(`
            <div style="text-align: center; font-family: sans-serif; max-width: 200px;">
              <strong style="color: #1d4ed8; display: block; margin-bottom: 2px;">#${currentNum} - ${site.commune}</strong>
              <span style="font-size: 11px; color: #64748b; font-weight: bold;">${site.dept} - ${site.secteur}</span>
              <p style="margin: 6px 0 10px 0; font-size: 12px; color: #334155; line-height: 1.4; font-style: italic;">"${site.description}"</p>
              <a href="#site-clocher-${currentNum}" style="display: inline-block; background-color: #2563eb; color: white; padding: 4px 10px; border-radius: 4px; text-decoration: none; font-size: 11px; font-weight: bold;">Détails dans la liste ↓</a>
            </div>
          `)
          .addTo(mapInstance.current);
      });
    };

    updateMarkers();
  }, [isMapReady, sitesData]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-white min-h-screen">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
          🔔 Églises à clochers-murs <span className="text-blue-600 block md:inline">du Midi Toulousain</span>
        </h1>
        {!isLoading && (
          <div className="flex items-center gap-2 mt-3 text-slate-500 font-bold bg-slate-50 w-fit px-4 py-1.5 rounded-full border border-slate-200">
            <Church size={18} className="text-blue-500" />
            <span>{sitesData.length} sites répertoriés dans le Lauragais et alentours</span>
          </div>
        )}
      </header>
      
      {/* Zone de la Carte */}
      <div className="rounded-2xl border border-slate-200 shadow-lg bg-slate-100 mb-10 h-[55vh] md:h-[65vh] overflow-hidden relative z-0">
        <div ref={mapRef} className="h-full w-full" />
        
        {(isLoading || !isMapReady) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50/90 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 text-blue-600">
              <Loader2 className="animate-spin" size={32} />
              <p className="font-bold animate-pulse">Initialisation du patrimoine...</p>
            </div>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
        <Info className="text-blue-600" /> Inventaire détaillé
      </h2>

      {/* Tableau des sites */}
      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-md">
        <table className="w-full text-left border-collapse bg-white text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-bold w-16 text-center text-slate-400">#</th>
              <th className="p-4 font-bold text-slate-700">Commune</th>
              <th className="p-4 font-bold text-center text-slate-700 w-20">Dépt</th>
              <th className="p-4 font-bold text-slate-700 hidden md:table-cell">Particularité du clocher</th>
              <th className="p-4 font-bold text-center text-slate-700">Distance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sitesData.map((site, i) => (
              <tr 
                key={site.id} 
                id={`site-clocher-${i + 1}`}
                className="hover:bg-blue-50/50 transition-colors scroll-mt-20 group"
              >
                <td className="p-4 text-center font-bold text-slate-300 group-hover:text-blue-400">{i + 1}</td>
                <td className="p-4 font-bold text-slate-900">
                  {site.commune}
                  <div className="md:hidden text-[11px] font-normal text-slate-500 mt-1 italic">
                    {site.description}
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold text-xs border border-slate-200">
                    {site.dept}
                  </span>
                </td>
                <td className="p-4 text-slate-600 italic hidden md:table-cell text-xs leading-relaxed">
                  "{site.description}"
                </td>
                <td className="p-4 text-center font-medium text-slate-700 whitespace-nowrap">
                  <div className="flex flex-col items-center">
                    <span className="text-blue-600 font-bold">{site.distanceKm} km</span>
                    <span className="text-[10px] text-slate-400 hidden sm:block">de Toulouse</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
