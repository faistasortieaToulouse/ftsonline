'use client';

import { useEffect, useRef, useState, CSSProperties } from "react";
import Script from "next/script";

// --- Interface de type ---
interface ActiviteAriege {
  id: number;
  commune: string;
  type: string;
  details: string;
}

// Coordonnées pour centrer la carte sur l'Ariège (Foix)
const ARIEGE_CENTER = { lat: 42.9667, lng: 1.6000 };

export default function RandoAriegePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [activitesData, setActivitesData] = useState<ActiviteAriege[]>([]);
  const [markersCount, setMarkersCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // ---- 1. Récupération des données ----
  useEffect(() => {
    async function fetchActivites() {
      try {
        const response = await fetch('/api/randoariege');
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

        const data: ActiviteAriege[] = await response.json();
        setActivitesData(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des activités:", error);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchActivites();
  }, []);

  // ---- 2. Initialisation de la carte & marqueurs ----
  useEffect(() => {
    if (!isReady || !mapRef.current || !window.google?.maps || activitesData.length === 0) return;

    const map = new google.maps.Map(mapRef.current, {
      zoom: 9,
      center: ARIEGE_CENTER,
      gestureHandling: "greedy",
    });

    mapInstance.current = map;
    let count = 0;

    activitesData.forEach((act) => {
      count++;
      const position = new google.maps.LatLng(
        ARIEGE_CENTER.lat + (Math.random() - 0.5) * 0.5, // légère dispersion pour les marqueurs
        ARIEGE_CENTER.lng + (Math.random() - 0.5) * 0.5
      );

      const marker = new google.maps.Marker({
        map: mapInstance.current,
        position,
        title: `${act.commune} - ${act.details}`,
        label: {
          text: String(count),
          color: 'white',
          fontWeight: 'bold' as const
        },
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
      });

      const info = new google.maps.InfoWindow({
        content: `
          <div style="font-family: Arial; font-size: 14px;">
            <strong>${count}. ${act.commune}</strong><br/>
            <b>Type :</b> ${act.type}<br/>
            <b>Détails :</b> ${act.details}
          </div>
        `,
      });

      marker.addListener("click", () =>
        info.open({ anchor: marker, map: mapInstance.current! })
      );
    });

    setMarkersCount(count);
  }, [isReady, activitesData]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Google Maps API */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <h1 className="text-3xl font-extrabold mb-6">🏔️ Activités et Randonnées en Ariège</h1>

      <p className="font-semibold text-lg mb-4">
        Statut des données : {isLoadingData ? 'Chargement...' : `${activitesData.length} activités chargées.`}
      </p>

      {/* Carte */}
      <div
        ref={mapRef}
        style={{ height: "70vh", width: "100%" }}
        className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center"
      >
        {(!isReady || isLoadingData) && <p>Chargement de la carte et des données…</p>}
        {isReady && activitesData.length === 0 && !isLoadingData && <p>Aucune activité à afficher.</p>}
      </div>

      {/* Tableau */}
      <h2 className="text-2xl font-semibold mb-4">Liste complète des activités ({markersCount} marqueurs)</h2>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead style={{ backgroundColor: "#e0e0e0" }}>
          <tr>
            <th style={tableHeaderStyle}>#</th>
            <th style={tableHeaderStyle}>Commune</th>
            <th style={tableHeaderStyle}>Type d'activité / Site</th>
            <th style={tableHeaderStyle}>Détails</th>
          </tr>
        </thead>
        <tbody>
          {activitesData.map((act, i) => (
            <tr key={act.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f9f9f9" }}>
              <td style={tableCellStyle}>{i + 1}</td>
              <td style={tableCellStyle}>{act.commune}</td>
              <td style={tableCellStyle}>{act.type}</td>
              <td style={tableCellStyle}>{act.details}</td>
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
