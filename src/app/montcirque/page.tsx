// src/app/montcirque/page.tsx
'use client'; 

import { useEffect, useRef, useState, CSSProperties } from "react"; 
import type { MontCirquePOI } from '../api/montcirque/route'; 
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Définition du type
type POI = MontCirquePOI;

// COORDONNÉES CENTRALE
const OCCITANIE_CENTER: [number, number] = [43.6, 2.5]; 

const COLOR_MAP: Record<string, string> = {
    'pic': '#E74C3C',    // Rouge
    'cirque': '#3498DB', // Bleu
    'autre': '#27AE60'   // Vert
};

export default function MontCirqueMapPage() { 
  const mapRef = useRef<HTMLDivElement | null>(null); 
  const mapInstance = useRef<any>(null); 
  const [pointsData, setPointsData] = useState<POI[]>([]);
  const [isReady, setIsReady] = useState(false); 
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fonction utilitaire pour le type
  const getPointTypeDisplay = (type: POI['type']): string => {
    switch (type) {
        case 'pic': return 'Pic / Montagne';
        case 'cirque': return 'Cirque';
        case 'autre': return 'Massif / Plateau';
        default: return 'Non défini';
    }
  };

  // ---- 1. Récupération des données ----
  useEffect(() => {
    async function fetchPoints() {
      try {
        const response = await fetch('/api/montcirque'); 
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data: POI[] = await response.json();
        // Tri alphabétique par nom
        data.sort((a, b) => a.name.localeCompare(b.name));
        setPointsData(data);
      } catch (error) {
        console.error("Erreur API:", error);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchPoints();
  }, []);

  // ---- 2. Initialisation Leaflet (Méthode OTAN) ----
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current).setView(OCCITANIE_CENTER, 8);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

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

  // ---- 3. Ajout des Marqueurs ----
  useEffect(() => {
    if (!isReady || !mapInstance.current || pointsData.length === 0) return;

    const addMarkers = async () => {
      const L = (await import('leaflet')).default;

      pointsData.forEach((point) => {
        const pointColor = COLOR_MAP[point.type] || '#7F8C8D';
        
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: ${pointColor};
              width: 30px; height: 30px;
              border-radius: 5px; border: 2px solid white;
              display: flex; align-items: center; justify-content: center;
              color: white; font-weight: bold; font-size: 11px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              ${point.id}
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const altitudeDisplay = point.altitude ? `<br/><b>Altitude :</b> ${point.altitude} m` : '';
        
        const marker = L.marker([point.lat, point.lng], { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: Arial; font-size: 14px; color: black;"> 
            <strong>${point.id}. ${point.name}</strong><br/> 
            <b>Massif :</b> ${point.massif}<br/>
            <b>Type :</b> ${getPointTypeDisplay(point.type)}
            ${altitudeDisplay}
          </div>
        `);
        marker.addTo(mapInstance.current);
      });
    };

    addMarkers();
  }, [isReady, pointsData]);

  return ( 
    <div className="p-4 max-w-7xl mx-auto"> 
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-6">⛰️ Pics, Cirques et Massifs d'Occitanie</h1> 

      <p className="font-semibold text-lg mb-4 text-slate-700">
        Statut : {isLoadingData ? 'Chargement...' : `${pointsData.length} points chargés.`}
      </p>

      {/* Légende */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white border rounded-lg shadow-sm">
          <span className="flex items-center gap-2 font-bold" style={{ color: COLOR_MAP.pic }}>
            <span className="w-4 h-4 rounded" style={{ backgroundColor: COLOR_MAP.pic }}></span> Pic / Montagne
          </span>
          <span className="flex items-center gap-2 font-bold" style={{ color: COLOR_MAP.cirque }}>
            <span className="w-4 h-4 rounded" style={{ backgroundColor: COLOR_MAP.cirque }}></span> Cirque
          </span>
          <span className="flex items-center gap-2 font-bold" style={{ color: COLOR_MAP.autre }}>
            <span className="w-4 h-4 rounded" style={{ backgroundColor: COLOR_MAP.autre }}></span> Massif / Plateau
          </span>
      </div>

      {/* Carte */}
      <div style={{ height: "65vh", width: "100%" }} className="mb-8 border rounded-xl bg-gray-100 relative z-0 overflow-hidden shadow-inner"> 
        <div ref={mapRef} className="h-full w-full" />
        {isLoadingData && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <p className="animate-pulse font-bold text-blue-600">Initialisation de la carte...</p>
          </div>
        )}
      </div>
      
      {/* Tableau */}
      <h2 className="text-2xl font-semibold mb-4 text-slate-800">Liste détaillée des sites</h2> 

      <div className="overflow-x-auto rounded-lg border shadow-sm">
        <table className="w-full border-collapse bg-white text-left"> 
          <thead className="bg-slate-50"> 
            <tr> 
              <th style={tableHeaderStyle}>ID</th>
              <th style={tableHeaderStyle}>Nom du site</th> 
              <th style={tableHeaderStyle}>Type</th> 
              <th style={tableHeaderStyleCenter}>Altitude</th>
              <th style={tableHeaderStyle}>Massif</th> 
              <th style={tableHeaderStyle}>Département</th> 
            </tr> 
          </thead> 
          <tbody>
            {pointsData.map((point, i) => {
              const pointColor = COLOR_MAP[point.type] || '#7F8C8D';
              return (
                <tr key={point.id} className="border-t hover:bg-slate-50 transition-colors"> 
                  <td className="p-3 font-bold" style={{ color: pointColor }}>{point.id}</td> 
                  <td className="p-3 font-semibold text-slate-900">{point.name}</td> 
                  <td className="p-3">
                    <span className="px-2 py-1 rounded text-xs font-bold text-white" style={{ backgroundColor: pointColor }}>
                        {getPointTypeDisplay(point.type)}
                    </span>
                  </td> 
                  <td className="p-3 text-center font-mono">{point.altitude ? `${point.altitude} m` : '-'}</td> 
                  <td className="p-3 text-slate-600">{point.massif}</td> 
                  <td className="p-3 text-slate-600">{point.department}</td> 
                </tr> 
              );
            })}
          </tbody>
        </table> 
      </div>
    </div> 
  ); 
}

const tableHeaderStyle: CSSProperties = { padding: "12px", borderBottom: "2px solid #e2e8f0", fontSize: "14px", fontWeight: "bold", color: "#475569" };
const tableHeaderStyleCenter: CSSProperties = { ...tableHeaderStyle, textAlign: "center" };