'use client';

import { useEffect, useRef, useState, CSSProperties } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp, Beer, MapPin, Info, Loader2 } from "lucide-react";

// --- Interface de type ---
interface PubToulouse {
  id: number;
  name: string;
  category: string;
  address: string;
  coords: [number, number];
}

const TOULOUSE_CENTER: [number, number] = [43.6047, 1.4442];
const THEME_COLOR = '#d97706'; // Ambre Bière

export default function PubToulousePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const [pubsData, setPubsData] = useState<PubToulouse[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // 1. Récupération des données
  useEffect(() => {
    async function fetchPubs() {
      try {
        const response = await fetch('/api/pubtoulouse');
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data = await response.json();
        
        const formattedData = data.map((p: any, index: number) => ({
          id: index + 1,
          name: p.name,
          category: p.category,
          address: p.address,
          coords: p.coords
        }));
        
        setPubsData(formattedData);
      } catch (error) {
        console.error("Erreur lors de la récupération des pubs:", error);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchPubs();
  }, []);

  // 2. Initialisation de la carte
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || pubsData.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      
      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current!).setView(TOULOUSE_CENTER, 14);
        L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap France'
        }).addTo(mapInstance.current);
        markersLayerRef.current = L.layerGroup().addTo(mapInstance.current);
      }

      markersLayerRef.current.clearLayers();

      pubsData.forEach((pub, i) => {
        const count = i + 1;
        
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${THEME_COLOR}; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.3);">${count}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const popupContent = `
          <div style="text-align: center; font-family: sans-serif; min-width: 150px;">
            <strong style="color: #92400e; font-size: 14px; display: block; margin-bottom: 2px;">${count}. ${pub.name}</strong>
            <span style="font-size: 10px; text-transform: uppercase; font-weight: bold; color: #d97706; letter-spacing: 0.05em;">${pub.category}</span>
            <hr style="margin: 8px 0; border: 0; border-top: 1px solid #eee;" />
            <a href="#pub-${pub.id}" style="display: inline-block; background: #1e293b; color: white; padding: 5px 10px; border-radius: 4px; text-decoration: none; font-size: 10px; font-weight: bold; text-transform: uppercase;">Voir détails</a>
          </div>
        `;

        L.marker(pub.coords, { icon: customIcon })
          .addTo(markersLayerRef.current)
          .bindPopup(popupContent);
      });
      setIsMapReady(true);
    };

    initMap();
  }, [pubsData]);

  return (
    <div className="p-4 max-w-7xl mx-auto bg-slate-50 min-h-screen font-sans">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-900 hover:text-amber-700 font-bold group transition-all">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight italic uppercase tracking-tighter flex items-center gap-3">
            <Beer className="text-amber-600" size={32} /> Pubs de <span className="text-amber-600">Toulouse</span>
          </h1>
          <p className="text-slate-500 mt-1 font-bold italic text-sm uppercase tracking-widest">The Anglo-Saxon spirit in the Pink City</p>
        </div>
        <div className="px-5 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-amber-900/20">
          {isLoadingData ? 'Chargement...' : `${pubsData.length} établissements`}
        </div>
      </header>

      {/* CARTE */}
      <div className="mb-12 border-4 border-white rounded-[2.5rem] bg-slate-200 shadow-2xl overflow-hidden h-[45vh] md:h-[60vh] relative z-0">
        <div ref={mapRef} className="h-full w-full" />
        {(!isMapReady || isLoadingData) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 z-10 backdrop-blur-sm">
            <Loader2 className="animate-spin h-10 w-10 text-amber-600 mb-2" />
            <p className="text-amber-800 font-black text-xs uppercase tracking-widest">Préparation de la tournée...</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-black mb-6 text-slate-800 flex items-center gap-3">
        <Info className="text-amber-600" />
        L'ANNUAIRE DES PUBS
      </h2>

      {/* TABLEAU */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 mb-12">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-900 text-white">
            <tr className="uppercase text-[10px] tracking-widest font-black">
              <th className="p-5 w-16 text-center">#</th>
              <th className="p-5">Nom de l'établissement</th>
              <th className="p-5">Style</th>
              <th className="p-5 hidden md:table-cell">Localisation (Adresse)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pubsData.map((pub, i) => (
              <PubRow key={pub.id} pub={pub} index={i} />
            ))}
          </tbody>
        </table>
      </div>

      <footer className="py-12 border-t border-slate-200 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
            Cheers • Pub crawl Toulouse • 2026
        </p>
      </footer>
    </div>
  );
}

function PubRow({ pub, index }: { pub: PubToulouse; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <tr 
        id={`pub-${pub.id}`}
        className={`border-b border-gray-50 transition-colors scroll-mt-24 ${isOpen ? "bg-amber-50" : "bg-white"} hover:bg-amber-50/50 cursor-pointer`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <td className="p-5 text-amber-700 font-black text-center text-base align-top">{index + 1}</td>
        <td className="p-5 align-top">
            <div className="flex flex-col">
                <span className="font-black text-slate-900 text-base uppercase tracking-tighter leading-tight">{pub.name}</span>
                <span className="md:hidden text-[10px] font-bold text-amber-600 uppercase mt-1 italic tracking-widest">{pub.category}</span>
            </div>
        </td>
        <td className="p-5 align-top">
          <div className="flex items-center justify-between">
            <span className="hidden md:inline-block px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {pub.category}
            </span>
            <span className="md:hidden text-amber-600">
              {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </span>
          </div>
        </td>
        <td className="hidden md:table-cell p-5 align-top">
          <div className="flex items-start gap-2 text-slate-500 italic text-xs leading-relaxed">
            <MapPin size={14} className="mt-0.5 text-amber-500 flex-shrink-0" />
            {pub.address}
          </div>
        </td>
      </tr>

      {/* Accordéon Mobile */}
      {isOpen && (
        <tr className="md:hidden bg-amber-50/30 animate-in fade-in slide-in-from-top-1 duration-200">
          <td colSpan={3} className="p-6 pt-0 border-b border-amber-100 text-slate-700">
            <div className="flex flex-col gap-3 py-4 border-t border-amber-100">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                    <span className="font-black text-amber-800 text-[10px] uppercase tracking-widest block mb-1">Adresse complète :</span>
                    <p className="text-xs font-semibold leading-relaxed italic">{pub.address}</p>
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <button className="text-[9px] font-black bg-slate-900 text-white px-4 py-2 rounded-full uppercase tracking-widest">
                    Y aller (GPS)
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
