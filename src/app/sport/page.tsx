'use client';

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Equipement {
  id: string | number;
  name: string;
  installation: string;
  famille: string;
  type: string;
  adresse: string;
  lat: number;
  lng: number;
}

const API_BASE = "/api/sport";

export default function SportPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);

  const [items, setItems] = useState<Equipement[]>([]);
  const [markersCount, setMarkersCount] = useState(0);
  const [isMapReady, setIsMapReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  async function fetchItems() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.installation?.toLowerCase().includes(q) ||
      item.famille?.toLowerCase().includes(q) ||
      item.type?.toLowerCase().includes(q) ||
      item.adresse?.toLowerCase().includes(q)
    );
  });

  // INITIALISATION CARTE ET MARQUEURS (MÉTHODE OTAN)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || filteredItems.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      if (!mapInstance.current) {
        // Initialisation de la carte sur Toulouse
        mapInstance.current = L.map(mapRef.current!).setView([43.6045, 1.444], 12);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance.current);

        markersGroupRef.current = L.layerGroup().addTo(mapInstance.current);
      }

      // Nettoyage et ajout des marqueurs
      markersGroupRef.current.clearLayers();

      filteredItems.forEach((item, i) => {
        const count = i + 1;

        // Icône personnalisée numérotée
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            background-color: #2563eb;
            color: white;
            width: 24px; height: 24px;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 11px; font-weight: bold;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">${count}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const popupContent = `
          <div style="font-family: Arial; font-size: 14px;">
            <strong>${count}. ${item.name}</strong><br/>
            <b>Installation :</b> ${item.installation}<br/>
            <b>Famille :</b> ${item.famille}<br/>
            <b>Type :</b> ${item.type}<br/>
            <b>Adresse :</b> ${item.adresse}
          </div>
        `;

        L.marker([item.lat, item.lng], { icon: customIcon })
          .addTo(markersGroupRef.current)
          .bindPopup(popupContent);
      });

      setMarkersCount(filteredItems.length);
      setIsMapReady(true);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [filteredItems]);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-bold mb-4 text-slate-800">Équipements sportifs de Toulouse</h1>

      <p className="mb-4 font-semibold text-slate-600">
        {markersCount} lieux affichés sur {filteredItems.length} équipements filtrés.
      </p>

      <input
        type="text"
        placeholder="Rechercher un équipement..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
      />

      {error && (
        <div className="mt-6 p-4 border border-red-500 bg-red-50 text-red-700 rounded">
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {/* ZONE CARTE */}
      <div
        style={{ height: "60vh", width: "100%", zIndex: 0 }}
        className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center shadow-inner relative overflow-hidden"
      >
        <div ref={mapRef} className="h-full w-full" />
        {(!isMapReady || loading) && (
          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
            <p className="animate-pulse text-gray-500 font-medium">Chargement de la carte et des données…</p>
          </div>
        )}
      </div>

      {/* TABLEAU */}
      <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#f8fafc" }}>
            <tr>
              <th style={thStyle}>#</th>
              <th style={thStyle}>Nom</th>
              <th style={thStyle}>Installation</th>
              <th style={thStyle}>Famille</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Adresse</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, i) => (
              <tr key={item.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f9fafb" }}>
                <td style={{ ...tdStyle, fontWeight: 'bold' }}>{i + 1}</td>
                <td style={tdStyle}>{item.name}</td>
                <td style={tdStyle}>{item.installation}</td>
                <td style={tdStyle}>{item.famille}</td>
                <td style={tdStyle}>{item.type}</td>
                <td style={tdStyle}>{item.adresse}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Styles réutilisables
const thStyle = { padding: "12px 8px", border: "1px solid #e2e8f0", textAlign: "left" as const, fontSize: "14px", color: "#64748b" };
const tdStyle = { padding: "10px 8px", border: "1px solid #e2e8f0", fontSize: "14px" };