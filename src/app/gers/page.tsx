'use client';

import { useEffect, useState, useRef, CSSProperties } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// --- Interface de type (Identique à Aude) ---
interface SiteGers {
  id: number;
  commune: string;
  description: string;
  niveau: number;
  categorie: 'Incontournable' | 'Remarquable' | 'Suggéré'; 
  lat: number;
  lng: number;
}

const GERS_CENTER: [number, number] = [43.6465, 0.5855];

// --- Couleurs thématiques ---
const getThemeColor = (categorie: SiteGers['categorie']): string => {
  switch (categorie) {
    case 'Incontournable': return '#ef4444'; // Rouge
    case 'Remarquable':    return '#f97316'; // Orange
    case 'Suggéré':        return '#3b82f6'; // Bleu
    default:               return '#3b82f6';
  }
};

const getLabelColor = (categorie: SiteGers['categorie']): string => {
  return (categorie === 'Remarquable') ? 'white' : 'yellow';
};

export default function GersMapPage() {
  const [sitesData, setSitesData] = useState<SiteGers[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Refs pour la gestion manuelle de Leaflet
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // 1. Charger les données API
  useEffect(() => {
    async function fetchSites() {
      try {
        const response = await fetch('/api/gers'); 
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        let data = await response.json();
        
        // Normalisation pour correspondre strictement aux types 'Incontournable' | 'Remarquable' | 'Suggéré'
        const formattedData: SiteGers[] = data.map((item: any) => ({
          ...item,
          categorie: (item.categorie.charAt(0).toUpperCase() + item.categorie.slice(1)) as SiteGers['categorie']
        }));

        formattedData.sort((a, b) => a.commune.localeCompare(b.commune, 'fr', { sensitivity: 'base' }));
        setSitesData(formattedData);
      } catch (error) {
        console.error("Erreur lors de la récupération des sites Gers:", error);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchSites();
  }, []);

  // 2. Initialisation de la carte (Méthode OTAN avec ref)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current).setView(GERS_CENTER, 9);

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
    if (!isReady || !mapInstance.current || sitesData.length === 0) return;

    const addMarkers = async () => {
      const L = (await import('leaflet')).default;

      sitesData.forEach((site, i) => {
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: ${getThemeColor(site.categorie)};
              width: 28px; height: 28px;
              border-radius: 50%; border: 2px solid white;
              display: flex; align-items: center; justify-content: center;
              color: ${getLabelColor(site.categorie)}; font-weight: bold; font-size: 12px;
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
          <div style="font-family: Arial; font-size: 14px; color: black;"> 
            <strong>${i + 1}. ${site.commune}</strong> (${site.categorie})<br/> 
            <b>Description :</b> ${site.description}<br/>
            <b>Niveau :</b> ${site.niveau}
          </div>
        `);
        marker.addTo(mapInstance.current);
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

      <h1 className="text-3xl font-extrabold mb-6">🌻 Sites Touristiques dans le Gers</h1> 

      <p className="font-semibold text-lg mb-4 text-slate-700">
        Statut : {isLoadingData ? 'Chargement...' : `${sitesData.length} sites chargés.`}
      </p>

      <div style={{ display: 'flex', gap: '10px 20px', flexWrap: 'wrap', marginBottom: '15px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: 'white' }}>
        <strong>Légende :</strong>
        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>🔴 Incontournable</span>
        <span style={{ color: '#f97316', fontWeight: 'bold' }}>🟠 Remarquable</span>
        <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>🔵 Suggéré</span>
      </div>

      {/* ZONE CARTE */}
      <div style={{ height: "70vh", width: "100%" }} className="mb-8 border rounded-lg bg-gray-100 relative z-0 overflow-hidden shadow-inner"> 
        <div ref={mapRef} className="h-full w-full" />
        {isLoadingData && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <p className="animate-pulse">Initialisation de la carte...</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-semibold mb-4">Liste complète des sites</h2> 

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
                <td style={tableCellStyle}>{site.commune}</td> 
                <td style={tableCellStyle}>{site.description}</td> 
                <td style={{ ...tableCellStyleCenter, color: getThemeColor(site.categorie), fontWeight: 'bold' }}>
                  {site.niveau}
                </td> 
                <td style={{ ...tableCellStyle, color: getThemeColor(site.categorie), fontWeight: 'bold' }}>
                  {site.categorie}
                </td> 
              </tr> 
            ))} 
          </tbody> 
        </table>
      </div> 
    </div> 
  ); 
}

const tableHeaderStyle: CSSProperties = { padding: "12px", border: "1px solid #e2e8f0", textAlign: "left", fontSize: "14px" };
const tableHeaderStyleCenter: CSSProperties = { padding: "12px", border: "1px solid #e2e8f0", textAlign: "center", fontSize: "14px" };
const tableCellStyle: CSSProperties = { padding: "10px", border: "1px solid #e2e8f0", fontSize: "14px" };
const tableCellStyleCenter: CSSProperties = { padding: "10px", border: "1px solid #e2e8f0", textAlign: "center", fontSize: "14px" };