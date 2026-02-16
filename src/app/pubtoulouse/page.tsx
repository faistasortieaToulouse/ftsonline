'use client';

import { useEffect, useRef, useState, CSSProperties } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp, Beer } from "lucide-react";

// --- Interface de type ---
interface PubToulouse {
  id: number;
  name: string;
  category: string;
  address: string;
  coords: [number, number];
}

const TOULOUSE_CENTER: [number, number] = [43.6047, 1.4442];

export default function PubToulousePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const [pubsData, setPubsData] = useState<PubToulouse[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    async function fetchPubs() {
      try {
        const response = await fetch('/api/pubtoulouse');
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data = await response.json();
        
        // On map les données pour correspondre aux clés attendues (id, etc.)
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
        
        // Création du marqueur numéroté bleu
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: #d97706; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${count}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const popupContent = `
          <div style="font-family: Arial, sans-serif; padding: 5px;">
            <strong style="color: #92400e; font-size: 14px;">${count}. ${pub.name}</strong><br/>
            <b style="font-size: 11px; text-transform: uppercase; color: #6b7280;">${pub.category}</b><br/>
            <div style="margin-top: 5px; font-size: 12px;">${pub.address}</div>
          </div>
        `;

        L.marker(pub.coords, { icon: customIcon })
          .addTo(markersLayerRef.current)
          .bindPopup(popupContent);
      });
      setIsMapReady(true);
    };

    initMap();
    
    return () => {
      // Nettoyage pour éviter les fuites de mémoire au démontage
    };
  }, [pubsData]);

  return (
    <div className="p-4 max-w-7xl mx-auto bg-white min-h-screen">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <Beer className="text-amber-600" /> Pubs anglo-saxons de Toulouse
          </h1>
          <p className="text-slate-500 mt-1 italic">The British, Irish & Scottish Spirit in the Pink City</p>
        </div>
        <p className="font-semibold text-sm px-4 py-2 bg-amber-50 text-amber-800 rounded-full border border-amber-100">
          {isLoadingData ? 'Chargement...' : `${pubsData.length} établissements répertoriés`}
        </p>
      </div>

      {/* Carte (Style Ariège adapté) */}
      <div style={{ height: "55vh", width: "100%", zIndex: 0 }} className="mb-8 border-4 border-slate-50 rounded-2xl bg-gray-100 relative overflow-hidden shadow-xl">
        <div ref={mapRef} className="h-full w-full" />
        {(!isMapReady || isLoadingData) && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="font-medium text-slate-600">Préparation de la tournée…</p>
            </div>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-4 text-slate-800 flex items-center gap-2">
        Détails des établissements
      </h2>

      {/* Tableau Responsive avec Accordéon */}
      <div className="overflow-hidden shadow-sm rounded-xl border border-gray-200 mb-12">
        <table className="w-full border-collapse">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th style={tableHeaderStyle} className="w-14 text-center">#</th>
              <th style={tableHeaderStyle}>Nom du Pub</th>
              <th style={tableHeaderStyle}>Style / Catégorie</th>
              <th style={tableHeaderStyle} className="hidden md:table-cell">Localisation (Adresse)</th>
            </tr>
          </thead>
          <tbody>
            {pubsData.map((pub, i) => (
              <PubRow key={pub.id} pub={pub} index={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Sous-composant pour la ligne du tableau ---
function PubRow({ pub, index }: { pub: PubToulouse; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <tr 
        className={`border-b border-gray-100 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-slate-50/30"} md:hover:bg-amber-50/50 cursor-pointer md:cursor-default`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <td style={tableCellStyle} className="text-amber-700 font-black text-center">{index + 1}</td>
        <td style={tableCellStyle} className="font-bold text-slate-800">{pub.name}</td>
        <td style={tableCellStyle}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-600 uppercase tracking-tighter">
              {pub.category}
            </span>
            <span className="md:hidden text-slate-400">
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </div>
        </td>
        <td style={tableCellStyle} className="hidden md:table-cell text-slate-500 italic text-sm">
          {pub.address}
        </td>
      </tr>

      {/* Détails en accordéon sur mobile */}
      {isOpen && (
        <tr className="md:hidden bg-amber-50/30">
          <td colSpan={3} className="p-4 text-sm text-slate-700 border-b border-amber-100">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-amber-800 text-xs uppercase tracking-wider">Adresse complète :</span>
              <p className="leading-relaxed">{pub.address}</p>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// Styles
const tableHeaderStyle: CSSProperties = { padding: "16px 12px", textAlign: "left", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" };
const tableCellStyle: CSSProperties = { padding: "14px 12px", fontSize: "14px" };
