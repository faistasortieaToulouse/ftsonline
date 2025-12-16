// src/app/museepo/page.tsx
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Musee } from '../api/museepo/route';

// Déclaration pour que TypeScript reconnaisse google.maps
declare global {
  interface Window {
    initMap: () => void;
    google: typeof google;
  }
}

// Composant de la carte (Basé sur la méthode simple de chargement de script)
const GoogleMap = ({ musees }: { musees: Musee[] }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.google) return;

    // Calculer le centre de la carte (Moyenne des coordonnées)
    const centerLat = musees.reduce((sum, m) => sum + m.lat, 0) / musees.length;
    const centerLng = musees.reduce((sum, m) => sum + m.lng, 0) / musees.length;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: centerLat, lng: centerLng },
      zoom: 9, // Zoom pour couvrir les Pyrénées-Orientales
    });

    // Ajouter des marqueurs pour chaque musée
    musees.forEach((musee) => {
      const marker = new window.google.maps.Marker({
        position: { lat: musee.lat, lng: musee.lng },
        map,
        title: musee.nom,
      });

      const infowindow = new window.google.maps.InfoWindow({
        content: `
          <h3>${musee.nom}</h3>
          <p><strong>Catégorie :</strong> ${musee.categorie}</p>
          <p><strong>Adresse :</strong> ${musee.adresse}</p>
          <p><a href="${musee.url}" target="_blank">Site web</a></p>
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    // Attache la fonction initMap à la fenêtre globale
    window.initMap = initMap;
    document.head.appendChild(script);

    // Nettoyage lors du démontage du composant
    return () => {
      script.remove();
      // On peut aussi enlever window.initMap mais c'est moins critique
    };
  }, [initMap]);

  return <div ref={mapRef} style={{ height: '500px', width: '100%', borderRadius: '8px', marginBottom: '32px' }} />;
};

// Composant principal de la page
export default function MuseePOPage() {
  const [musees, setMusees] = useState<Musee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMusees() {
      try {
        const response = await fetch('/api/museepo');
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données de l'API.");
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

  if (isLoading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Musées des Pyrénées-Orientales (66)</h1>
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Musées des Pyrénées-Orientales (66)</h1>
        <p>Erreur : {error}</p>
        <p>Vérifiez que vous avez bien une clé Google Maps définie dans .env.local.</p>
      </div>
    );
  }

  // --- NOUVELLE LOGIQUE AJOUTÉE ICI ---
  const totalMusees = musees.length; 
  // ------------------------------------

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🗺️ Musées des Pyrénées-Orientales (66)</h1>
      {/* AFFICHAGE DU COMPTEUR TOTAL */}
      <p style={{ marginBottom: '20px', color: '#555' }}>
        **Total de Musées listés : {totalMusees}**
      </p>
      <p style={{ marginBottom: '20px', color: '#555' }}>Carte interactive et liste des lieux culturels.</p>

      {/* Carte Google Maps */}
      <GoogleMap musees={musees} />

      <h2>Liste Détaillée des Musées</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4' }}>
            <th style={tableHeaderStyle}>Commune</th>
            <th style={tableHeaderStyle}>Nom du Musée</th>
            <th style={tableHeaderStyle}>Catégorie</th>
            <th style={tableHeaderStyle}>Adresse</th>
            <th style={tableHeaderStyle}>URL</th>
          </tr>
        </thead>
        <tbody>
          {musees.map((musee, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
              <td style={tableCellStyle}>{musee.commune}</td>
              <td style={tableCellStyle}>{musee.nom}</td>
              <td style={tableCellStyle}>{musee.categorie}</td>
              <td style={tableCellStyle}>{musee.adresse}</td>
              <td style={tableCellStyle}>
                <a 
                  href={musee.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ color: 'blue', textDecoration: 'underline' }} // Style en bleu
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

const tableHeaderStyle = { padding: '12px', borderBottom: '2px solid #ddd' };
const tableCellStyle = { padding: '12px' };
