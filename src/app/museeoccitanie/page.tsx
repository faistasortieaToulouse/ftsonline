// src/app/museeoccitanie/page.tsx
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { MuseeOccitanie as Musee } from '../api/museeoccitanie/route'; 
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Déclaration pour que TypeScript reconnaisse google.maps
declare global {
  interface Window {
    initMap: () => void;
    google: typeof google;
  }
}

// Styles
const tableHeaderStyle = { padding: '12px', borderBottom: '2px solid #ddd', cursor: 'pointer' };
const tableCellStyle = { padding: '12px' };

// Composant de la carte (Google Maps)
const GoogleMap = ({ musees }: { musees: Musee[] }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.google || musees.length === 0) return;

    const centerLat = musees.reduce((sum, m) => sum + m.lat, 0) / musees.length;
    const centerLng = musees.reduce((sum, m) => sum + m.lng, 0) / musees.length;
    
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 43.8, lng: 2.5 }, 
      zoom: 8, 
      scrollwheel: true,
    });

    musees.forEach((musee, index) => {
      const numero = index + 1;
      
      const marker = new window.google.maps.Marker({
        position: { lat: musee.lat, lng: musee.lng },
        map,
        title: `${numero}. ${musee.nom} (${musee.commune})`,
        label: {
          text: String(numero),
          color: 'white',
          fontWeight: 'bold',
        }
      });

      const infowindow = new window.google.maps.InfoWindow({
        content: `
          <h3>${numero}. ${musee.nom}</h3>
          <p><strong>Département :</strong> ${musee.departement}</p>
          <p><strong>Commune :</strong> ${musee.commune}</p>
          <p><strong>Catégorie :</strong> ${musee.categorie}</p>
          <p><a href="${musee.url}" target="_blank" rel="noopener noreferrer">Site web</a></p>
        `,
      });

      marker.addListener('click', () => {
        infowindow.open(map, marker);
      });
    });
  }, [musees]);

  useEffect(() => {
    if (window.google && window.google.maps) {
      initMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    window.initMap = initMap;
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [initMap]);

  return <div ref={mapRef} style={{ height: '500px', width: '100%', borderRadius: '8px', marginBottom: '32px' }} />;
};


// Composant principal de la page
export default function MuseeOccitaniePage() {
  const [musees, setMusees] = useState<Musee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [sortKey, setSortKey] = useState<keyof Musee>('departement');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    async function fetchMusees() {
      try {
        const response = await fetch('/api/museeoccitanie'); 
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données de l'API Occitanie.");
        }
        const data: Musee[] = await response.json();
        setMusees(data);
      } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("Une erreur inattendue est survenue.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchMusees();
  }, []);

  const handleSort = (key: keyof Musee) => {
    const direction = key === sortKey && sortDirection === 'asc' ? 'desc' : 'asc';
    
    const sortedData = [...musees].sort((a, b) => {
      const aValue = a[key].toString().toLowerCase();
      const bValue = b[key].toString().toLowerCase();

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

  const REGION_NOM = 'Région Occitanie';
  
  if (isLoading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Musées et Patrimoine de la {REGION_NOM}</h1>
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Musées et Patrimoine de la {REGION_NOM}</h1>
        <p>Erreur : {error}</p>
        <p>Vérifiez les APIs départementales et la clé Google Maps.</p>
      </div>
    );
  }

  const totalMusees = musees.length; 

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1>☀️ Musées et Patrimoine de la {REGION_NOM}</h1>
      
      <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>
        Total de Sites listés : {totalMusees} (issus de 11 départements)
      </p>
      <p style={{ marginBottom: '20px', color: '#555' }}>Carte interactive et liste agrégée des lieux culturels et historiques des départements d'Occitanie.</p>

      {/* Carte Google Maps */}
      <GoogleMap musees={musees} />
      

      <h2>Liste Détaillée des Sites (Cliquez sur l'entête pour trier)</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4' }}>
            <th style={{ ...tableHeaderStyle, cursor: 'default' }}>#</th> {/* Nouvelle colonne Numéro */}
            <th style={tableHeaderStyle} onClick={() => handleSort('departement')}>
              Département {getSortIndicator('departement')}
            </th>
            <th style={tableHeaderStyle} onClick={() => handleSort('commune')}>
              Commune {getSortIndicator('commune')}
            </th>
            <th style={tableHeaderStyle} onClick={() => handleSort('nom')}>
              Nom du Site {getSortIndicator('nom')}
            </th>
            <th style={tableHeaderStyle} onClick={() => handleSort('categorie')}>
              Catégorie {getSortIndicator('categorie')}
            </th>
            <th style={tableHeaderStyle}>Adresse</th>
            <th style={tableHeaderStyle}>URL</th>
          </tr>
        </thead>
        <tbody>
          {musees.map((musee, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ ...tableCellStyle, fontWeight: 'bold', color: '#666' }}>{index + 1}</td> {/* Affichage du numéro */}
              <td style={tableCellStyle}>{musee.departement}</td>
              <td style={tableCellStyle}>{musee.commune}</td>
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
