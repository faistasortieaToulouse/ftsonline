// src/app/museeaveyron/page.tsx
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
// Importation du type MuseeAveyron depuis la route API
import { Musee as MuseeAveyron } from '../api/museeaveyron/route'; 

// Déclaration pour que TypeScript reconnaisse google.maps
declare global {
  interface Window {
    initMap: () => void;
    google: typeof google;
  }
}

// Styles pour le tableau
const tableHeaderStyle: React.CSSProperties = { 
  padding: '12px', 
  borderBottom: '2px solid #ddd',
  backgroundColor: '#f4f4f4'
};
const tableCellStyle: React.CSSProperties = { padding: '12px' };

// Composant de la carte (Basé sur la méthode simple de chargement de script)
const GoogleMap = ({ musees }: { musees: MuseeAveyron[] }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.google || musees.length === 0) return;

    // Calculer le centre de la carte (Moyenne des coordonnées)
    const centerLat = musees.reduce((sum, m) => sum + m.lat, 0) / musees.length;
    const centerLng = musees.reduce((sum, m) => sum + m.lng, 0) / musees.length;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: centerLat, lng: centerLng },
      zoom: 9, // Zoom pour couvrir l'Aveyron
      scrollwheel: true, // Permet le zoom avec la molette de la souris
    });

    // Ajouter des marqueurs pour chaque musée
    const museesTriesPourMarqueur = [...musees].sort((a, b) => a.commune.localeCompare(b.commune));

    museesTriesPourMarqueur.forEach((musee, index) => {
      const numero = index + 1; // Numéro du musée dans la liste triée
      
      const marker = new window.google.maps.Marker({
        position: { lat: musee.lat, lng: musee.lng },
        map,
        title: `${numero}. ${musee.nom}`, 
        label: {
          text: String(numero),
          color: 'white', 
          fontWeight: 'bold', 
        }
      });

      // Construction du contenu de l'infowindow
      const urlContent = musee.url ? 
        `<p><a href="${musee.url}" target="_blank">Site web</a></p>` :
        `<p><em>Site web non disponible</em></p>`;

      const infowindow = new window.google.maps.InfoWindow({
        content: `
          <h3>${numero}. ${musee.nom}</h3>
          <p><strong>Commune :</strong> ${musee.commune}</p>
          <p><strong>Catégorie :</strong> ${musee.categorie}</p>
          <p><strong>Adresse :</strong> ${musee.adresse}</p>
          ${urlContent}
        `,
      });

      marker.addListener('click', () => {
        infowindow.open(map, marker);
      });
    });
  }, [musees]);

  useEffect(() => {
    // Vérifie si l'API Google Maps est déjà chargée
    if (window.google && window.google.maps) {
      initMap();
      return;
    }

    // Charge dynamiquement le script de l'API Google Maps
    const script = document.createElement('script');
    // Assurez-vous que NEXT_PUBLIC_GOOGLE_MAPS_API_KEY est défini dans .env.local
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    // Attache la fonction initMap à la fenêtre globale
    window.initMap = initMap;
    document.head.appendChild(script);

    // Nettoyage lors du démontage du composant
    return () => {
      script.remove();
    };
  }, [initMap]);

  return <div ref={mapRef} style={{ height: '500px', width: '100%', borderRadius: '8px', marginBottom: '32px' }} />;
};


// Composant principal de la page
export default function MuseeAveyronPage() {
  const [musees, setMusees] = useState<MuseeAveyron[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMusees() {
      try {
        const response = await fetch('/api/museeaveyron');
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données de l'API pour l'Aveyron.");
        }
        const data: MuseeAveyron[] = await response.json();
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

  if (isLoading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Musées de l'Aveyron (12)</h1>
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Musées de l'Aveyron (12)</h1>
        <p>Erreur : {error}</p>
        <p>Vérifiez que vous avez bien une clé Google Maps définie dans .env.local et que l'API /api/museeaveyron est fonctionnelle.</p>
      </div>
    );
  }

  const museesTries = [...musees].sort((a, b) => a.commune.localeCompare(b.commune));
  const totalMusees = museesTries.length; 

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🐑 Musées et Patrimoine de l'Aveyron (12)</h1>
      
      <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>
        Total de lieux culturels listés : {totalMusees}
      </p>
      <p style={{ marginBottom: '20px', color: '#555' }}>Carte interactive et liste des sites du patrimoine aveyronnais.</p>

      {/* Carte Google Maps */}
      <GoogleMap musees={museesTries} />

      <h2>Liste Détaillée des Sites</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4' }}>
            <th style={tableHeaderStyle}>N°</th> {/* Colonne Numéro */}
            <th style={tableHeaderStyle}>Commune</th>
            <th style={tableHeaderStyle}>Nom du Site/Musée</th>
            <th style={tableHeaderStyle}>Catégorie</th>
            <th style={tableHeaderStyle}>Adresse</th>
            <th style={tableHeaderStyle}>URL</th>
          </tr>
        </thead>
        <tbody>
          {museesTries.map((musee, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
              <td style={tableCellStyle}><strong>{index + 1}</strong></td> {/* Affichage du numéro */}
              <td style={tableCellStyle}>{musee.commune}</td>
              <td style={tableCellStyle}>{musee.nom}</td>
              <td style={tableCellStyle}>{musee.categorie}</td>
              <td style={tableCellStyle}>{musee.adresse}</td>
              <td style={tableCellStyle}>
                {musee.url ? (
                  <a 
                    href={musee.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ color: '#6a5acd', textDecoration: 'underline' }} 
                  >
                    Voir le site
                  </a>
                ) : (
                  <span style={{ color: '#aaa' }}>N/A</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
