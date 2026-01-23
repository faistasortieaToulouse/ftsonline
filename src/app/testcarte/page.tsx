'use client'; 

import { useEffect, useState, CSSProperties } from "react"; 
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// --- Interface de type ---
interface SiteAude {
  id: number;
  commune: string;
  description: string;
  niveau: number;
  categorie: 'Incontournable' | 'Remarquable' | 'Suggéré'; 
  lat: number;
  lng: number;
} 

// --- Imports dynamiques pour Leaflet (SSR: false) ---
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

// --- Couleurs thématiques ---
const getThemeColor = (categorie: SiteAude['categorie']): string => {
  switch (categorie) {
    case 'Incontournable': return '#ef4444'; // Rouge
    case 'Remarquable':    return '#f97316'; // Orange
    case 'Suggéré':       return '#3b82f6'; // Bleu
    default:               return '#3b82f6';
  }
};

const getLabelColor = (categorie: SiteAude['categorie']): string => {
  return (categorie === 'Remarquable') ? 'white' : 'yellow';
};

const AUDE_CENTER: [number, number] = [43.21, 2.35];

export default function AudeMapPage() { 
  const [sitesData, setSitesData] = useState<SiteAude[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    // Import de Leaflet pour les icônes
    import("leaflet").then((leaflet) => {
      setL(leaflet);
    });

    async function fetchSites() {
      try {
        const response = await fetch('/api/aude'); 
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        let data: SiteAude[] = await response.json();
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

  const createCustomIcon = (index: number, categorie: SiteAude['categorie']) => {
    if (!L) return null;
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${getThemeColor(categorie)};
          width: 28px; height: 28px;
          border-radius: 50%; border: 2px solid white;
          display: flex; align-items: center; justify-content: center;
          color: ${getLabelColor(categorie)}; font-weight: bold; font-size: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">
          ${index + 1}
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  };

  return ( 
    <div className="p-4 max-w-7xl mx-auto"> 

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-6">🏰 Sites Touristiques dans l'Aude sur la Carte</h1> 

      <p className="font-semibold text-lg mb-4">
        Statut des données : {isLoadingData ? 'Chargement...' : `${sitesData.length} sites chargés.`}
      </p>

      {/* Légende Responsive */}
      <div style={{ display: 'flex', gap: '10px 20px', flexWrap: 'wrap', marginBottom: '15px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <strong>Légende :</strong>
        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>🔴 Incontournable (1)</span>
        <span style={{ color: '#f97316', fontWeight: 'bold' }}>🟠 Remarquable (2)</span>
        <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>🔵 Suggéré (3)</span>
      </div>

      {/* Carte Leaflet */}
      <div style={{ height: "70vh", width: "100%" }} className="mb-8 border rounded-lg bg-gray-100 relative z-0"> 
        {isLoadingData ? (
          <div className="flex items-center justify-center h-full">Chargement de la carte…</div>
        ) : (
          <MapContainer center={AUDE_CENTER} zoom={9} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {sitesData.map((site, i) => {
              const icon = createCustomIcon(i, site.categorie);
              return icon && (
                <Marker key={site.id} position={[site.lat, site.lng]} icon={icon}>
                  <Popup>
                    <div style={{ fontFamily: 'Arial', fontSize: '14px' }}> 
                      <strong>{i + 1}. {site.commune}</strong> ({site.categorie})<br/> 
                      <b>Description :</b> {site.description}<br/>
                      <b>Niveau :</b> {site.niveau}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>

      <h2 className="text-2xl font-semibold mb-4">Liste complète des sites ({sitesData.length} marqueurs)</h2> 

      {/* Tableau Responsive */}
      <div style={{ overflowX: "auto", width: "100%", borderRadius: "8px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px", minWidth: "700px" }}> 
          <thead style={{ backgroundColor: "#e0e0e0" }}> 
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
              <tr key={site.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f9f9f9" }}> 
                <td style={tableCellStyle}>{i + 1}</td>
                <td style={tableCellStyle}>{site.commune}</td> 
                <td style={tableCellStyle}>{site.description}</td> 
                {/* Niveau avec couleur */}
                <td style={{ ...tableCellStyleCenter, color: getThemeColor(site.categorie), fontWeight: 'bold' }}>
                  {site.niveau}
                </td> 
                {/* Catégorie avec couleur */}
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

// Styles table
const tableHeaderStyle: CSSProperties = { padding: "10px", border: "1px solid #ccc", textAlign: "left" };
const tableHeaderStyleCenter: CSSProperties = { padding: "10px", border: "1px solid #ccc", textAlign: "center" };
const tableCellStyle: CSSProperties = { padding: "8px", border: "1px solid #ddd" };
const tableCellStyleCenter: CSSProperties = { padding: "8px", border: "1px solid #ddd", textAlign: "center" };
