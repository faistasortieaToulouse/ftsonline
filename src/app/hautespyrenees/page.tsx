'use client';

import { useEffect, useRef, useState, CSSProperties } from "react";
import Script from "next/script";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// --- Interface de type ---
interface SiteHP {
  id: number;
  commune: string;
  site: string; // "description" dans votre modèle Lot
  niveau: number;
  categorie: 'incontournable' | 'remarquable' | 'suggéré';
  lat: number;
  lng: number;
}

// --- Fonctions utilitaires pour les marqueurs ---
const getMarkerIcon = (categorie: SiteHP['categorie']): string => {
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

const getLabelColor = (categorie: SiteHP['categorie']): string => {
  return categorie === 'remarquable' ? 'white' : 'yellow';
};

// --- Centre de la carte : Hautes-Pyrénées (proche de Tarbes/Bagnères) ---
const HP_CENTER = { lat: 43.05, lng: 0.15 };

export default function HautesPyreneesMapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  const [sitesData, setSitesData] = useState<SiteHP[]>([]);
  const [markersCount, setMarkersCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // ---- 1. Récupération et tri des données ----
  useEffect(() => {
    async function fetchSites() {
      try {
        const response = await fetch('/api/hautespyrenees');
        if (!response.ok) {
          throw new Error(`Erreur HTTP : ${response.status}`);
        }
        const data: SiteHP[] = await response.json();

        // --- Tri alphabétique par commune ---
        data.sort((a, b) => a.commune.localeCompare(b.commune, 'fr', { sensitivity: 'base' }));

        setSitesData(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des sites des Hautes-Pyrénées :", error);
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
      center: HP_CENTER,
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
          <div style="font-family: Arial; font-size: 14px; color: #333; padding: 5px;">
            <strong>${count}. ${site.commune}</strong><br/>
            <span style="color: #666; font-style: italic;">${site.categorie}</span><br/>
            <hr style="margin: 5px 0;"/>
            <b>Site :</b> ${site.site}<br/>
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
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      {/* Google Maps API */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <h1 className="text-3xl font-extrabold mb-6 text-blue-900">
        🏔️ Patrimoine des Hautes-Pyrénées sur la carte
      </h1>

      <p className="font-semibold text-lg mb-4 text-gray-700">
        Statut : {isLoadingData ? 'Chargement...' : `${sitesData.length} sites répertoriés.`}
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
        className="mb-8 border-2 border-blue-100 rounded-xl bg-gray-50 flex items-center justify-center shadow-lg"
      >
        {(!isReady || isLoadingData) && <p className="animate-pulse">Initialisation de la carte des sommets…</p>}
        {isReady && sitesData.length === 0 && !isLoadingData && <p>Aucun site trouvé.</p>}
      </div>

      {/* Tableau */}
      <h2 className="text-2xl font-semibold mb-4 text-blue-800">
        Liste exhaustive des sites ({markersCount} points d'intérêt)
      </h2>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#f1f5f9" }}>
            <tr>
              <th style={th}>#</th>
              <th style={th}>Commune</th>
              <th style={th}>Site ou Monument</th>
              <th style={th}>Niveau</th>
              <th style={th}>Catégorie</th>
            </tr>
          </thead>
          <tbody>
            {sitesData.map((site, i) => (
              <tr key={site.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                <td style={td}>{i + 1}</td>
                <td style={{ ...td, fontWeight: 'bold' }}>{site.commune}</td>
                <td style={td}>{site.site}</td>
                <td style={tdCenter}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      fontSize: '0.85em',
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

// --- Styles CSS ---
const legendStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '20px',
  marginBottom: '20px',
  padding: '15px',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  backgroundColor: '#ffffff',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
};

const th: CSSProperties = { 
  padding: "12px", 
  borderBottom: "2px solid #e2e8f0", 
  textAlign: "left",
  color: "#475569",
  fontSize: "0.9rem"
};

const td: CSSProperties = { 
  padding: "12px", 
  borderBottom: "1px solid #f1f5f9",
  fontSize: "0.95rem"
};

const tdCenter: CSSProperties = { 
  padding: "12px", 
  borderBottom: "1px solid #f1f5f9", 
  textAlign: "center" 
};
