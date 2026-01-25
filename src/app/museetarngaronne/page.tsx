'use client';

import { useEffect, useState, useRef, useCallback, CSSProperties } from 'react';
import { MuseeTarnGaronne as Musee } from '../api/museetarngaronne/route'; 
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Styles pour le tableau
const tableHeaderStyle: CSSProperties = { padding: '12px', borderBottom: '2px solid #ddd', cursor: 'pointer' };
const tableCellStyle: CSSProperties = { padding: '12px' };

// --- Composant Leaflet (Méthode OTAN) ---
const LeafletMap = ({ musees }: { musees: Musee[] }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || musees.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      if (!mapInstance.current) {
        // Calcul du centre moyen
        const centerLat = musees.reduce((sum, m) => sum + m.lat, 0) / musees.length;
        const centerLng = musees.reduce((sum, m) => sum + m.lng, 0) / musees.length;

        mapInstance.current = L.map(mapRef.current!).setView([centerLat, centerLng], 9);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance.current);

        markersLayer.current = L.layerGroup().addTo(mapInstance.current);
      }

      // Mise à jour des marqueurs (se synchronise avec le tri du tableau)
      markersLayer.current.clearLayers();

      musees.forEach((musee, index) => {
        const numero = index + 1;
        
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: #1e3a8a;
              width: 24px; height: 24px;
              border-radius: 50%; border: 2px solid white;
              display: flex; align-items: center; justify-content: center;
              color: white; font-weight: bold; font-size: 10px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              ${numero}
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const popupContent = `
          <div style="font-family: sans-serif; font-size: 13px;">
            <h3 style="margin:0; color:#1e3a8a;">${numero}. ${musee.nom}</h3>
            <p style="margin:5px 0;"><b>${musee.commune}</b></p>
            <p style="margin:2px 0;">${musee.adresse}</p>
            <a href="${musee.url}" target="_blank" style="color:blue; text-decoration:underline;">Visiter le site</a>
          </div>
        `;

        L.marker([musee.lat, musee.lng], { icon: customIcon })
          .bindPopup(popupContent)
          .addTo(markersLayer.current);
      });
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [musees]);

  return <div ref={mapRef} style={{ height: '500px', width: '100%', borderRadius: '8px', marginBottom: '32px', zIndex: 0 }} />;
};

// --- Composant Principal ---
export default function MuseeTarnGaronnePage() {
  const [musees, setMusees] = useState<Musee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<keyof Musee>('commune');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    async function fetchMusees() {
      try {
        const response = await fetch('/api/museetarngaronne'); 
        if (!response.ok) throw new Error("Erreur lors de la récupération des données.");
        const data: Musee[] = await response.json();
        setMusees(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inattendue.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchMusees();
  }, []);

  const handleSort = (key: keyof Musee) => {
    const direction = key === sortKey && sortDirection === 'asc' ? 'desc' : 'asc';
    const sortedData = [...musees].sort((a, b) => {
      const aValue = (a[key] || '').toString().toLowerCase();
      const bValue = (b[key] || '').toString().toLowerCase();
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setMusees(sortedData);
    setSortKey(key);
    setSortDirection(direction);
  };

  const getSortIndicator = (key: keyof Musee) => {
    if (key !== sortKey) return '';
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  const DEPARTEMENT_NOM = 'Tarn-et-Garonne (82)';

  if (isLoading) return <div className="p-10"><h1>Chargement du {DEPARTEMENT_NOM}...</h1></div>;
  if (error) return <div className="p-10 text-red-500"><h1>Erreur : {error}</h1></div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1>🏰 Musées et Patrimoine du {DEPARTEMENT_NOM}</h1>
      <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>Total de Sites listés : {musees.length}</p>
      <p style={{ marginBottom: '20px', color: '#555' }}>Carte interactive et liste des lieux culturels du département.</p>

      {/* Remplacement Google Map par Leaflet */}
      <LeafletMap musees={musees} />

      <h2>Liste Détaillée (Cliquez sur l'entête pour trier)</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4' }}>
            <th style={tableHeaderStyle} onClick={() => handleSort('commune')}>Commune {getSortIndicator('commune')}</th>
            <th style={tableHeaderStyle} onClick={() => handleSort('nom')}>Nom du Site {getSortIndicator('nom')}</th>
            <th style={tableHeaderStyle} onClick={() => handleSort('categorie')}>Catégorie {getSortIndicator('categorie')}</th>
            <th style={tableHeaderStyle}>Adresse</th>
            <th style={tableHeaderStyle}>URL</th>
          </tr>
        </thead>
        <tbody>
          {musees.map((musee, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
              <td style={tableCellStyle}><strong>{musee.commune}</strong></td>
              <td style={tableCellStyle}>{musee.nom}</td>
              <td style={tableCellStyle}>{musee.categorie}</td>
              <td style={tableCellStyle}>{musee.adresse}</td>
              <td style={tableCellStyle}>
                <a href={musee.url} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>Voir le site</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}