// src/app/aveyron/page.tsx
'use client'; 

import { useEffect, useRef, useState, CSSProperties } from "react"; 
import Script from "next/script"; 

// Import du type directement depuis la route API Aveyron (Bonne pratique)
import type { SiteAveyron } from '../api/aveyron/route'; 

// --- Fonction pour obtenir l’icône du marqueur ---
// Les valeurs 0, 1, 2 correspondent aux couleurs par défaut des marqueurs Google Maps :
// 0: Rouge (Incontournable)
// 1: Orange (Remarquable)
// 2: Bleu (Suggéré)
const getMarkerColor = (categorie: SiteAveyron['categorie']): string => {
  switch (categorie) {
    case 'incontournable':
      return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'; // Rouge
    case 'remarquable':
      return 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png'; // Orange
    case 'suggéré':
    default:
      return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'; // Bleu
  }
};

// --- Fonction pour obtenir la couleur du numéro sur le marqueur ---
const getLabelColor = (categorie: SiteAveyron['categorie']): string => {
  switch (categorie) {
    case 'incontournable': 
      return 'yellow'; // Contraste bien sur le rouge
    case 'remarquable':
      return 'white'; // Contraste bien sur l'orange
    case 'suggéré': 
    default:
      return 'yellow'; // Contraste bien sur le bleu
  }
};

// Coordonnées pour centrer la carte sur l'Aveyron (Rodez ou centre géographique)
// J'utilise le centre géographique approximatif de l'Aveyron
const AVEYRON_CENTER = { lat: 44.35, lng: 2.60 }; 

export default function AveyronMapPage() { 
  const mapRef = useRef<HTMLDivElement | null>(null); 
  const mapInstance = useRef<google.maps.Map | null>(null); 
  const [sitesData, setSitesData] = useState<SiteAveyron[]>([]);
  const [markersCount, setMarkersCount] = useState(0); 
  const [isReady, setIsReady] = useState(false); 
  const [isLoadingData, setIsLoadingData] = useState(true);

  // ---- 1. Récupération des données ----
  useEffect(() => {
    async function fetchSites() {
      try {
        // Changement de la route API pour l'Aveyron
        const response = await fetch('/api/aveyron'); 
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        
        // Utilisation du type SiteAveyron pour les données
        const data: SiteAveyron[] = await response.json();
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
    // Vérification que tout est chargé et prêt
    if (!isReady || !mapRef.current || !window.google?.maps || sitesData.length === 0) return;

    // Initialisation de la carte, centrée sur l'Aveyron
    const map = new google.maps.Map(mapRef.current, { 
      zoom: 9, 
      center: AVEYRON_CENTER, 
      gestureHandling: "greedy", 
    }); 

    mapInstance.current = map; 
    let count = 0;

    // Ajout des marqueurs
    sitesData.forEach((site) => { 
      count++; 

      const position = new google.maps.LatLng(site.lat, site.lng);

      const marker = new google.maps.Marker({ 
        map: mapInstance.current, 
        position, 
        title: `${site.commune} - ${site.description}`,
        label: {
          text: String(count),
          color: getLabelColor(site.categorie),
          fontWeight: 'bold' as const
        },
        icon: getMarkerColor(site.categorie)
      });

      // Info-bulle affichée au clic
      const info = new google.maps.InfoWindow({ 
        content: `
          <div style="font-family: Arial; font-size: 14px;"> 
            <strong>${count}. ${site.commune}</strong> (${site.categorie})<br/> 
            <b>Description :</b> ${site.description}<br/>
            <b>Niveau :</b> ${site.niveau}
          </div>
        `,
      });

      marker.addListener("click", () => 
        info.open({ anchor: marker, map: mapInstance.current! })
      );
    });

    setMarkersCount(count); 
  }, [isReady, sitesData]);

  return ( 
    <div className="p-4 max-w-7xl mx-auto"> 

      {/* Google Maps API (Nécessite la clé API dans .env.local) */}
      <Script 
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`} 
        strategy="afterInteractive" 
        onLoad={() => setIsReady(true)} 
      /> 

      <h1 className="text-3xl font-extrabold mb-6">🗺️ Sites Touristiques en Aveyron sur la Carte</h1> 

      <p className="font-semibold text-lg mb-4">
        Statut des données : {isLoadingData ? 'Chargement...' : `${sitesData.length} sites chargés.`}
      </p>

      {/* Légende */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', flexWrap: 'wrap' }}>
        <strong>Légende des marqueurs :</strong>
        <span style={{ color: '#E91E63', fontWeight: 'bold' }}>🔴 Incontournable (1)</span>
        <span style={{ color: '#FF9800', fontWeight: 'bold' }}>🟠 Remarquable (2)</span>
        <span style={{ color: '#2196F3', fontWeight: 'bold' }}>🔵 Suggéré (3)</span>
        <span style={{ color: '#777', fontSize: '0.8rem' }}>(Les couleurs réelles des marqueurs Google Maps sont : 0=Rouge, 1=Orange, 2=Bleu)</span>
      </div>

      {/* Carte */}
      <div 
        ref={mapRef} 
        style={{ height: "70vh", width: "100%" }} 
        className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center"
      > 
        {(!isReady || isLoadingData) && <p>Chargement de la carte et des données…</p>} 
        {isReady && sitesData.length === 0 && !isLoadingData && <p>Aucune donnée de site à afficher. (Vérifiez la route API /api/aveyron)</p>}
      </div>

      {/* Tableau */}
      <h2 className="text-2xl font-semibold mb-4">Liste complète des sites ({markersCount} marqueurs)</h2> 

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}> 
        <thead style={{ backgroundColor: "#e0e0e0" }}> 
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
            <tr key={site.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f9f9f9" }}> 
              <td style={tableCellStyle}>{i + 1}</td>
              <td style={tableCellStyle}>{site.commune}</td> 
              <td style={tableCellStyle}>{site.description}</td> 
              <td style={tableCellStyleCenter}>{site.niveau}</td> 
              <td style={tableCellStyle}>{site.categorie}</td> 
            </tr> 
          ))} 
        </tbody> 
      </table> 
    </div> 
  ); 
}

// Styles table
const tableHeaderStyle: CSSProperties = { padding: "10px", border: "1px solid #ccc", textAlign: "left" };
const tableCellStyle: CSSProperties = { padding: "8px", border: "1px solid #ddd" };
const tableCellStyleCenter: CSSProperties = { padding: "8px", border: "1px solid #ddd", textAlign: "center" };
