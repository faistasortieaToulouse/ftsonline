'use client';

import { useEffect, useState, useRef } from "react"; 
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, XCircle, Loader2, Landmark, Globe, Calendar } from "lucide-react";
import "leaflet/dist/leaflet.css";

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
  const markersRef = useRef<Map<string, any>>(new Map());
  const [isReady, setIsReady] = useState(false);

  // 1. Chargement et tri des données
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

  // 2. Initialisation de la carte
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      if (mapInstance.current) return;

      const map = L.map(mapRef.current!).setView(EU_CENTER, 4);
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      // Correction de la taille au rendu
      setTimeout(() => {
        map.invalidateSize();
        setIsReady(true);
      }, 500);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isLoadingData]);

  // 3. Ajout des marqueurs synchronisés
  useEffect(() => {
    if (!isReady || !mapInstance.current || pays.length === 0) return;

    const addMarkers = async () => {
      const L = (await import('leaflet')).default;

      pays.forEach((p) => {
        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div style="
              background-color: ${EU_BLUE}; 
              width: 30px; 
              height: 30px; 
              border-radius: 50%; 
              border: 3px solid ${EU_YELLOW}; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              color: white; 
              font-weight: 900; 
              font-size: 10px; 
              box-shadow: 0 4px 10px rgba(0,51,153,0.3);
            ">
              ${p.code}
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const marker = L.marker([p.lat, p.lng], { icon: customIcon })
          .addTo(mapInstance.current)
          .bindPopup(`
            <div style="text-align: center; padding: 5px; font-family: sans-serif;">
              <div style="color: ${EU_BLUE}; font-weight: 900; font-size: 10px; text-transform: uppercase;">État Membre</div>
              <strong style="font-size: 16px; display: block; margin: 4px 0; color: #1e293b;">${p.nom}</strong>
              <div style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; display: inline-block;">
                Adhésion : ${p.entree_ue}
              </div>
            </div>
          `);
        
        markersRef.current.set(p.code, marker);
      });
    };

    addMarkers();
  }, [isReady, pays]);

  const focusOnCountry = (p: PaysUE) => {
    const marker = markersRef.current.get(p.code);
    if (mapInstance.current && marker) {
      mapInstance.current.flyTo([p.lat, p.lng], 6, { duration: 1.5 });
      marker.openPopup();
      window.scrollTo({ top: 150, behavior: 'smooth' });
    }
  };

  return ( 
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900"> 
      
      <nav className="mb-8 flex justify-between items-center">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-800 hover:text-blue-900 font-black uppercase text-[10px] tracking-[0.2em] transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Portail Europe
        </Link>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Data Update 2026</span>
      </nav>

      <header className="mb-10 bg-white p-6 md:p-10 rounded-[3rem] shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 -z-0"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-black text-blue-900 uppercase tracking-tighter italic leading-none flex items-center gap-4">
            États <span className="text-blue-600 underline decoration-yellow-400 decoration-4 underline-offset-8">MEMBRES</span>
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-4 flex items-center gap-2">
            <Globe size={14} className="text-blue-500" /> Chronologie de la construction européenne
          </p>
        </div>
        <div className="flex gap-4 z-10">
           <div className="bg-blue-900 text-white p-5 rounded-[2rem] shadow-xl shadow-blue-100 text-center min-w-[120px]">
              <span className="block text-3xl font-black italic tracking-tighter leading-none">{pays.length}</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-300">Nations</span>
           </div>
        </div>
      </header>

      {/* CARTE */}
      <div className="relative w-full mb-12 border-4 border-white shadow-2xl rounded-[3rem] bg-slate-200 overflow-hidden z-0" style={{ height: "55vh" }}>
        <div ref={mapRef} className="h-full w-full" />
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/90 z-10 backdrop-blur-sm">
            <Loader2 className="animate-spin text-blue-700 mb-3" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Déploiement des frontières...</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Landmark className="text-blue-600" size={24} />
        <h2 className="text-xl font-black uppercase tracking-tighter italic text-slate-800">Détails de l'Union</h2> 
      </div>

      {/* TABLEAU */}
      <div className="overflow-hidden bg-white rounded-[2rem] shadow-sm border border-slate-200">
        <table className="w-full border-collapse"> 
          <thead> 
            <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest italic"> 
              <th className="hidden sm:table-cell p-5 text-center w-20">ISO</th>
              <th className="p-5 text-left">Dénomination</th> 
              <th className="p-5 text-center"><div className="flex items-center justify-center gap-2"><Calendar size={12}/> Adhésion</div></th> 
              <th className="p-5 text-center">Espace Schengen</th> 
            </tr> 
          </thead> 
          <tbody className="divide-y divide-slate-100"> 
            {pays.map((p) => ( 
              <tr 
                key={p.code} 
                onClick={() => focusOnCountry(p)}
                className="hover:bg-blue-50/50 cursor-pointer transition-all group"
              > 
                <td className="hidden sm:table-cell p-5 text-center">
                  <span className="bg-slate-100 text-slate-400 group-hover:bg-blue-600 group-hover:text-white px-3 py-1 rounded-lg font-black text-[10px] transition-colors border border-slate-200">
                    {p.code}
                  </span>
                </td>
                <td className="p-5 font-black text-slate-800 uppercase tracking-tighter group-hover:text-blue-800 transition-colors">
                  {p.nom}
                </td> 
                <td className="p-5 text-center">
                  <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-[11px] font-black border border-amber-100 shadow-sm shadow-amber-50">
                    {p.entree_ue}
                  </span>
                </td> 
                <td className="p-5">
                  <div className="flex items-center justify-center">
                    <SchengenBadge status={p.schengen} />
                  </div>
                </td> 
              </tr> 
            ))} 
          </tbody> 
        </table>
      </div> 
      
      <style jsx global>{`
        .custom-div-icon { background: none !important; border: none !important; }
        .leaflet-popup-content-wrapper { border-radius: 1.5rem; border: 3px solid #003399; }
        .leaflet-popup-tip { background: #003399; }
      `}</style>
    </div> 
  ); 
}

function SchengenBadge({ status }: { status: boolean | string }) {
  if (status === 'partiel') {
    return <span className="flex items-center gap-1.5 text-amber-600 font-black text-[10px] uppercase tracking-tighter bg-amber-50 px-3 py-1 rounded-lg border border-amber-100 animate-pulse"><AlertCircle size={14}/> Partiel</span>;
  }
  return status ? 
    <span className="flex items-center gap-1.5 text-green-600 font-black text-[10px] uppercase tracking-tighter bg-green-50 px-3 py-1 rounded-lg border border-green-100"><CheckCircle2 size={14}/> Inclus</span> : 
    <span className="flex items-center gap-1.5 text-red-500 font-black text-[10px] uppercase tracking-tighter bg-red-50 px-3 py-1 rounded-lg border border-red-100"><XCircle size={14}/> Exclu</span>;
}
