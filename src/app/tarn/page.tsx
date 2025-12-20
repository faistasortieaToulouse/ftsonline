'use client';

import { useEffect, useRef, useState, CSSProperties } from "react";
import Script from "next/script";

// --- Interface de type ---
interface SiteTarn {
  id: number;
  commune: string;
  site: string; // Correspond au champ 'site' de votre API Tarn
  niveau: number;
  categorie: 'incontournable' | 'remarquable' | 'suggéré';
  lat: number;
  lng: number;
}

// --- Fonctions utilitaires pour les marqueurs ---
const getMarkerIcon = (categorie: SiteTarn['categorie']): string => {
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

const getLabelColor = (categorie: SiteTarn['categorie']): string => {
  return categorie === 'remarquable' ? 'white' : 'yellow';
};

// --- Centre de la carte : Albi (Tarn) ---
const TARN_CENTER = { lat: 43.9289, lng: 2.1464 };

export default function TarnMapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  const [sitesData, setSitesData] = useState<SiteTarn[]>([]);
  const [markersCount, setMarkersCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // ---- 1. Récupération des données ----
  useEffect(() => {
    async function fetchSites() {
      try {
        const response = await fetch('/api/tarn');
        if (!response.ok) {
          throw new Error(`Erreur HTTP : ${response.status}`);
        }
        let data: SiteTarn[] = await response.json();

        // --- TRI ALPHABÉTIQUE DES COMMUNES ---
        data.sort((a, b) => a.commune.localeCompare(b.commune, 'fr', { sensitivity: 'base' }));

        setSitesData(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des sites du Tarn :", error);
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
      center: TARN_CENTER,
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
        title: `${site.commune} - ${site.site}`,
        label: {
          text: String(count),
          color: getLabelColor(site.categorie),
          fontWeight: 'bold',
        },
        icon: getMarkerIcon(site.categorie),
      });

      const info = new google.maps.InfoWindow({
        content: `
          <div style="font-family: Arial; font-size: 14px; color: #333;">
            <strong style="color: #b91c1c;">${count}. ${site.commune}</strong> (${site.categorie})<br/>
            <hr style="margin: 5px 0; border: 0; border-top: 1px solid #eee;" />
            <b>Patrimoine :</b> ${site.site}<br/>
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

      <h1 className="text-3xl font-extrabold mb-6 text-red-900">
        🧱 Sites touristiques du Tarn sur la carte
      </h1>

      <p className="font-semibold text-lg mb-4">
        Statut : {isLoadingData ? 'Chargement...' : `${sitesData.length} sites chargés.`}
      </p>

      {/* Légende */}
      <div style={legendStyle}>
        <strong>Légende :</strong>
        <span style={{ color: '#dc2626', fontWeight: 'bold' }}>🔴 Incontournable (Niveau 1)</span>
        <span style={{ color: '#ea580c', fontWeight: 'bold' }}>🟠 Remarquable (Niveau 2)</span>
        <span style={{ color: '#2563eb', fontWeight: 'bold' }}>🔵 Suggéré (Niveau 3)</span>
      </div>

      {/* Carte */}
      <div
        ref={mapRef}
        style={{ height: "70vh", width: "100%" }}
        className="mb-8 border-2 border-red-50 rounded-xl bg-gray-100 flex items-center justify-center shadow-inner"
      >
        {(!isReady || isLoadingData) && <p>Chargement du Pays de Cocagne...</p>}
        {isReady && sitesData.length === 0 && !isLoadingData && <p>Aucune donnée de site à afficher.</p>}
      </div>

      {/* Tableau */}
      <h2 className="text-2xl font-semibold mb-4 text-red-800">
        Liste complète des sites du Tarn ({markersCount} marqueurs)
      </h2>

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#fef2f2" }}>
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
              <tr key={site.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#fffafa" }}>
                <td style={td}>{i + 1}</td>
                <td style={{ ...td, fontWeight: 'bold' }}>{site.commune}</td>
                <td style={td}>{site.site}</td>
                <td style={tdCenter}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      fontSize: '0.9em',
                      backgroundColor:
                        site.niveau === 1 ? '#fee2e2' : site.niveau === 2 ? '#ffedd5' : '#dbeafe',
                      color:
                        site.niveau === 1 ? '#dc2626' : site.niveau === 2 ? '#ea580c' : '#2563eb',
                    }}
                  >
                    {site.niveau}
                  </span>
                </td>
                <td style={td}>
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

// --- Styles ---
const legendStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '20px',
  marginBottom: '20px',
  padding: '15px',
  border: '1px solid #fee2e2',
  borderRadius: '10px',
  backgroundColor: '#ffffff',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
};

const th: CSSProperties = { padding: "12px", borderBottom: "2px solid #fee2e2", textAlign: "left", color: "#991b1b" };
const td: CSSProperties = { padding: "12px", borderBottom: "1px solid #fecaca" };
const tdCenter: CSSProperties = { padding: "12px", borderBottom: "1px solid #fecaca", textAlign: "center" };
