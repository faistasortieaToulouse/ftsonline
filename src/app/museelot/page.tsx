'use client';

import { useEffect, useState, useRef, CSSProperties } from 'react';
import { Musee } from '../api/museelot/route'; 
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// CENTRE DU LOT (Cahors environ)
const LOT_CENTER: [number, number] = [44.447, 1.441];
const THEME_COLOR = '#b91c1c'; // Rouge Malbec (Vin de Cahors)

export default function MuseeLotPage() {
  const [musees, setMusees] = useState<Musee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs pour Leaflet (Méthode OTAN)
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Récupération des données
  useEffect(() => {
    async function fetchMusees() {
      try {
        const response = await fetch('/api/museelot'); 
        if (!response.ok) throw new Error("Erreur lors de la récupération des données du Lot.");
        const data: Musee[] = await response.json();
        
        // Tri alphabétique par commune pour la cohérence du tableau
        const sorted = data.sort((a, b) => a.commune.localeCompare(b.commune));
        setMusees(sorted);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setIsLoading(false);
      }
    }
    fetchMusees();
  }, []);

  // 2. Initialisation dynamique de Leaflet (Évite les erreurs SSR)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoading) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      
      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current).setView(LOT_CENTER, 9);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);

      setIsMapReady(true);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isLoading]);

  // 3. Ajout des marqueurs numérotés
  useEffect(() => {
    if (!isMapReady || !mapInstance.current || musees.length === 0) return;

    const addMarkers = async () => {
      const L = (await import('leaflet')).default;

      musees.forEach((m, i) => {
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: ${THEME_COLOR};
              width: 26px; height: 26px;
              border-radius: 50%; border: 2px solid white;
              display: flex; align-items: center; justify-content: center;
              color: white; font-weight: bold; font-size: 10px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              ${i + 1}
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const popupContent = `
          <div style="font-family: sans-serif; padding: 5px;">
            <strong style="color:${THEME_COLOR}">${i + 1}. ${m.nom}</strong><br/>
            <small>${m.commune}</small><br/>
            <a href="${m.url}" target="_blank" style="color:blue; text-decoration:underline;">Site web</a>
          </div>
        `;

        L.marker([m.lat, m.lng], { icon: customIcon })
          .bindPopup(popupContent)
          .addTo(mapInstance.current);
      });
    };

    addMarkers();
  }, [isMapReady, musees]);

  if (isLoading) return <div className="p-10 font-bold">Chargement des données du Lot...</div>;
  if (error) return <div className="p-10 text-red-600 font-bold">Erreur : {error}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-2xl font-bold mb-2">🍷 Musées et Patrimoine du Lot (46)</h1>
      
      <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>
        Total de Sites listés : {musees.length}
      </p>
      <p style={{ marginBottom: '20px', color: '#555' }}>
        Carte interactive et liste des lieux culturels et historiques du département.
      </p>

      {/* Carte Leaflet */}
      <div 
        ref={mapRef} 
        style={{ 
          height: '500px', 
          width: '100%', 
          borderRadius: '12px', 
          marginBottom: '32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #ddd',
          zIndex: 0
        }} 
      />

      <h2 className="text-xl font-bold mb-4">Liste Détaillée des Sites</h2>
      <div className="overflow-x-auto">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4' }}>
              <th style={tableHeaderStyle}>N°</th> 
              <th style={tableHeaderStyle}>Commune</th>
              <th style={tableHeaderStyle}>Nom du Site</th>
              <th style={tableHeaderStyle}>Catégorie</th>
              <th style={tableHeaderStyle}>Adresse</th>
              <th style={tableHeaderStyle}>URL</th>
            </tr>
          </thead>
          <tbody>
            {musees.map((musee, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #eee' }} className="hover:bg-gray-50 transition-colors">
                <td style={tableCellStyle}><strong>{index + 1}</strong></td> 
                <td style={tableCellStyle}>{musee.commune}</td>
                <td style={tableCellStyle}><strong>{musee.nom}</strong></td>
                <td style={tableCellStyle}>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 uppercase font-bold">
                    {musee.categorie}
                  </span>
                </td>
                <td style={tableCellStyle}>{musee.adresse}</td>
                <td style={tableCellStyle}>
                  <a 
                    href={musee.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ color: 'blue', textDecoration: 'underline' }} 
                  >
                    Voir le site
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const tableHeaderStyle: CSSProperties = { 
  padding: '12px', 
  borderBottom: '2px solid #ddd',
  fontSize: '14px',
  color: '#333'
};

const tableCellStyle: CSSProperties = { 
  padding: '12px',
  fontSize: '14px'
};