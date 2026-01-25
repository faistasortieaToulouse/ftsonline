'use client'; 

import { useEffect, useRef, useState, CSSProperties } from "react"; 
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Import du type mis à jour depuis la route API
import type { SitePatrimoine31 } from '../api/patrimoine31/route'; 

type Site = SitePatrimoine31;

// Coordonnées pour centrer la carte sur la zone Est de la Haute-Garonne
const HAUTE_GARONNE_CENTER: [number, number] = [43.73, 1.55]; 

export default function Patrimoine31MapPage() { 
  const mapRef = useRef<HTMLDivElement | null>(null); 
  const mapInstance = useRef<any>(null); 
  const markersLayer = useRef<any>(null);

  const [sitesData, setSitesData] = useState<Site[]>([]);
  const [isMapReady, setIsMapReady] = useState(false); 
  const [isLoadingData, setIsLoadingData] = useState(true);

  // ---- 1. Récupération des données (API) ----
  useEffect(() => {
    async function fetchSites() {
      try {
        const response = await fetch('/api/patrimoine31'); 
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data: Site[] = await response.json();
        setSitesData(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des sites:", error);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchSites();
  }, []);

  // ---- 2. Initialisation de la carte (Méthode OTAN) ----
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || sitesData.length === 0) return;

    const initLeaflet = async () => {
      const L = (await import('leaflet')).default;

      // Correction des icônes par défaut de Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });

      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current!).setView(HAUTE_GARONNE_CENTER, 11);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance.current);

        markersLayer.current = L.layerGroup().addTo(mapInstance.current);
        setIsMapReady(true);
      }

      // Nettoyage et ajout des marqueurs
      markersLayer.current.clearLayers();

      sitesData.forEach((site, i) => {
        const count = i + 1;

        // Création d'une icône personnalisée avec numéro (style Google Maps)
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: #1d4ed8;
              width: 26px; height: 26px;
              border-radius: 50%; border: 2px solid white;
              display: flex; align-items: center; justify-content: center;
              color: white; font-weight: bold; font-size: 11px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              ${count}
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const popupContent = `
          <div style="font-family: Arial; font-size: 13px; min-width: 150px;"> 
            <strong style="color: #1d4ed8;">${count}. ${site.commune}</strong><br/> 
            <p style="margin: 5px 0;"><b>Description :</b> ${site.description}</p>
            <p style="margin: 2px 0;"><b>Secteur :</b> ${site.secteur}</p>
            <p style="margin: 2px 0;"><b>Distance :</b> ${site.distanceKm} km</p>
          </div>
        `;

        L.marker([site.lat, site.lng], { icon: customIcon })
          .bindPopup(popupContent)
          .addTo(markersLayer.current);
      });
    };

    initLeaflet();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [sitesData]);

  return ( 
    <div className="p-4 max-w-7xl mx-auto">

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav> 

      <h1 className="text-3xl font-extrabold mb-6">🏰 Sites de Patrimoine en Haute-Garonne (31)</h1> 

      <p className="font-semibold text-lg mb-4">
        Statut des données : {isLoadingData ? 'Chargement...' : `${sitesData.length} sites chargés.`}
      </p>

      {/* Carte Leaflet */}
      <div 
        ref={mapRef} 
        style={{ height: "70vh", width: "100%", zIndex: 0 }} 
        className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center relative"
      > 
        {(!isMapReady || isLoadingData) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <p className="animate-pulse text-blue-600 font-medium">Chargement de la carte et des données…</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-semibold mb-4">Liste complète des sites ({sitesData.length} marqueurs)</h2> 

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}> 
        <thead style={{ backgroundColor: "#e0e0e0" }}> 
          <tr> 
            <th style={tableHeaderStyle}>#</th>
            <th style={tableHeaderStyle}>Commune</th> 
            <th style={tableHeaderStyle}>Monument ou site emblématique</th> 
            <th style={tableHeaderStyleCenter}>Distance (km)</th>
            <th style={tableHeaderStyle}>Secteur</th> 
          </tr> 
        </thead> 
        <tbody>
          {sitesData.map((site, i) => ( 
            <tr key={site.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f9f9f9" }}> 
              <td style={tableCellStyle}>{i + 1}</td>
              <td style={tableCellStyle}>{site.commune}</td> 
              <td style={tableCellStyle}>{site.description}</td> 
              <td style={tableCellStyleCenter}>{site.distanceKm}</td> 
              <td style={tableCellStyle}>{site.secteur}</td> 
            </tr> 
          ))}
        </tbody>
      </table> 
    </div> 
  ); 
}

// Styles table
const tableHeaderStyle: CSSProperties = { padding: "10px", border: "1px solid #ccc", textAlign: "left" };
const tableHeaderStyleCenter: CSSProperties = { padding: "10px", border: "1px solid #ccc", textAlign: "center" };

const tableCellStyle: CSSProperties = { padding: "8px", border: "1px solid #ddd" };
const tableCellStyleCenter: CSSProperties = { padding: "8px", border: "1px solid #ddd", textAlign: "center" };