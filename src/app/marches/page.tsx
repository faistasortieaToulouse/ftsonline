'use client';

import { useEffect, useState, useRef, CSSProperties } from "react"; 
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// --- Interface de type ---
interface Marche {
  id: number;
  nom: string;
  type: string;
  adresse: string;
  code_postal: number | null;
  commune: string;
  jours_de_tenue: string;
  horaires: Record<string, string | null>;
  lat: number;
  lon: number;
}

const TOULOUSE_CENTER: [number, number] = [43.6047, 1.4442];

// --- Couleurs thématiques (Vert pour les marchés) ---
const THEME_COLOR = '#16a34a'; // Vert émeraude

export default function MarchesPage() { 
  const [marches, setMarches] = useState<Marche[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Refs pour Leaflet (Méthode OTAN)
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // 1. Charger les données API
  useEffect(() => {
    async function fetchMarches() {
      try {
        const response = await fetch('/api/marches'); 
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        let data: Marche[] = await response.json();
        // Tri par commune ou nom
        data.sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }));
        setMarches(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des marchés:", error);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchMarches();
  }, []);

  // 2. Initialisation de la carte
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current).setView(TOULOUSE_CENTER, 12);

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

  // 3. Ajout des marqueurs
  useEffect(() => {
    if (!isReady || !mapInstance.current || marches.length === 0) return;

    const addMarkers = async () => {
      const L = (await import('leaflet')).default;

      marches.forEach((m, i) => {
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: ${THEME_COLOR};
              width: 28px; height: 28px;
              border-radius: 50%; border: 2px solid white;
              display: flex; align-items: center; justify-content: center;
              color: white; font-weight: bold; font-size: 12px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              ${i + 1}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([m.lat, m.lon], { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: Arial; font-size: 14px; color: black;"> 
            <strong>${i + 1}. ${m.nom}</strong><br/> 
            <b>Adresse :</b> ${m.adresse}<br/>
            <b>Jours :</b> ${m.jours_de_tenue}
          </div>
        `);
        marker.addTo(mapInstance.current);
      });
    };

    addMarkers();
  }, [isReady, marches]);

  return ( 
    <div className="p-4 max-w-7xl mx-auto"> 
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-6 text-green-700 text-center">
        🥕 Marchés de Toulouse ({marches.length})
      </h1> 

      <p className="font-semibold text-lg mb-4 text-slate-700">
        Statut : {isLoadingData ? 'Chargement...' : `${marches.length} marchés chargés.`}
      </p>

      {/* ZONE CARTE */}
      <div style={{ height: "60vh", width: "100%" }} className="mb-8 border rounded-lg bg-gray-100 relative z-0 overflow-hidden shadow-inner border-green-200"> 
        <div ref={mapRef} className="h-full w-full" />
        {isLoadingData && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <p className="animate-pulse font-bold text-green-600">Initialisation de la carte...</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-slate-800">Liste complète des marchés</h2> 

      <div style={{ overflowX: "auto", width: "100%", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px", backgroundColor: "white" }}> 
          <thead style={{ backgroundColor: "#f1f5f9" }}> 
            <tr> 
              <th style={tableHeaderStyle}>#</th>
              <th style={tableHeaderStyle}>Nom du Marché</th> 
              <th style={tableHeaderStyle}>Adresse</th> 
              <th style={tableHeaderStyle}>Commune</th> 
              <th style={tableHeaderStyle}>Jours de tenue</th> 
              <th style={tableHeaderStyle}>Type</th> 
            </tr> 
          </thead> 
          <tbody> 
            {marches.map((m, i) => ( 
              <tr key={m.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f8fafc" }}> 
                <td style={tableCellStyle}>{i + 1}</td>
                <td style={{ ...tableCellStyle, fontWeight: 'bold', color: THEME_COLOR }}>{m.nom}</td> 
                <td style={tableCellStyle}>{m.adresse}</td> 
                <td style={tableCellStyle}>{m.commune} {m.code_postal ? `(${m.code_postal})` : ''}</td> 
                <td style={{ ...tableCellStyle, fontStyle: 'italic' }}>{m.jours_de_tenue}</td> 
                <td style={tableCellStyle}>{m.type}</td> 
              </tr> 
            ))} 
          </tbody> 
        </table>
      </div> 
    </div> 
  ); 
}

// --- Styles du tableau (Identique à Aude/Lot) ---
const tableHeaderStyle: CSSProperties = { padding: "12px", border: "1px solid #e2e8f0", textAlign: "left", fontSize: "14px", color: "#475569" };
const tableCellStyle: CSSProperties = { padding: "10px", border: "1px solid #e2e8f0", fontSize: "14px", color: "#1e293b" };