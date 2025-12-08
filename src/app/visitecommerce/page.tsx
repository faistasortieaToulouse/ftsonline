'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { GoogleMap, LoadScript, MarkerF } from '@react-google-maps/api';

// Interface pour les données brutes (depuis l'API)
interface CommercePlace {
  nomLieu: string;
  num: string;
  typeRue: string;
  nomRue: string;
  quartier: string;
  établissement: string;
  commentaire: string;
}

// Interface pour les données avec coordonnées (prêtes pour la carte)
interface MappedPlace extends CommercePlace {
    lat: number;
    lng: number;
}

// Configuration de la carte
const containerStyle = {
  width: '100%',
  height: '700px'
};

const TOULOUSE_CENTER = {
  lat: 43.6047, // Coordonnées approximatives de Toulouse
  lng: 1.4442
};

// --- Composant principal ---
const VisiteCommercePage: React.FC = () => {
  const [places, setPlaces] = useState<MappedPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_KEY = useMemo(() => process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'VOTRE_CLE_API_GOOGLE_MAPS', []);

  useEffect(() => {
    const fetchAndGeocodePlaces = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 1. Récupérer les données depuis l'API locale
        const response = await fetch('/api/visitecommerce');
        if (!response.ok) {
          throw new Error(`Erreur lors de la récupération des données: ${response.statusText}`);
        }
        const rawPlaces: CommercePlace[] = await response.json();

        // On utilise l'API de géocodage pour convertir les adresses en lat/lng
        const geocoder = new google.maps.Geocoder();
        const geocodePromises = rawPlaces.map(async (place) => {
          const address = `${place.num} ${place.typeRue} ${place.nomRue}, Toulouse`;
          
          try {
            const result = await geocoder.geocode({ address });
            if (result.results.length > 0) {
              const location = result.results[0].geometry.location;
              return {
                ...place,
                lat: location.lat(),
                lng: location.lng(),
              } as MappedPlace;
            } else {
              console.warn(`Adresse non trouvée pour: ${address}`);
              return null; // Ignore les lieux qui ne peuvent pas être géocodés
            }
          } catch (e) {
            console.error(`Erreur de géocodage pour ${address}:`, e);
            return null;
          }
        });

        const mappedPlaces = (await Promise.all(geocodePromises)).filter((p): p is MappedPlace => p !== null);
        setPlaces(mappedPlaces);
        
      } catch (e) {
        console.error("Erreur complète:", e);
        setError(e instanceof Error ? e.message : "Une erreur inconnue s'est produite.");
      } finally {
        setLoading(false);
      }
    };

    // Assurez-vous que l'API de géocodage est chargée avant de l'utiliser
    if (typeof window !== 'undefined' && API_KEY && API_KEY !== 'VOTRE_CLE_API_GOOGLE_MAPS') {
        // On exécute le fetch et géocodage uniquement si l'API est chargée ou que c'est un client
        fetchAndGeocodePlaces();
    } else if (API_KEY === 'VOTRE_CLE_API_GOOGLE_MAPS') {
        setError("Veuillez remplacer 'VOTRE_CLE_API_GOOGLE_MAPS' par votre clé API Google Maps.");
        setLoading(false);
    }
  }, [API_KEY]);

  if (loading) return <p>Chargement des données et géocodage des adresses...</p>;
  if (error) return <p>Erreur: {error}</p>;

  // Le composant Map ne doit être rendu que si les données sont prêtes
  return (
    <div style={{ padding: '20px' }}>
      <h1>Carte des Commerces et Lieux</h1>
      <p>Affichage de {places.length} lieu(x) sur la carte.</p>

      <LoadScript googleMapsApiKey={API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={TOULOUSE_CENTER}
          zoom={14}
        >
          {places.map((place, index) => (
            <MarkerF
              key={index}
              position={{ lat: place.lat, lng: place.lng }}
              title={place.nomLieu}
              onClick={() => {
                alert(`Lieu: ${place.nomLieu}\nAdresse: ${place.num} ${place.typeRue} ${place.nomRue}\nType: ${place.établissement} (${place.commentaire})`);
              }}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default VisiteCommercePage;
