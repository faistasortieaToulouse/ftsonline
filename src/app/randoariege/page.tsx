'use client';

import { useEffect, useRef, useState, CSSProperties } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

// --- Interface de type ---
interface ActiviteAriege {
  id: number;
  commune: string;
  type: string;
  details: string;
}

const ARIEGE_CENTER: [number, number] = [42.9667, 1.6000];

export default function RandoAriegePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const [activitesData, setActivitesData] = useState<ActiviteAriege[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    async function fetchActivites() {
      try {
        const response = await fetch('/api/randoariege');
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data: ActiviteAriege[] = await response.json();
        setActivitesData(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des activités:", error);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchActivites();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || activitesData.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current!).setView(ARIEGE_CENTER, 9);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance.current);
        markersLayerRef.current = L.layerGroup().addTo(mapInstance.current);
      }

      markersLayerRef.current.clearLayers();

      activitesData.forEach((act, i) => {
        const count = i + 1;
        // Note: Utilisation de coordonnées fixes ou aléatoires selon ton API
        const lat = ARIEGE_CENTER[0] + (Math.random() - 0.5) * 0.4;
        const lng = ARIEGE_CENTER[1] + (Math.random() - 0.5) * 0.4;

        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: #1d4ed8; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${count}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const popupContent = `
          <div style="font-family: Arial; font-size: 13px; max-width: 200px;">
            <strong style="display: block; color: #1d4ed8; margin-bottom: 4px;">${count}. ${act.commune}</strong>
            <b style="color: #475569;">Type :</b> ${act.type}<br/>
            <b style="color: #475569;">Détails :</b> ${act.details}
            <div style="margin-top: 8px; border-top: 1px solid #e2e8f0; pt-8px;">
              <a href="#rando-${count}" style="display: inline-block; background-color: #1d4ed8; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 10px; font-weight: bold; margin-top: 6px;">Voir dans la liste ↓</a>
            </div>
          </div>
        `;

        L.marker([lat, lng], { icon: customIcon })
          .addTo(markersLayerRef.current)
          .bindPopup(popupContent);
      });
      setIsMapReady(true);
    };

    initMap();
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [activitesData]);

  return (
    <div className="p-4 max-w-7xl mx-auto bg-white min-h-screen">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-6">🏔️ Activités et Randonnées en Ariège</h1>

      <p className="font-semibold text-lg mb-4 text-slate-700">
        Statut des données : {isLoadingData ? 'Chargement...' : `${activitesData.length} activités chargées.`}
      </p>

      {/* Carte */}
      <div style={{ height: "60vh", width: "100%", zIndex: 0 }} className="mb-8 border rounded-lg bg-gray-100 relative overflow-hidden shadow-inner">
        <div ref={mapRef} className="h-full w-full" />
        {(!isMapReady || isLoadingData) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 z-10">
            <p className="animate-pulse font-medium">Chargement de la carte…</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-slate-800">Liste des activités</h2>

      {/* Tableau Responsive */}
      <div className="overflow-hidden shadow-sm rounded-lg border border-gray-200">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th style={tableHeaderStyle} className="w-12 text-center">#</th>
              <th style={tableHeaderStyle}>Commune</th>
              <th style={tableHeaderStyle}>Type d'activité / Site</th>
              <th style={tableHeaderStyle} className="hidden md:table-cell">Détails</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {activitesData.map((act, i) => (
              <ActivityRow key={act.id} act={act} index={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Sous-composant pour la ligne du tableau ---
function ActivityRow({ act, index }: { act: ActiviteAriege; index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const count = index + 1;

  return (
    <>
      <tr 
        id={`rando-${count}`}
        className={`transition-colors scroll-mt-20 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"} md:hover:bg-blue-50/30 cursor-pointer md:cursor-default`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <td style={tableCellStyle} className="text-blue-600 font-bold text-center">{count}</td>
        <td style={tableCellStyle} className="font-semibold text-slate-800">{act.commune}</td>
        <td style={tableCellStyle}>
          <div className="flex items-center justify-between">
            <span>{act.type}</span>
            <span className="md:hidden">
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </div>
        </td>
        <td style={tableCellStyle} className="hidden md:table-cell text-slate-600">
          {act.details}
        </td>
      </tr>

      {isOpen && (
        <tr className="md:hidden bg-blue-50/50">
          <td colSpan={3} className="p-4 text-sm text-slate-700">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-blue-800 text-xs uppercase tracking-wider">Détails de l'activité :</span>
              <p className="italic leading-relaxed">{act.details}</p>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// Styles
const tableHeaderStyle: CSSProperties = { padding: "12px 10px", textAlign: "left", fontSize: "14px", fontWeight: "600" };
const tableCellStyle: CSSProperties = { padding: "14px 10px", fontSize: "14px" };
