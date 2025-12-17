'use client';

import { useEffect, useRef, useState, CSSProperties } from "react";
import Script from "next/script";

// --- Interface de type ---
interface SiteHerault {
  id: number;
  commune: string;
  description: string;
  niveau: number;
  categorie: 'incontournable' | 'remarquable' | 'suggéré';
  lat: number;
  lng: number;
}

// --- Fonctions utilitaires pour le style des marqueurs ---
const getMarkerIcon = (categorie: SiteHerault['categorie']): string => {
  switch (categorie) {
    case 'incontournable': return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
    case 'remarquable':    return 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png';
    case 'suggéré':       return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
    default:               return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
  }
};

const getLabelColor = (categorie: SiteHerault['categorie']): string => {
  return categorie === 'remarquable' ? 'white' : 'yellow';
};

// Coordonnées pour centrer la carte sur l'Hérault (Béziers)
const HERAULT_CENTER = { lat: 43.3442, lng: 3.2158 };

export default function HeraultMapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [sitesData, setSitesData] = useState<SiteHerault[]>([]);
  const [markersCount, setMarkersCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // ---- 1. Récupération des données ----
  useEffect(() => {
    async function fetchSites() {
      try {
        const response = await fetch('/api/herault');
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        
        const data: SiteHerault[] = await response.json();
        setSitesData(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des sites de l'Hérault:", error);
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
      zoom: 9,
      center: HERAULT_CENTER,
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
          color: getLabelColor(site.categorie),
          fontWeight: 'bold' as const
        },
        icon: getMarkerIcon(site.categorie)
      });

      const info = new google.maps.InfoWindow({
        content: `
          <div style="font-family: Arial; font-size: 14px; color: #333; min-width: 200px;"> 
            <strong style="font-size: 16px;">${count}. ${site.commune}</strong><br/>
            <span style="color: #666; font-style: italic;">${site.categorie}</span><br/><br/>
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

      {/* Google Maps API */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <h1 className="text-3xl font-extrabold mb-2 text-blue-900">🌊 Patrimoine de l'Hérault</h1>
      <h2 className="text-xl text-gray-600 mb-6 font-medium">De la mer aux montagnes de l'Espinouse</h2>

      <p className="font-semibold text-lg mb-4">
        Statut : {isLoadingData ? 'Chargement des données...' : `${sitesData.length} sites répertoriés.`}
      </p>

      {/* Légende */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '15px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
        <strong className="text-slate-700">Légende :</strong>
        <span style={{ color: '#dc2626', fontWeight: 'bold' }}>🔴 Incontournable (Nv 1)</span>
        <span style={{ color: '#ea580c', fontWeight: 'bold' }}>🟠 Remarquable (Nv 2)</span>
        <span style={{ color: '#2563eb', fontWeight: 'bold' }}>🔵 Suggéré (Nv 3)</span>
      </div>

      {/* Carte */}
      <div
        ref={mapRef}
        style={{ height: "65vh", width: "100%" }}
        className="mb-8 border rounded-xl bg-gray-100 flex items-center justify-center shadow-lg overflow-hidden"
      >
        {(!isReady || isLoadingData) && <p className="animate-pulse text-gray-500">Initialisation de la carte héraultaise…</p>}
        {isReady && sitesData.length === 0 && !isLoadingData && <p>Aucune donnée à afficher pour ce département.</p>}
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold p-4 border-b">Détails des sites touristiques ({markersCount})</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                <td style={{ ...tableCellStyle, fontWeight: 'bold' }}>{site.commune}</td>
                <td style={tableCellStyle}>{site.description}</td>
                <td style={tableCellStyleCenter}>
                   <span style={{ 
                     padding: '2px 8px', 
                     borderRadius: '10px', 
                     fontSize: '0.85em',
                     fontWeight: 'bold',
                     backgroundColor: site.niveau === 1 ? '#fee2e2' : site.niveau === 2 ? '#ffedd5' : '#dbeafe',
                     color: site.niveau === 1 ? '#dc2626' : site.niveau === 2 ? '#ea580c' : '#2563eb'
                   }}>
                     {site.niveau}
                   </span>
                </td>
                <td style={tableCellStyle}>
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

// Styles table
const tableHeaderStyle: CSSProperties = { padding: "12px", borderBottom: "2px solid #e2e8f0", textAlign: "left", color: "#475569" };
const tableCellStyle: CSSProperties = { padding: "10px", borderBottom: "1px solid #f1f5f9", color: "#334155" };
const tableCellStyleCenter: CSSProperties = { padding: "10px", borderBottom: "1px solid #f1f5f9", textAlign: "center" };