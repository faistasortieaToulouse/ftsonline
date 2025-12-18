// src/app/pyreneesorientales/page.tsx
'use client';

import { useEffect, useRef, useState, CSSProperties } from "react";
import Script from "next/script";

// --- Interface de type ---
interface SitePO {
  id: number;
  commune: string;
  description: string;
  niveau: number;
  categorie: 'incontournable' | 'remarquable' | 'suggéré';
  lat: number;
  lng: number;
}

// --- Fonctions utilitaires pour le style des marqueurs ---
const getMarkerIcon = (categorie: SitePO['categorie']): string => {
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

const getLabelColor = (categorie: SitePO['categorie']): string => {
  return categorie === 'remarquable' ? 'white' : 'yellow';
};

// --- Centre carte : Pyrénées-Orientales (Perpignan) ---
const PO_CENTER = { lat: 42.6887, lng: 2.8948 };

export default function PyreneesOrientalesMapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  const [sitesData, setSitesData] = useState<SitePO[]>([]);
  const [markersCount, setMarkersCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // ---- 1. Récupération des données ----
  useEffect(() => {
    async function fetchSites() {
      try {
        const response = await fetch('/api/pyreneesorientales');
        if (!response.ok) {
          throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data: SitePO[] = await response.json();
        setSitesData(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des sites PO :", error);
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchSites();
  }, []);

  // ---- 2. Initialisation carte & marqueurs ----
  useEffect(() => {
    if (!isReady || !mapRef.current || !window.google?.maps || sitesData.length === 0) return;

    const map = new google.maps.Map(mapRef.current, {
      zoom: 9,
      center: PO_CENTER,
      gestureHandling: "greedy",
    });

    mapInstance.current = map;
    let count = 0;

    sitesData.forEach(site => {
      count++;
      const position = new google.maps.LatLng(site.lat, site.lng);

      const marker = new google.maps.Marker({
        map,
        position,
        title: `${site.commune} - ${site.description}`,
        label: {
          text: String(count),
          color: getLabelColor(site.categorie),
          fontWeight: 'bold',
        },
        icon: getMarkerIcon(site.categorie),
      });

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
        info.open({ anchor: marker, map })
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

      <h1 className="text-3xl font-extrabold mb-6">
        🌊 Sites touristiques des Pyrénées-Orientales sur la carte
      </h1>

      <p className="font-semibold text-lg mb-4">
        Statut des données : {isLoadingData ? 'Chargement...' : `${sitesData.length} sites chargés.`}
      </p>

      {/* Légende */}
      <div style={legendStyle}>
        <strong>Légende :</strong>
        <span style={{ color: 'red', fontWeight: 'bold' }}>🔴 Incontournable (Niveau 1)</span>
        <span style={{ color: 'orange', fontWeight: 'bold' }}>🟠 Remarquable (Niveau 2)</span>
        <span style={{ color: 'blue', fontWeight: 'bold' }}>🔵 Suggéré (Niveau 3)</span>
      </div>

      {/* Carte */}
      <div
        ref={mapRef}
        style={{ height: "70vh", width: "100%" }}
        className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center shadow-inner"
      >
        {(!isReady || isLoadingData) && <p>Chargement de la carte et des données…</p>}
        {isReady && sitesData.length === 0 && !isLoadingData && <p>Aucune donnée de site à afficher.</p>}
      </div>

      {/* Tableau */}
      <h2 className="text-2xl font-semibold mb-4">
        Liste complète des sites ({markersCount} marqueurs)
      </h2>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead style={{ backgroundColor: "#e0e0e0" }}>
          <tr>
            <th style={th}>#</th>
            <th style={th}>Commune</th>
            <th style={th}>Monument ou site emblématique</th>
            <th style={th}>Niveau</th>
            <th style={th}>Catégorie</th>
          </tr>
        </thead>
        <tbody>
          {sitesData.map((site, i) => (
            <tr key={site.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f9f9f9" }}>
              <td style={td}>{i + 1}</td>
              <td style={td}>{site.commune}</td>
              <td style={td}>{site.description}</td>
              <td style={tdCenter}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '0.85em',
                    fontWeight: 'bold',
                    backgroundColor:
                      site.niveau === 1 ? '#fee2e2' :
                      site.niveau === 2 ? '#ffedd5' : '#dbeafe',
                    color:
                      site.niveau === 1 ? '#dc2626' :
                      site.niveau === 2 ? '#ea580c' : '#2563eb',
                  }}
                >
                  {site.niveau}
                </span>
              </td>
              <td style={td}>{site.categorie}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Styles ---
const legendStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '20px',
  marginBottom: '15px',
  padding: '10px',
  border: '1px solid #ccc',
  borderRadius: '5px',
  backgroundColor: '#fdfdfd',
};

const th: CSSProperties = { padding: "10px", border: "1px solid #ccc", textAlign: "left" };
const td: CSSProperties = { padding: "8px", border: "1px solid #ddd" };
const tdCenter: CSSProperties = { padding: "8px", border: "1px solid #ddd", textAlign: "center" };
