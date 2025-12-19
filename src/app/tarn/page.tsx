'use client';

import { useEffect, useRef, useState, CSSProperties } from "react";
import Script from "next/script";

interface SiteTarn {
  id: number;
  commune: string;
  site: string;
  niveau: number;
  categorie: 'incontournable' | 'remarquable' | 'suggéré';
  lat: number;
  lng: number;
}

const getMarkerIcon = (categorie: SiteTarn['categorie']): string => {
  switch (categorie) {
    case 'incontournable': return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
    case 'remarquable': return 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png';
    default: return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
  }
};

const getLabelColor = (categorie: SiteTarn['categorie']): string => {
  return categorie === 'remarquable' ? 'white' : 'yellow';
};

// Centre : Albi
const TARN_CENTER = { lat: 43.928, lng: 2.142 };

export default function TarnMapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [sitesData, setSitesData] = useState<SiteTarn[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    async function fetchSites() {
      try {
        const response = await fetch('/api/tarn');
        const data = await response.json();
        setSitesData(data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchSites();
  }, []);

  useEffect(() => {
    if (!isReady || !mapRef.current || !window.google?.maps || sitesData.length === 0) return;

    const map = new google.maps.Map(mapRef.current, {
      zoom: 9,
      center: TARN_CENTER,
      gestureHandling: "greedy",
    });

    sitesData.forEach((site, i) => {
      const marker = new google.maps.Marker({
        map,
        position: { lat: site.lat, lng: site.lng },
        title: site.commune,
        label: {
          text: String(i + 1),
          color: getLabelColor(site.categorie),
          fontWeight: 'bold',
        },
        icon: getMarkerIcon(site.categorie),
      });

      const info = new google.maps.InfoWindow({
        content: `
          <div style="font-family: Arial; padding: 5px;">
            <strong style="color: #b91c1c;">${i + 1}. ${site.commune}</strong><br/>
            <b>Patrimoine :</b> ${site.site}<br/>
            <b>Catégorie :</b> ${site.categorie}
          </div>
        `,
      });

      marker.addListener("click", () => info.open({ anchor: marker, map }));
    });
  }, [isReady, sitesData]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <h1 className="text-3xl font-extrabold mb-6 text-red-900">🧱 Patrimoine du Tarn sur la carte</h1>

      <div style={legendStyle}>
        <strong>Légende :</strong>
        <span style={{ color: '#b91c1c', fontWeight: 'bold' }}>🔴 Incontournable</span>
        <span style={{ color: '#ea580c', fontWeight: 'bold' }}>🟠 Remarquable</span>
      </div>

      <div
        ref={mapRef}
        style={{ height: "70vh", width: "100%" }}
        className="mb-8 border-2 border-red-50 rounded-xl bg-gray-50 flex items-center justify-center shadow-lg"
      >
        {(!isReady || isLoadingData) && <p>Chargement du Pays de Cocagne…</p>}
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-red-800">Liste des {sitesData.length} sites du Tarn</h2>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-red-50">
              <th style={th}>#</th>
              <th style={th}>Commune</th>
              <th style={th}>Site emblématique</th>
              <th style={th}>Niveau</th>
              <th style={th}>Catégorie</th>
            </tr>
          </thead>
          <tbody>
            {sitesData.map((site, i) => (
              <tr key={site.id} className={i % 2 === 0 ? "bg-white" : "bg-red-50/30"}>
                <td style={td}>{i + 1}</td>
                <td style={{ ...td, fontWeight: 'bold' }}>{site.commune}</td>
                <td style={td}>{site.site}</td>
                <td style={tdCenter}>
                  <span style={{
                    padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold',
                    backgroundColor: site.niveau === 1 ? '#fee2e2' : '#ffedd5',
                    color: site.niveau === 1 ? '#dc2626' : '#ea580c',
                  }}>
                    {site.niveau}
                  </span>
                </td>
                <td style={td}>{site.categorie}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const legendStyle: CSSProperties = {
  display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px',
  padding: '15px', border: '1px solid #fee2e2', borderRadius: '10px', backgroundColor: '#fff'
};

const th: CSSProperties = { padding: "12px", borderBottom: "2px solid #fee2e2", textAlign: "left", color: "#7f1d1d" };
const td: CSSProperties = { padding: "12px", borderBottom: "1px solid #fecaca" };
const tdCenter: CSSProperties = { padding: "12px", borderBottom: "1px solid #fecaca", textAlign: "center" };
