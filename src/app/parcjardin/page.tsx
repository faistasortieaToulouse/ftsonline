'use client';

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ParcJardin {
  id: number;
  name: string;
  adresse: string;
  lat: number;
  lng: number;
  type: string;
  quartier: string | number;
  commune: string;
  territoire: string;
}

const API_BASE = "/api/parcjardin";

export default function ParcJardinPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);

  const [items, setItems] = useState<ParcJardin[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Chargement des données
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

  // 2. Filtrage
  const filteredItems = items.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.adresse.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q) ||
      item.quartier.toString().toLowerCase().includes(q) ||
      item.commune.toLowerCase().includes(q) ||
      item.territoire.toLowerCase().includes(q)
    );
  });

  // 3. Initialisation Leaflet (OTAN)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current!).setView([43.6045, 1.444], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance.current);

        // Groupe de marqueurs pour gestion facile
        markersGroupRef.current = L.layerGroup().addTo(mapInstance.current);
        setIsMapReady(true);
      }
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 4. Mise à jour des marqueurs selon le filtrage
  useEffect(() => {
    if (!isMapReady || !markersGroupRef.current) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      
      // On vide les anciens marqueurs
      markersGroupRef.current.clearLayers();

      filteredItems.forEach((item, i) => {
        const numero = i + 1;

        // Création d'une icône personnalisée avec numéro
        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="
            background-color: #15803d; 
            color: white; 
            width: 24px; 
            height: 24px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 10px; 
            font-weight: bold; 
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">${numero}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const popupContent = `
          <div style="font-family: sans-serif; font-size: 13px;">
            <strong style="color: #15803d;">${numero}. ${item.name}</strong><br/>
            <b>Type :</b> ${item.type}<br/>
            <b>Adresse :</b> ${item.adresse}<br/>
            <b>Quartier :</b> ${item.quartier}<br/>
            <b>Commune :</b> ${item.commune}
          </div>
        `;

        L.marker([item.lat, item.lng], { icon: customIcon })
          .addTo(markersGroupRef.current)
          .bindPopup(popupContent);
      });
    };

    updateMarkers();
  }, [isMapReady, filteredItems]);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-bold mb-4">🌿 Espaces verts et parcs de Toulouse</h1>
      <p className="mb-4 font-semibold">
        {filteredItems.length} lieux affichés sur {items.length} espaces verts au total.
      </p>

      <input
        type="text"
        placeholder="Rechercher un parc ou jardin..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring focus:border-green-300 shadow-sm"
      />

      {error && (
        <div className="mt-6 p-4 border border-red-500 bg-red-50 text-red-700 rounded">
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {/* CARTE LEAFLET */}
      <div
        ref={mapRef}
        style={{ height: "60vh", width: "100%", zIndex: 0 }}
        className="mb-6 border rounded-lg bg-gray-100 shadow-inner"
      >
        {!isMapReady && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 animate-pulse">Chargement de la carte…</p>
          </div>
        )}
      </div>

      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead style={{ backgroundColor: "#f0f0f0" }}>
            <tr>
              <th style={{ padding: "12px 8px", borderBottom: "2px solid #ddd", width: "5%" }}>#</th>
              <th style={{ padding: "12px 8px", borderBottom: "2px solid #ddd", textAlign: 'left' }}>Nom</th>
              <th style={{ padding: "12px 8px", borderBottom: "2px solid #ddd", textAlign: 'left' }}>Type</th>
              <th style={{ padding: "12px 8px", borderBottom: "2px solid #ddd", textAlign: 'left' }}>Adresse</th>
              <th style={{ padding: "12px 8px", borderBottom: "2px solid #ddd", textAlign: 'left' }}>Quartier</th>
              <th style={{ padding: "12px 8px", borderBottom: "2px solid #ddd", textAlign: 'left' }}>Commune</th>
              <th style={{ padding: "12px 8px", borderBottom: "2px solid #ddd", textAlign: 'left' }}>Territoire</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, i) => (
              <tr 
                key={`${item.id}-${i}`} 
                style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#fbfbfb" }}
                className="hover:bg-green-50 transition-colors"
              >
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee", fontWeight: 'bold', textAlign: 'center' }}>{i + 1}</td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee", fontWeight: '500' }}>{item.name}</td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>{item.type}</td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee", color: '#666' }}>{item.adresse}</td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>{item.quartier}</td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>{item.commune}</td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>{item.territoire}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredItems.length === 0 && !loading && (
        <p className="text-center py-10 text-gray-500">Aucun parc ne correspond à votre recherche.</p>
      )}
    </div>
  );
}