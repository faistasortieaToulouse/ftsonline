'use client';

import { useEffect, useState, useRef } from "react"; 
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, XCircle, Loader2 } from "lucide-react";

// --- Interface de type ---
interface PaysUE {
  nom: string;
  code: string;
  entree_ue: number;
  schengen: boolean | string;
  lat: number;
  lng: number;
}

const EU_CENTER: [number, number] = [48.5, 12];
const EU_BLUE = "#003399";
const EU_YELLOW = "#FFCC00";

export default function MembresUEPage() { 
  const [pays, setPays] = useState<PaysUE[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function fetchPays() {
      try {
        const response = await fetch('/api/membresue'); 
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        let data: PaysUE[] = await response.json();
        
        if (Array.isArray(data)) {
          const sorted = data.sort((a, b) => a.entree_ue - b.entree_ue);
          setPays(sorted);
        }
      } catch (error) {
        console.error("Erreur API UE:", error);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchPays();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (mapInstance.current) return;

      const map = L.map(mapRef.current).setView(EU_CENTER, 3); // Zoom ajusté pour mobile
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      setIsReady(true);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isLoadingData]);

  useEffect(() => {
    if (!isReady || !mapInstance.current || pays.length === 0) return;

    const addMarkers = async () => {
      const L = (await import('leaflet')).default;

      pays.forEach((p) => {
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="background-color: ${EU_BLUE}; width: 28px; height: 28px; border-radius: 50%; border: 2px solid ${EU_YELLOW}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 9px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
              ${p.code}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        L.marker([p.lat, p.lng], { icon: customIcon })
          .addTo(mapInstance.current)
          .bindPopup(`<b>${p.nom}</b><br>Adhésion: ${p.entree_ue}`);
      });
    };

    addMarkers();
  }, [isReady, pays]);

  return ( 
    <div className="p-3 md:p-6 max-w-7xl mx-auto bg-slate-50 min-h-screen"> 
      <nav className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour
        </Link>
      </nav>

      <header className="mb-6">
        <h1 className="text-2xl md:text-4xl font-black text-blue-900 leading-tight">
          🇪🇺 Les 27 États de l'UE
        </h1>
        <p className="text-gray-500 text-sm md:text-base mt-1">Chronologie des adhésions et espace Schengen</p>
      </header>

      {/* --- CARTE LEAFLET - VERSION MISE À JOUR --- */}
      <div
        ref={mapRef}
        className="mb-8 border rounded-2xl bg-gray-100 shadow-inner overflow-hidden h-[40vh] md:h-[60vh] relative"
        style={{ zIndex: 0 }}
      >
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 z-10">
            <Loader2 className="animate-spin h-8 w-8 text-violet-600 mb-2" />
            <p className="text-slate-500 animate-pulse text-sm">Chargement de la carte…</p>
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold mb-4 text-slate-800">Détails des membres</h2> 

      {/* TABLEAU RESPONSIVE */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-slate-200">
        <table className="w-full border-collapse min-w-[320px]"> 
          <thead className="bg-slate-50 border-b-2 border-slate-100"> 
            <tr> 
              <th className="hidden sm:table-cell p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider text-center w-16">ISO</th>
              <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Pays</th> 
              <th className="p-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Adhésion</th> 
              <th className="p-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Schengen</th> 
            </tr> 
          </thead> 
          <tbody className="divide-y divide-slate-100 text-sm"> 
            {pays.map((p, i) => ( 
              <tr key={p.code} className="hover:bg-blue-50/50 transition-colors"> 
                <td className="hidden sm:table-cell p-4 text-center font-bold text-blue-800 bg-slate-50/50 text-xs">{p.code}</td>
                <td className="p-4 font-bold text-slate-800">{p.nom}</td> 
                <td className="p-4 text-center">
                  <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-md text-xs font-bold">
                    {p.entree_ue}
                  </span>
                </td> 
                <td className="p-4">
                  <div className="flex items-center justify-center gap-2">
                    <SchengenBadge status={p.schengen} />
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

// Composant interne pour les badges Schengen
function SchengenBadge({ status }: { status: boolean | string }) {
  if (status === 'partiel') {
    return <span className="flex items-center gap-1 text-amber-600 font-medium text-xs"><AlertCircle size={14}/> Partiel</span>;
  }
  return status ? 
    <span className="flex items-center gap-1 text-green-600 font-medium text-xs"><CheckCircle2 size={14}/> Inclus</span> : 
    <span className="flex items-center gap-1 text-red-500 font-medium text-xs"><XCircle size={14}/> Exclu</span>;
}
