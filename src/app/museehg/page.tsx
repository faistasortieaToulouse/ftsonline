// src/app/museehg/page.tsx
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
// Importe le type depuis la nouvelle API
import { MuseeHG as Musee } from '../api/museehg/route'; 
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

// Composant de la carte
const GoogleMap = ({ musees }: { musees: Musee[] }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.google || musees.length === 0) return;

    // Calculer le centre de la carte
    const centerLat = musees.reduce((sum, m) => sum + m.lat, 0) / musees.length;
    const centerLng = musees.reduce((sum, m) => sum + m.lng, 0) / musees.length;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: centerLat, lng: centerLng },
      zoom: 9, // Zoom initial pour la Haute-Garonne
      scrollwheel: true, // Zoom avec la molette de la souris
    });

    // Ajouter des marqueurs pour chaque musée
    musees.forEach((musee, index) => {
      // Le numéro du musée dans la liste (index + 1)
      const numero = index + 1;
      
      const marker = new window.google.maps.Marker({
        position: { lat: musee.lat, lng: musee.lng },
        map,
        title: `${numero}. ${musee.nom}`, // Afficher le numéro dans le titre du marqueur (au survol)
        // Correction : Ajout du label pour afficher le numéro sur le marqueur
        label: {
          text: String(numero),
          color: 'white',
          fontWeight: 'bold',
        }
      });

      const infowindow = new window.google.maps.InfoWindow({
        content: `
          <h3>${numero}. ${musee.nom}</h3>
          <p><strong>Commune :</strong> ${musee.commune}</p>
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
    // Assurez-vous que NEXT_PUBLIC_GOOGLE_MAPS_API_KEY est défini
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    // Attache la fonction initMap à la fenêtre globale
    window.initMap = initMap;
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [initMap]);

  return <div ref={mapRef} style={{ height: '500px', width: '100%', borderRadius: '8px', marginBottom: '32px' }} />;
};

// Styles pour le tableau
const tableHeaderStyle = { padding: '12px', borderBottom: '2px solid #ddd' };
const tableCellStyle = { padding: '12px' };


// Composant principal de la page
export default function MuseeHGPage() {
  const [musees, setMusees] = useState<Musee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMusees() {
      try {
        // Changement de l'URL d'appel API pour la Haute-Garonne
        const response = await fetch('/api/museehg'); 
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
        <h1>Musées de la Haute-Garonne (31)</h1>
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Musées de la Haute-Garonne (31)</h1>
        <p>Erreur : {error}</p>
        <p>Vérifiez que vous avez bien une clé Google Maps définie dans .env.local.</p>
      </div>
    );
  }

  const totalMusees = musees.length; 

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1>🏰 Musées de la Haute-Garonne (31)</h1>
      
      <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>
        Total de Musées listés : {totalMusees}
      </p>
      <p style={{ marginBottom: '20px', color: '#555' }}>Carte interactive et liste des lieux culturels.</p>

      {/* Carte Google Maps */}
      <GoogleMap musees={musees} />

      <h2>Liste Détaillée des Musées</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4' }}>
            {/* Nouvelle colonne pour le Numéro */}
            <th style={tableHeaderStyle}>N°</th> 
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
              {/* Affichage du numéro (index + 1) */}
              <td style={tableCellStyle}><strong>{index + 1}</strong></td> 
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
