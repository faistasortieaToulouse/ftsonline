'use client'; 

import { useEffect, useState, useRef, CSSProperties } from "react"; 
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// --- Interface de type ---
interface SiteAriege {
  id: number;
  commune: string;
  description: string;
  niveau: number;
  categorie: 'incontournable' | 'remarquable' | 'suggéré';
  lat: number;
  lng: number;
} 

const ARIÈGE_CENTER: [number, number] = [42.9667, 1.6000];

// --- Gestion des couleurs ---
const getMarkerColor = (categorie: SiteAriege['categorie']): string => {
  switch (categorie) {
    case 'incontournable': return '#ef4444'; // Rouge
    case 'remarquable':    return '#f97316'; // Orange
    case 'suggéré':       return '#3b82f6'; // Bleu
    default:               return '#3b82f6';
  }
};

const getLabelColor = (categorie: SiteAriege['categorie']): string => {
  return (categorie === 'remarquable') ? 'white' : 'yellow';
};

export default function AriegeMapPage() { 
  const [sitesData, setSitesData] = useState<SiteAriege[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Refs pour gérer Leaflet manuellement
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [L, setL] = useState<any>(null);

  // 1. Fetch des données
  useEffect(() => {
    async function fetchSites() {
      try {
        const response = await fetch('/api/ariege');
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        let data: SiteAriege[] = await response.json();
        data.sort((a, b) => a.commune.localeCompare(b.commune, 'fr', { sensitivity: 'base' }));
        setSitesData(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des sites:", error);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchSites();
  }, []);

  // 2. Initialisation de la carte (une seule fois)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData) return;

    const initMap = async () => {
      const Leaflet = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      setL(Leaflet);

      if (mapInstance.current) return; // Sécurité anti-double-initialisation

      // Création de l'instance
      mapInstance.current = Leaflet.map(mapRef.current).setView(ARIÈGE_CENTER, 9);

      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);
    };

    initMap();

    // NETTOYAGE : Détruit la carte quand on quitte la page ou qu'on recharge
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isLoadingData]);

  // 3. Ajout des marqueurs quand la carte ET les données sont prêtes
  useEffect(() => {
    if (!L || !mapInstance.current || sitesData.length === 0) return;

    sitesData.forEach((site, i) => {
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background-color: ${getMarkerColor(site.categorie)};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 2px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${getLabelColor(site.categorie)};
            font-weight: bold;
            font-size: 12px;
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
  }, [L, sitesData]);

  return ( 
    <div className="p-4 max-w-7xl mx-auto"> 
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-6">🏔️ Sites Touristiques en Ariège</h1> 

      <p className="font-semibold text-lg mb-4 text-slate-700">
        Statut : {isLoadingData ? 'Chargement des données...' : `${sitesData.length} sites chargés.`}
      </p>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', flexWrap: 'wrap', backgroundColor: 'white' }}>
        <strong>Légende :</strong>
        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>🔴 Incontournable</span>
        <span style={{ color: '#f97316', fontWeight: 'bold' }}>🟠 Remarquable</span>
        <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>🔵 Suggéré</span>
      </div>

      {/* CONTENEUR DE LA CARTE */}
      <div style={{ height: "70vh", width: "100%" }} className="mb-8 border rounded-lg bg-gray-100 relative z-0 overflow-hidden shadow-inner"> 
        <div ref={mapRef} className="h-full w-full" />
        {isLoadingData && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <p className="animate-pulse">Chargement de la carte...</p>
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
              <th style={tableHeaderStyle}>Niveau</th> 
              <th style={tableHeaderStyle}>Catégorie</th> 
            </tr> 
          </thead> 
          <tbody> 
            {sitesData.map((site, i) => ( 
              <tr key={site.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f8fafc" }}> 
                <td style={tableCellStyle}>{i + 1}</td>
                <td style={tableCellStyle}>{site.commune}</td> 
                <td style={tableCellStyle}>{site.description}</td> 
                <td style={{ ...tableCellStyleCenter, color: getMarkerColor(site.categorie), fontWeight: 'bold' }}>
                  {site.niveau}
                </td> 
                <td style={{ ...tableCellStyle, color: getMarkerColor(site.categorie), fontWeight: 'bold', textTransform: 'capitalize' }}>
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

const tableHeaderStyle: CSSProperties = { padding: "12px", border: "1px solid #e2e8f0", textAlign: "left", fontSize: "14px", color: "#475569" };
const tableCellStyle: CSSProperties = { padding: "10px", border: "1px solid #e2e8f0", fontSize: "14px" };
const tableCellStyleCenter: CSSProperties = { padding: "10px", border: "1px solid #e2e8f0", textAlign: "center", fontSize: "14px" };