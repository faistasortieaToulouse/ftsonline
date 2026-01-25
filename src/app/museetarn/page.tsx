'use client';

import { useEffect, useState, useRef, CSSProperties } from 'react';
import { Musee } from '../api/museetarn/route'; 
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Styles pour le tableau
const tableHeaderStyle: CSSProperties = { padding: '12px', borderBottom: '2px solid #ddd', cursor: 'pointer' };
const tableCellStyle: CSSProperties = { padding: '12px' };

// CENTRE DU TARN (Albi environ)
const TARN_CENTER: [number, number] = [43.928, 2.148];

export default function MuseeTarnPage() {
  const [musees, setMusees] = useState<Musee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // État pour le tri
  const [sortKey, setSortKey] = useState<keyof Musee>('commune');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Refs pour Leaflet (Méthode OTAN)
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Chargement des données
  useEffect(() => {
    async function fetchMusees() {
      try {
        const response = await fetch('/api/museetarn'); 
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données de l'API du Tarn.");
        }
        const data: Musee[] = await response.json();
        setMusees(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur inattendue est survenue.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchMusees();
  }, []);

  // 2. Initialisation Leaflet (Dynamique)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoading) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (mapInstance.current) return;

      // Création de la carte
      mapInstance.current = L.map(mapRef.current!).setView(TARN_CENTER, 9);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      // Groupe de calques pour les marqueurs (permet de les effacer/re-ajouter proprement)
      markersLayer.current = L.layerGroup().addTo(mapInstance.current);
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

  // 3. Mise à jour des marqueurs (se déclenche au chargement et à chaque tri)
  useEffect(() => {
    if (!isMapReady || !mapInstance.current || musees.length === 0) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      
      // On vide les anciens marqueurs
      markersLayer.current.clearLayers();

      musees.forEach((musee, index) => {
        const numero = index + 1;
        
        // Icône personnalisée avec numéro
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: #b91c1c;
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
          <div style="font-family: sans-serif;">
            <h3 style="margin:0 0 5px 0;">${numero}. ${musee.nom}</h3>
            <p style="margin:0;"><strong>Commune :</strong> ${musee.commune}</p>
            <p style="margin:0;"><strong>Catégorie :</strong> ${musee.categorie}</p>
            <p style="margin:0;"><a href="${musee.url}" target="_blank">Site web</a></p>
          </div>
        `;

        L.marker([musee.lat, musee.lng], { icon: customIcon })
          .bindPopup(popupContent)
          .addTo(markersLayer.current);
      });
    };

    updateMarkers();
  }, [isMapReady, musees]);

  // Logique de tri
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

  if (isLoading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Musées et Patrimoine du Tarn (81)</h1>
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Musées et Patrimoine du Tarn (81)</h1>
        <p>Erreur : {error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1>🍷 Musées et Patrimoine du Tarn (81)</h1>
      
      <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>
        Total de Sites listés : {musees.length}
      </p>
      <p style={{ marginBottom: '20px', color: '#555' }}>Carte interactive et liste des lieux culturels et historiques du département du Tarn.</p>

      {/* ZONE CARTE LEAFLET */}
      <div 
        ref={mapRef} 
        style={{ 
          height: '500px', 
          width: '100%', 
          borderRadius: '8px', 
          marginBottom: '32px',
          zIndex: 0 
        }} 
      />

      <h2>Liste Détaillée des Sites (Cliquez sur l'entête pour trier)</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4' }}>
            <th style={{...tableHeaderStyle, cursor: 'default'}}>#</th>
            <th style={tableHeaderStyle} onClick={() => handleSort('commune')}>
              Commune {getSortIndicator('commune')}
            </th>
            <th style={tableHeaderStyle} onClick={() => handleSort('nom')}>
              Nom du Site {getSortIndicator('nom')}
            </th>
            <th style={tableHeaderStyle} onClick={() => handleSort('categorie')}>
              Catégorie {getSortIndicator('categorie')}
            </th>
            <th style={{...tableHeaderStyle, cursor: 'default'}}>Adresse</th>
            <th style={{...tableHeaderStyle, cursor: 'default'}}>URL</th>
          </tr>
        </thead>
        <tbody>
          {musees.map((musee, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{...tableCellStyle, color: '#666', fontWeight: 'bold'}}>{index + 1}</td>
              <td style={tableCellStyle}><strong>{musee.commune}</strong></td>
              <td style={tableCellStyle}>{musee.nom}</td>
              <td style={tableCellStyle}>{musee.categorie}</td>
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
  );
}