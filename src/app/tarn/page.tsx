'use client';

import { useEffect, useState, useRef, CSSProperties } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "leaflet/dist/leaflet.css";

// --- Interface de type ---
interface SiteTarn {
  id: number;
  commune: string;
  site: string;
  niveau: number;
  categorie: 'incontournable' | 'remarquable' | 'suggéré';
  lat: number;
  lng: number;
}

const TARN_CENTER: [number, number] = [43.9289, 2.1464];

// --- Couleurs thématiques ---
const getThemeColor = (categorie: SiteTarn['categorie']): string => {
  switch (categorie.toLowerCase()) {
    case 'incontournable': return '#dc2626'; // Rouge
    case 'remarquable':    return '#ea580c'; // Orange
    case 'suggéré':        return '#2563eb'; // Bleu
    default:               return '#2563eb';
  }
};

const getLabelColor = (categorie: SiteTarn['categorie']): string => {
  return (categorie.toLowerCase() === 'remarquable') ? 'white' : 'yellow';
};

export default function TarnMapPage() {
  const [sitesData, setSitesData] = useState<SiteTarn[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Refs pour Leaflet (Méthode OTAN)
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // 1. Charger les données API
  useEffect(() => {
    async function fetchSites() {
      try {
        const response = await fetch('/api/tarn');
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        let data: SiteTarn[] = await response.json();
        
        // Tri alphabétique par commune
        data.sort((a, b) => a.commune.localeCompare(b.commune, 'fr', { sensitivity: 'base' }));
        
        setSitesData(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des sites du Tarn:", error);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchSites();
  }, []);

  // 2. Initialisation de la carte (Client-side only)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current!).setView(TARN_CENTER, 9);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance.current);

        markersLayerRef.current = L.layerGroup().addTo(mapInstance.current);
      }
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

  // 3. Gestion des Marqueurs
  useEffect(() => {
    if (!isReady || !mapInstance.current || sitesData.length === 0) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      markersLayerRef.current.clearLayers();

      sitesData.forEach((site, i) => {
        const count = i + 1;
        const color = getThemeColor(site.categorie);
        const textColor = getLabelColor(site.categorie);

        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: ${color};
              width: 28px; height: 28px;
              border-radius: 50%; border: 2px solid white;
              display: flex; align-items: center; justify-content: center;
              color: ${textColor}; font-weight: bold; font-size: 12px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              ${count}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const popupContent = `
          <div style="font-family: Arial; font-size: 14px; color: #333;">
            <strong style="color: ${color};">${count}. ${site.commune}</strong> 
            <span style="text-transform: capitalize;">(${site.categorie})</span><br/>
            <hr style="margin: 5px 0; border: 0; border-top: 1px solid #eee;" />
            <b>Patrimoine :</b> ${site.site}<br/>
            <b>Niveau :</b> ${site.niveau}
          </div>
        `;

        L.marker([site.lat, site.lng], { icon: customIcon })
          .addTo(markersLayerRef.current)
          .bindPopup(popupContent);
      });
    };

    updateMarkers();
  }, [isReady, sitesData]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-6 text-red-900">
        🧱 Sites touristiques du Tarn sur la carte
      </h1>

      <p className="font-semibold text-lg mb-4 text-slate-700">
        Statut : {isLoadingData ? 'Chargement...' : `${sitesData.length} sites chargés.`}
      </p>

      {/* Légende */}
      <div style={legendStyle}>
        <strong>Légende :</strong>
        <span style={{ color: '#dc2626', fontWeight: 'bold' }}>🔴 Incontournable</span>
        <span style={{ color: '#ea580c', fontWeight: 'bold' }}>🟠 Remarquable</span>
        <span style={{ color: '#2563eb', fontWeight: 'bold' }}>🔵 Suggéré</span>
      </div>

      {/* Carte */}
      <div style={{ height: "70vh", width: "100%" }} className="mb-8 border-2 border-red-50 rounded-xl bg-gray-100 relative z-0 overflow-hidden shadow-inner">
        <div ref={mapRef} className="h-full w-full" />
        {isLoadingData && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <p className="animate-pulse font-bold text-red-900">Chargement du Pays de Cocagne...</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-red-800">
        Liste complète des sites du Tarn ({sitesData.length} marqueurs)
      </h2>

      {/* Tableau avec mise en page Aude/Tarn fusionnée */}
      <div style={{ overflowX: "auto", width: "100%", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px", backgroundColor: "white" }}>
          <thead style={{ backgroundColor: "#fef2f2" }}>
            <tr>
              <th style={tableHeaderStyle}>#</th>
              <th style={tableHeaderStyle}>Commune</th>
              <th style={tableHeaderStyle}>Monument ou site emblématique</th>
              <th style={tableHeaderStyleCenter}>Niveau</th>
              <th style={tableHeaderStyle}>Catégorie</th>
            </tr>
          </thead>
          <tbody>
            {sitesData.map((site, i) => (
              <tr key={site.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#fffafa" }}>
                <td style={tableCellStyle}>{i + 1}</td>
                <td style={{ ...tableCellStyle, fontWeight: 'bold' }}>{site.commune}</td>
                <td style={tableCellStyle}>{site.site}</td>
                <td style={tableCellStyleCenter}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '0.85em',
                    backgroundColor: site.niveau === 1 ? '#fee2e2' : site.niveau === 2 ? '#ffedd5' : '#dbeafe',
                    color: getThemeColor(site.categorie)
                  }}>
                    {site.niveau}
                  </span>
                </td>
                <td style={{ ...tableCellStyle, color: getThemeColor(site.categorie), fontWeight: 'bold' }}>
                  <span className="capitalize">{site.categorie}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Styles ---
const legendStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '20px',
  marginBottom: '20px',
  padding: '15px',
  border: '1px solid #fee2e2',
  borderRadius: '10px',
  backgroundColor: '#ffffff',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
};

const tableHeaderStyle: CSSProperties = { padding: "12px", border: "1px solid #fecaca", textAlign: "left", color: "#991b1b", fontSize: "14px" };
const tableHeaderStyleCenter: CSSProperties = { padding: "12px", border: "1px solid #fecaca", textAlign: "center", color: "#991b1b", fontSize: "14px" };
const tableCellStyle: CSSProperties = { padding: "10px", border: "1px solid #fecaca", fontSize: "14px" };
const tableCellStyleCenter: CSSProperties = { padding: "10px", border: "1px solid #fecaca", textAlign: "center", fontSize: "14px" };