'use client';

import { useEffect, useRef, useState, CSSProperties } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// --- Interface synchronisée avec route.ts ---
interface SiteTG {
  id: number;
  commune: string;
  site: string; // Changé de 'description' à 'site'
  niveau: number;
  categorie: 'incontournable' | 'remarquable' | 'suggéré';
  lat: number;
  lng: number;
}

const TG_CENTER: [number, number] = [44.05, 1.40];

const getThemeColor = (categorie: string): string => {
  const cat = categorie.toLowerCase();
  if (cat.includes('incontournable')) return '#ef4444'; 
  if (cat.includes('remarquable')) return '#f97316';   
  return '#3b82f6';                                     
};

const getLabelColor = (categorie: string): string => {
  return categorie.toLowerCase().includes('remarquable') ? 'white' : 'yellow';
};

export default function TarnGaronneMapPage() {
  const [sitesData, setSitesData] = useState<SiteTG[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function fetchSites() {
      try {
        const response = await fetch('/api/tarngaronne');
        if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
        let data: SiteTG[] = await response.json();
        
        data.sort((a, b) => a.commune.localeCompare(b.commune, 'fr', { sensitivity: 'base' }));
        setSitesData(data);
      } catch (error) {
        console.error("Erreur récupération Tarn-et-Garonne :", error);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchSites();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current!).setView(TG_CENTER, 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      markersLayerRef.current = L.layerGroup().addTo(mapInstance.current);
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
    if (!isReady || !mapInstance.current || sitesData.length === 0) return;

    const addMarkers = async () => {
      const L = (await import('leaflet')).default;
      markersLayerRef.current.clearLayers();

      sitesData.forEach((site, i) => {
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
              ${i + 1}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([site.lat, site.lng], { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: Arial; font-size: 14px; color: black; max-width: 200px;"> 
            <strong style="color: ${color};">${i + 1}. ${site.commune}</strong><br/> 
            <b>Site :</b> ${site.site}<br/>
            <b>Niveau :</b> ${site.niveau}
          </div>
        `);
        marker.addTo(markersLayerRef.current);
      });
    };

    addMarkers();
  }, [isReady, sitesData]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-6 text-slate-900">🌳 Sites touristiques du Tarn-et-Garonne</h1>

      <p className="font-semibold text-lg mb-4 text-slate-700">
        Statut : {isLoadingData ? 'Chargement...' : `${sitesData.length} sites chargés.`}
      </p>

      <div style={legendStyle}>
        <strong>Légende :</strong>
        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>🔴 Incontournable</span>
        <span style={{ color: '#f97316', fontWeight: 'bold' }}>🟠 Remarquable</span>
        <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>🔵 Suggéré</span>
      </div>

      <div style={{ height: "70vh", width: "100%" }} className="mb-8 border rounded-lg bg-gray-100 relative z-0 overflow-hidden shadow-inner"> 
        <div ref={mapRef} className="h-full w-full" />
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-slate-800">Liste complète des sites</h2> 

      <div style={{ overflowX: "auto", width: "100%", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px", backgroundColor: "white" }}> 
          <thead style={{ backgroundColor: "#f1f5f9" }}> 
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
              <tr key={site.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f8fafc" }}> 
                <td style={tableCellStyle}>{i + 1}</td>
                <td style={{ ...tableCellStyle, fontWeight: 'bold' }}>{site.commune}</td> 
                {/* ICI LA CORRECTION : on utilise site.site au lieu de site.description */}
                <td style={tableCellStyle}>{site.site}</td> 
                <td style={{ ...tableCellStyleCenter, color: getThemeColor(site.categorie), fontWeight: 'bold' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    backgroundColor: site.niveau === 1 ? '#fee2e2' : site.niveau === 2 ? '#ffedd5' : '#dbeafe',
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

const legendStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '20px',
  marginBottom: '15px',
  padding: '10px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  backgroundColor: '#f8fafc',
};

const tableHeaderStyle: CSSProperties = { padding: "12px", border: "1px solid #e2e8f0", textAlign: "left", fontSize: "14px", color: "#475569" };
const tableHeaderStyleCenter: CSSProperties = { padding: "12px", border: "1px solid #e2e8f0", textAlign: "center", fontSize: "14px", color: "#475569" };
const tableCellStyle: CSSProperties = { padding: "10px", border: "1px solid #e2e8f0", fontSize: "14px", color: "#1e293b" };
const tableCellStyleCenter: CSSProperties = { padding: "10px", border: "1px solid #e2e8f0", textAlign: "center", fontSize: "14px" };