'use client';

import { useEffect, useRef, useState, CSSProperties } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// --- Interface de type ---
interface ActiviteAriege {
  id: number;
  commune: string;
  type: string;
  details: string;
}

// Coordonnées pour centrer la carte sur l'Ariège (Foix)
const ARIEGE_CENTER: [number, number] = [42.9667, 1.6000];

export default function RandoAriegePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const [activitesData, setActivitesData] = useState<ActiviteAriege[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // ---- 1. Récupération des données ----
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

  // ---- 2. Initialisation de la carte Leaflet (Méthode OTAN) ----
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || activitesData.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      if (!mapInstance.current) {
        // Initialisation de l'instance
        mapInstance.current = L.map(mapRef.current!).setView(ARIEGE_CENTER, 9);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance.current);

        // Groupe pour gérer les marqueurs proprement
        markersLayerRef.current = L.layerGroup().addTo(mapInstance.current);
      }

      // Nettoyage des marqueurs si re-calcul
      markersLayerRef.current.clearLayers();

      activitesData.forEach((act, i) => {
        const count = i + 1;
        
        // Simulation de dispersion (puisque nous n'avons pas de lat/lng dans l'interface originale)
        // Note: Si votre API fournit lat/lng, remplacez ces calculs par act.lat et act.lng
        const lat = ARIEGE_CENTER[0] + (Math.random() - 0.5) * 0.4;
        const lng = ARIEGE_CENTER[1] + (Math.random() - 0.5) * 0.4;

        // Création de l'icône personnalisée numérotée
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: #1d4ed8; 
              color: white; 
              width: 24px; height: 24px; 
              border-radius: 50%; 
              display: flex; align-items: center; justify-content: center; 
              font-size: 11px; font-weight: bold; 
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              ${count}
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const popupContent = `
          <div style="font-family: Arial; font-size: 14px;">
            <strong>${count}. ${act.commune}</strong><br/>
            <b>Type :</b> ${act.type}<br/>
            <b>Détails :</b> ${act.details}
          </div>
        `;

        L.marker([lat, lng], { icon: customIcon })
          .addTo(markersLayerRef.current)
          .bindPopup(popupContent);
      });

      setIsMapReady(true);
    };

    initMap();

    // Cleanup au démontage
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [activitesData]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
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
      <div
        style={{ height: "70vh", width: "100%", zIndex: 0 }}
        className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center relative overflow-hidden shadow-inner"
      >
        <div ref={mapRef} className="h-full w-full" />
        {(!isMapReady || isLoadingData) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 z-10">
            <p className="animate-pulse font-medium">Chargement de la carte et des données…</p>
          </div>
        )}
      </div>

      {/* Tableau */}
      <h2 className="text-2xl font-semibold mb-4 text-slate-800">
        Liste complète des activités ({activitesData.length} marqueurs)
      </h2>

      <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#e0e0e0" }}>
            <tr>
              <th style={tableHeaderStyle}>#</th>
              <th style={tableHeaderStyle}>Commune</th>
              <th style={tableHeaderStyle}>Type d'activité / Site</th>
              <th style={tableHeaderStyle}>Détails</th>
            </tr>
          </thead>
          <tbody>
            {activitesData.map((act, i) => (
              <tr key={act.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f9f9f9" }}>
                <td style={tableCellStyle}>{i + 1}</td>
                <td style={tableCellStyle}>{act.commune}</td>
                <td style={tableCellStyle}>{act.type}</td>
                <td style={tableCellStyle}>{act.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Styles table
const tableHeaderStyle: CSSProperties = { padding: "12px 10px", border: "1px solid #ccc", textAlign: "left", fontSize: "14px" };
const tableCellStyle: CSSProperties = { padding: "10px 8px", border: "1px solid #ddd", fontSize: "14px" };