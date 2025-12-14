// src/app/montcirque/page.tsx
'use client'; 

import { useEffect, useRef, useState, CSSProperties } from "react"; 
import Script from "next/script"; 
import type { MontCirquePOI } from '../api/montcirque/route'; 

// 🚨 La déclaration globale reste NECESSAIRE pour TypeScript (résout l'erreur de compilation)
declare global {
    interface Window {
        google: typeof google;
    }
}

// Définition du type
type POI = MontCirquePOI;

// COORDONNÉES CENTRALE
const OCCITANIE_CENTER = { lat: 43.6, lng: 2.5 }; 

// Styles table
const tableHeaderStyle: CSSProperties = { padding: "10px", border: "1px solid #ccc", textAlign: "left" };
const tableHeaderStyleCenter: CSSProperties = { padding: "10px", border: "1px solid #ccc", textAlign: "center" };

const tableCellStyle: CSSProperties = { padding: "8px", border: "1px solid #ddd" };
const tableCellStyleCenter: CSSProperties = { padding: "8px", border: "1px solid #ddd", textAlign: "center" };


export default function MontCirqueMapPage() { 
  const mapRef = useRef<HTMLDivElement | null>(null); 
  const mapInstance = useRef<google.maps.Map | null>(null); 
  const [pointsData, setPointsData] = useState<POI[]>([]);
  const [markersCount, setMarkersCount] = useState(0); 
  const [isReady, setIsReady] = useState(false); 
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fonction utilitaire pour déterminer la chaîne de caractère du type
  const getPointTypeDisplay = (type: POI['type'], simplified: boolean = false): string => {
    if (simplified) { 
        switch (type) {
            case 'pic':
                return 'Pic';
            case 'cirque':
                return 'Cirque';
            case 'autre': 
                return 'Massif/Plateau';
            default:
                return 'Non défini';
        }
    } else { 
        switch (type) {
            case 'pic':
                return 'Pic / Montagne';
            case 'cirque':
                return 'Cirque';
            case 'autre': 
                return 'Massif / Plateau';
            default:
                return 'Non défini';
        }
    }
  };

  // ---- 1. Récupération des données (API) ----
  useEffect(() => {
    async function fetchPoints() {
      try {
        const response = await fetch('/api/montcirque'); 
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        
        const data: POI[] = await response.json();
        setPointsData(data);

      } catch (error) {
        console.error("Erreur lors de la récupération des points:", error);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchPoints();
  }, []);

  // ---- 2. Initialisation de la carte & marqueurs ----
  useEffect(() => { 
    if (!isReady || !mapRef.current || !window.google?.maps || pointsData.length === 0) return;

    const COLOR_MAP: Record<POI['type'], string> = {
        'pic': '#E74C3C', // Rouge
        'cirque': '#3498DB', // Bleu
        'autre': '#27AE60' // Vert
    };
    // Taille constante pour les icônes (si les IDs sont longs, nous devons adapter cette taille)
    const ICON_SIZE = 35; 

    const map = new google.maps.Map(mapRef.current, { 
      zoom: 8,
      center: OCCITANIE_CENTER,
      gestureHandling: "greedy", 
    }); 

    mapInstance.current = map; 
    const infoWindow = new google.maps.InfoWindow();
    let count = 0;

    // FONCTION POUR CRÉER LE SVG DE L'ICÔNE NUMÉROTÉE (NOUVELLE APPROCHE)
    const createNumberedSvg = (id: string, color: string): string => {
        // Ajuster la taille de la police en fonction de la longueur de l'ID
        const fontSize = id.length > 2 ? '10px' : '14px';
        const rectWidth = ICON_SIZE * 0.8; // Base rectangulaire
        const rectHeight = ICON_SIZE * 0.6;
        
        const svg = `
            <svg width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 ${ICON_SIZE} ${ICON_SIZE}" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="${rectWidth}" height="${rectHeight}" rx="5" fill="${color}" stroke="white" stroke-width="2"/>
                <text x="${rectWidth / 2}" y="${rectHeight / 2}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">
                    ${id}
                </text>
            </svg>
        `;
        // Encodage Base64
        return 'data:image/svg+xml;base64,' + btoa(svg);
    };


    pointsData.forEach((point, index) => { 
      count++; 
      
      // LOGIQUE POUR RÉCUPÉRER L'ID
      const rawId = point.id;
      const markerNumber = (rawId && !isNaN(Number(rawId))) 
        ? String(rawId) 
        : String(index + 1); // Fallback si l'ID n'est pas bon
        
      const pointColor = COLOR_MAP[point.type] || '#7F8C8D'; 

      const position = new google.maps.LatLng(point.lat, point.lng);
      
      // ***************************************************************
      // ICÔNE CRÉÉE AVEC LE SVG NUMÉROTÉ EN BASE64
      // ***************************************************************
      const numberedIcon: google.maps.Icon = {
        url: createNumberedSvg(markerNumber, pointColor),
        scaledSize: new window.google.maps.Size(ICON_SIZE, ICON_SIZE),
        // Le point d'ancrage doit être au centre de la base de l'icône pour pointer correctement.
        anchor: new window.google.maps.Point(ICON_SIZE / 2, ICON_SIZE), 
      };

      const marker = new google.maps.Marker({ 
        map: mapInstance.current, 
        position, 
        title: `${markerNumber}. ${point.name} - ${point.massif}`, 
        icon: numberedIcon, // Utilisation de l'icône SVG
      });

      // Récupération de l'affichage complet du type pour l'info-bulle
      const typeDisplay = getPointTypeDisplay(point.type, false);

      // Contenu de l'info-bulle (avec le numéro basé sur l'ID)
      const altitudeDisplay = point.altitude ? `<b>Altitude :</b> ${point.altitude} m<br/>` : '';
      const contentString = `
        <div style="font-family: Arial; font-size: 14px;"> 
          <strong>${markerNumber}. ${point.name} (${point.department})</strong><br/> 
          <b>Massif :</b> ${point.massif}<br/>
          <b>Type :</b> ${typeDisplay}<br/>
          ${altitudeDisplay}
          <b>Description :</b> ${point.description}
        </div>
      `.trim();

      marker.addListener("click", () => {
        infoWindow.setContent(contentString);
        infoWindow.open({ anchor: marker, map: mapInstance.current! });
      });
    });

    setMarkersCount(count); 
  }, [isReady, pointsData]);

  // Les styles pour la légende (Couleurs des icônes SVG/Base64)
  const LEGEND_COLORS = {
    'pic': '#E74C3C', 
    'cirque': '#3498DB',
    'autre': '#27AE60',
  };


  return ( 
    <div className="p-4 max-w-7xl mx-auto"> 

      {/* Google Maps API */}
      <Script 
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`} 
        strategy="afterInteractive" 
        onLoad={() => setIsReady(true)} 
      /> 

      <h1 className="text-3xl font-extrabold mb-6">⛰️ Carte des Pics, Cirques et Massifs d'Occitanie</h1> 

      <p className="font-semibold text-lg mb-4">
        Statut des données : {isLoadingData ? 'Chargement...' : `${pointsData.length} points chargés.`}
      </p>

      {/* Légende (MISE À JOUR pour refléter les icônes colorées) */}
      <div className="flex space-x-6 mb-4 text-sm">
          <p className="flex items-center">
              <span style={{ 
                  display: 'inline-block', 
                  width: '14px', 
                  height: '14px', 
                  backgroundColor: LEGEND_COLORS.pic,
                  marginRight: '6px',
                  // Simuler l'apparence des icônes rectangulaires pour la légende
                  border: '1px solid white'
              }}/>
              Pic / Montagne (Rouge)
          </p>
          <p className="flex items-center">
              <span style={{ 
                  display: 'inline-block', 
                  width: '14px', 
                  height: '14px', 
                  backgroundColor: LEGEND_COLORS.cirque,
                  marginRight: '6px',
                  border: '1px solid white'
              }}/>
              Cirque (Bleu)
          </p>
          <p className="flex items-center">
              <span style={{ 
                  display: 'inline-block', 
                  width: '14px', 
                  height: '14px', 
                  backgroundColor: LEGEND_COLORS.autre,
                  marginRight: '6px',
                  border: '1px solid white'
              }}/>
              Massif / Plateau (Vert)
          </p>
      </div>

      {/* Carte */}
      <div 
        ref={mapRef} 
        style={{ height: "70vh", width: "100%" }} 
        className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center"
      > 
        {(!isReady || isLoadingData) && <p>Chargement de la carte et des données…</p>} 
        {isReady && pointsData.length === 0 && !isLoadingData && <p>Aucune donnée à afficher. (Vérifiez la route API /api/montcirque)</p>}
      </div>
      
      {/* Tableau */}
      <h2 className="text-2xl font-semibold mb-4">Liste des points d'intérêt ({markersCount} marqueurs)</h2> 

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}> 
        <thead style={{ backgroundColor: "#e0e0e0" }}> 
          <tr> 
            <th style={tableHeaderStyle}>ID (Carte)</th>
            <th style={tableHeaderStyle}>Nom du site</th> 
            <th style={tableHeaderStyle}>Type</th> 
            <th style={tableHeaderStyleCenter}>Altitude (m)</th>
            <th style={tableHeaderStyle}>Massif</th> 
            <th style={tableHeaderStyle}>Département</th> 
          </tr> 
        </thead> 
        
        <tbody>{pointsData.map((point, i) => ( 
            <tr key={point.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f9f9f9" }}> 
              <td style={tableCellStyle}>{point.id}</td> 
              <td style={tableCellStyle}>{point.name}</td> 
              
              {/* Utilisation de la fonction getPointTypeDisplay en mode simplifié */}
              <td style={tableCellStyle}>{getPointTypeDisplay(point.type, true)}</td> 
              
              <td style={tableCellStyleCenter}>{point.altitude ? `${point.altitude} m` : '-'}</td> 
              <td style={tableCellStyle}>{point.massif}</td> 
              <td style={tableCellStyle}>{point.department}</td> 
            </tr> 
          ))}</tbody>
      </table> 
    </div> 
  ); 
}