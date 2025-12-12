// src/app/ariege/page.tsx
'use client'; 

import { useEffect, useRef, useState, CSSProperties } from "react"; 
import Script from "next/script"; 

// --- Interface de type (doit correspondre à route.ts) ---
interface SiteAriege {
  id: number;
  commune: string;
  description: string;
  niveau: number;
  categorie: 'incontournable' | 'remarquable' | 'suggéré';
  lat: number;
  lng: number;
} 

// --- Fonction pour obtenir la couleur/icône du marqueur ---
const getMarkerColor = (categorie: SiteAriege['categorie']): string => {
    // Les icônes Google Maps sont basées sur une image générique de couleur.
    // 0: rouge (incontournable)
    // 1: orange (remarquable)
    // 2: bleu (suggéré)
    switch (categorie) {
        case 'incontournable':
            return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
        case 'remarquable':
            return 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png';
        case 'suggéré':
        default:
            return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
    }
};

// Coordonnées pour centrer la carte sur l'Ariège (Foix)
const ARIÈGE_CENTER = { lat: 42.9667, lng: 1.6000 };

export default function AriegeMapPage() { 
  const mapRef = useRef<HTMLDivElement | null>(null); 
  const mapInstance = useRef<google.maps.Map | null>(null); 
  const [sitesData, setSitesData] = useState<SiteAriege[]>([]);
  const [markersCount, setMarkersCount] = useState(0); 
  const [isReady, setIsReady] = useState(false); 
  const [isLoadingData, setIsLoadingData] = useState(true);

  // 1. Récupération des données depuis l'API (route.ts)
  useEffect(() => {
    async function fetchSites() {
      try {
        const response = await fetch('/api/ariege');
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data: SiteAriege[] = await response.json();
        setSitesData(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des sites:", error);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchSites();
  }, []);

  // 2. Initialisation de la carte et placement des marqueurs
  useEffect(() => { 
    // Attendre que l'API Google Maps soit chargée ET que les données des sites soient prêtes
    if (!isReady || !mapRef.current || !window.google?.maps || sitesData.length === 0) return; 

    // A. Initialisation de la carte
    const map = new google.maps.Map(mapRef.current, { 
      zoom: 9, 
      center: ARIÈGE_CENTER, 
      gestureHandling: "greedy", 
    }); 
    mapInstance.current = map; 

    let count = 0; 

    // B. Placement des marqueurs
    sitesData.forEach((site) => { 
        count++; 

        const position = new google.maps.LatLng(site.lat, site.lng);

        const marker = new google.maps.Marker({ 
          map: mapInstance.current, 
          position: position, 
          title: site.commune + ' - ' + site.description, 
          // Utiliser l'ID ou le numéro dans la liste comme label
          label: {
            text: String(count),
            color: 'blue',
            fontWeight: 'bold' as const
          }, 
          icon: getMarkerColor(site.categorie) // Utilise l'icône colorée
        }); 

        const info = new google.maps.InfoWindow({ 
          content: ` 
            <div style="font-family: Arial; font-size: 14px;"> 
              <strong>${count}. ${site.commune}</strong> (${site.categorie})<br/> 
              <b>Monument emblématique :</b> ${site.description}<br/>
              <b>Niveau :</b> ${site.niveau}
            </div> 
          `, 
        }); 

        marker.addListener("click", () => info.open({ anchor: marker, map: mapInstance.current! })); 
    }); 

    setMarkersCount(count); 
  }, [isReady, sitesData]); // Dépendance ajoutée : sitesData

  return ( 
    <div className="p-4 max-w-7xl mx-auto"> 
      {/* Chargement de l'API Google Maps */} 
      <Script 
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`} 
        strategy="afterInteractive" 
        onLoad={() => setIsReady(true)} 
      /> 

      <h1 className="text-3xl font-extrabold mb-6">🏔️ Sites Touristiques en Ariège sur la Carte</h1> 
      <p className="font-semibold text-lg mb-4">
        Statut des données : {isLoadingData ? 'Chargement...' : `${sitesData.length} sites chargés.`}
      </p>

      {/* Légende */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <strong>Légende :</strong>
        <span style={{ color: 'red', fontWeight: 'bold' }}>🔴 Incontournable (1)</span>
        <span style={{ color: 'orange', fontWeight: 'bold' }}>🟠 Remarquable (2)</span>
        <span style={{ color: 'blue', fontWeight: 'bold' }}>🔵 Suggéré (3)</span>
      </div>
      
      <div 
        ref={mapRef} 
        style={{ height: "70vh", width: "100%" }} 
        className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center" 
      > 
        {(!isReady || isLoadingData) && <p>Chargement de la carte et des données…</p>} 
        {isReady && sitesData.length === 0 && !isLoadingData && <p>Aucune donnée de site à afficher.</p>}
      </div> 

      <h2 className="text-2xl font-semibold mb-4">Liste complète des sites ({markersCount} marqueurs)</h2> 

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}> 
        <thead style={{ backgroundColor: "#e0e0e0" }}> 
          <tr> 
            <th style={tableHeaderStyle}>#</th>
            <th style={tableHeaderStyle}>Commune</th> 
            <th style={tableHeaderStyle}>Description</th> 
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

// Styles pour la table
const tableHeaderStyle: CSSProperties = { padding: "10px", border: "1px solid #ccc", textAlign: "left" };
const tableCellStyle: CSSProperties = { padding: "8px", border: "1px solid #ddd" };
const tableCellStyleCenter: CSSProperties = { padding: "8px", border: "1px solid #ddd", textAlign: "center" };
