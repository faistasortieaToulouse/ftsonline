'use client';

import { useEffect, useState, useRef, CSSProperties } from "react"; 
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// --- Interface de type ---
interface PaysUE {
  nom: string;
  code: string;
  entree_ue: number;
  schengen: boolean | string;
  lat: number;
  lng: number;
}

const EU_CENTER: [number, number] = [48.5, 12];

// --- Couleurs thématiques (Bleu Europe) ---
const EU_BLUE = "#003399";
const EU_YELLOW = "#FFCC00";

export default function MembresUEPage() { 
  const [pays, setPays] = useState<PaysUE[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Refs pour Leaflet (Méthode OTAN)
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // 1. Charger les données API
  useEffect(() => {
    async function fetchPays() {
      try {
        const response = await fetch('/api/membresue'); 
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        let data: PaysUE[] = await response.json();
        
        if (Array.isArray(data)) {
          // Tri par date d'adhésion (chronologique)
          const sorted = data.sort((a, b) => a.entree_ue - b.entree_ue);
          setPays(sorted);
        }
      } catch (error) {
        console.error("Erreur API UE:", error);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchPays();
  }, []);

  // 2. Initialisation de la carte
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current).setView(EU_CENTER, 4);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      setIsReady(true);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isLoadingData]);

  // 3. Ajout des marqueurs
  useEffect(() => {
    if (!isReady || !mapInstance.current || pays.length === 0) return;

    const addMarkers = async () => {
      const L = (await import('leaflet')).default;

      pays.forEach((p) => {
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: ${EU_BLUE};
              width: 32px; height: 32px;
              border-radius: 50%; border: 2px solid ${EU_YELLOW};
              display: flex; align-items: center; justify-content: center;
              color: white; font-weight: bold; font-size: 10px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              ${p.code}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([p.lat, p.lng], { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: Arial; font-size: 14px; color: black;"> 
            <strong style="font-size: 16px;">${p.nom}</strong><br/> 
            <hr style="margin: 5px 0;"/>
            🗓 Adhésion : <b>${p.entree_ue}</b><br/>
            🛂 Schengen : <b>${p.schengen === 'partiel' ? 'Partiel' : p.schengen ? 'Oui' : 'Non'}</b>
          </div>
        `);
        marker.addTo(mapInstance.current);
      });
    };

    addMarkers();
  }, [isReady, pays]);

  return ( 
    <div className="p-4 max-w-7xl mx-auto bg-slate-50 min-h-screen"> 
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8 border-b border-blue-200 pb-6">
        <h1 className="text-4xl font-black text-blue-900 flex items-center gap-3">
          🇪🇺 Les 27 États Membres de l'UE
        </h1>
        <p className="text-gray-600 mt-2 italic">Chronologie des adhésions et intégration à l'espace Schengen</p>
      </header>

      {/* ZONE CARTE */}
      <div style={{ height: "55vh", width: "100%" }} className="mb-8 border-4 border-white shadow-xl rounded-3xl bg-slate-200 relative z-0 overflow-hidden"> 
        <div ref={mapRef} className="h-full w-full" />
        {isLoadingData && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <p className="animate-pulse font-bold text-blue-600">Initialisation de l'Europe...</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-slate-800">Détails des États membres</h2> 

      <div style={{ overflowX: "auto", width: "100%", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px", backgroundColor: "white" }}> 
          <thead style={{ backgroundColor: "#f8fafc" }}> 
            <tr> 
              <th style={tableHeaderStyle}>Code</th>
              <th style={tableHeaderStyle}>Pays</th> 
              <th style={tableHeaderStyleCenter}>Année d'adhésion</th> 
              <th style={tableHeaderStyleCenter}>Espace Schengen</th> 
            </tr> 
          </thead> 
          <tbody> 
            {pays.map((p, i) => ( 
              <tr key={p.code} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f1f5f9" }}> 
                <td style={{ ...tableCellStyle, fontWeight: 'bold', color: EU_BLUE }}>{p.code}</td>
                <td style={{ ...tableCellStyle, fontSize: '16px', fontWeight: '600' }}>{p.nom}</td> 
                <td style={tableCellStyleCenter}>
                  <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                    {p.entree_ue}
                  </span>
                </td> 
                <td style={tableCellStyleCenter}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <div style={{ 
                            width: '10px', 
                            height: '10px', 
                            borderRadius: '50%', 
                            backgroundColor: p.schengen === true ? '#22c55e' : p.schengen === 'partiel' ? '#f59e0b' : '#ef4444' 
                        }} />
                        <span style={{ fontSize: '13px' }}>
                            {p.schengen === 'partiel' ? 'Partiel' : p.schengen ? 'Inclus' : 'Exclu'}
                        </span>
                    </div>
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
const tableHeaderStyle: CSSProperties = { padding: "16px", borderBottom: "2px solid #e2e8f0", textAlign: "left", fontSize: "14px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" };
const tableHeaderStyleCenter: CSSProperties = { ...tableHeaderStyle, textAlign: "center" };
const tableCellStyle: CSSProperties = { padding: "14px 16px", borderBottom: "1px solid #e2e8f0", fontSize: "14px", color: "#1e293b" };
const tableCellStyleCenter: CSSProperties = { ...tableCellStyle, textAlign: "center" };