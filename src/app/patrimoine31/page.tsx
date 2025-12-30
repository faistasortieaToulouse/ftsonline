// src/app/patrimoine31/page.tsx
'use client'; 

import { useEffect, useRef, useState, CSSProperties } from "react"; 
import Script from "next/script"; 

// Import du type mis à jour depuis la route API
import type { SitePatrimoine31 } from '../api/patrimoine31/route'; 

// Définition du type pour l'usage local
type Site = SitePatrimoine31;

// Coordonnées pour centrer la carte sur la zone Est de la Haute-Garonne
const HAUTE_GARONNE_CENTER = { lat: 43.73, lng: 1.55 }; 

export default function Patrimoine31MapPage() { 
  const mapRef = useRef<HTMLDivElement | null>(null); 
  const mapInstance = useRef<google.maps.Map | null>(null); 
  const [sitesData, setSitesData] = useState<Site[]>([]);
  const [markersCount, setMarkersCount] = useState(0); 
  const [isReady, setIsReady] = useState(false); 
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

  // ---- 2. Initialisation de la carte & marqueurs ----
  useEffect(() => { 
    if (!isReady || !mapRef.current || !window.google?.maps || sitesData.length === 0) return;

    const map = new google.maps.Map(mapRef.current, { 
      zoom: 11, // Zoom ajusté pour la petite zone
      center: HAUTE_GARONNE_CENTER, 
      gestureHandling: "greedy", 
    }); 

    mapInstance.current = map; 
    let count = 0;

    sitesData.forEach((site) => { 
      count++; 

      const position = new google.maps.LatLng(site.lat, site.lng);

      const marker = new google.maps.Marker({ 
        map: mapInstance.current, 
        position, 
        title: `${site.commune} - ${site.description}`,
        label: {
          text: String(count),
          color: 'white', 
          fontWeight: 'bold' as const
        },
      });

      // Info-bulle affichée au clic - Nettoyage des retours à la ligne du template string
      const info = new google.maps.InfoWindow({ 
        content: `
          <div style="font-family: Arial; font-size: 14px;"> 
            <strong>${count}. ${site.commune}</strong><br/> 
            <b>Description :</b> ${site.description}<br/>
            <b>Secteur :</b> ${site.secteur}<br/>
            <b>Distance de Toulouse :</b> ${site.distanceKm} km
          </div>
        `.trim(), // Utilisation de .trim() pour supprimer les espaces/retours à la ligne inutiles
      });

      marker.addListener("click", () => 
        info.open({ anchor: marker, map: mapInstance.current! })
      );
    });

    setMarkersCount(count); 
  }, [isReady, sitesData]);

  return ( 
    <div className="p-4 max-w-7xl mx-auto"> 

      {/* Google Maps API (Vérifiez la clé API dans .env.local) */}
      <Script 
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`} 
        strategy="afterInteractive" 
        onLoad={() => setIsReady(true)} 
      /> 

      <h1 className="text-3xl font-extrabold mb-6">🏰 Sites de Patrimoine en Haute-Garonne (31)</h1> 

      <p className="font-semibold text-lg mb-4">
        Statut des données : {isLoadingData ? 'Chargement...' : `${sitesData.length} sites chargés.`}
      </p>

      {/* Carte */}
      <div 
        ref={mapRef} 
        style={{ height: "70vh", width: "100%" }} 
        className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center"
      > 
        {(!isReady || isLoadingData) && <p>Chargement de la carte et des données…</p>} 
        {isReady && sitesData.length === 0 && !isLoadingData && <p>Aucune donnée de site à afficher. (Vérifiez la route API /api/patrimoine31)</p>}
      </div>
      

{/* Tableau */}
      <h2 className="text-2xl font-semibold mb-4">Liste complète des sites ({markersCount} marqueurs)</h2> 

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
        
        {/* CORRECTION HYDRATATION FINALE : Suppression de tous les retours à la ligne autour du map dans tbody */}
        <tbody>{sitesData.map((site, i) => ( 
            <tr key={site.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f9f9f9" }}> 
              <td style={tableCellStyle}>{i + 1}</td>
              <td style={tableCellStyle}>{site.commune}</td> 
              <td style={tableCellStyle}>{site.description}</td> 
              <td style={tableCellStyleCenter}>{site.distanceKm}</td> 
              <td style={tableCellStyle}>{site.secteur}</td> 
            </tr> 
          ))}</tbody>
      </table> 
    </div> 
  ); 
}

// Styles table
const tableHeaderStyle: CSSProperties = { padding: "10px", border: "1px solid #ccc", textAlign: "left" };
const tableHeaderStyleCenter: CSSProperties = { padding: "10px", border: "1px solid #ccc", textAlign: "center" };

const tableCellStyle: CSSProperties = { padding: "8px", border: "1px solid #ddd" };
const tableCellStyleCenter: CSSProperties = { padding: "8px", border: "1px solid #ddd", textAlign: "center" };