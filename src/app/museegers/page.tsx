// src/app/museegers/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { GoogleMap, useLoadScript, MarkerF, InfoWindowF } from '@react-google-maps/api';

// Définition de type pour le musée (doit correspondre à l'interface de l'API)
interface MuseeGers {
  commune: string;
  nom: string;
  categorie: string;
  adresse: string;
  url: string;
  lat: number;
  lng: number;
}

// Options de la carte pour le centre (Auch, la préfecture)
const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const center = {
  lat: 43.6450, // Latitude d'Auch
  lng: 0.5850,  // Longitude d'Auch
};

const defaultZoom = 9; // Zoom pour couvrir la majeure partie du département

// Fonction principale du composant de la page
const MuseeGersPage: React.FC = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string, // Assurez-vous que cette clé est définie
  });

  const [musees, setMusees] = useState<MuseeGers[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMusee, setSelectedMusee] = useState<MuseeGers | null>(null);

  // Chargement des données des musées depuis l'API locale
  useEffect(() => {
    const fetchMusees = async () => {
      try {
        const response = await fetch('/api/museegers');
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        setMusees(data);
      } catch (error) {
        console.error('Erreur lors du chargement des musées du Gers :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMusees();
  }, []);

  if (loadError) {
    return <div>Erreur lors du chargement de Google Maps.</div>;
  }

  if (loading) {
    return <div>Chargement des données...</div>;
  }

  const handleMarkerClick = (musee: MuseeGers) => {
    setSelectedMusee(musee);
  };

  const handleListClick = (musee: MuseeGers) => {
    // Centre la carte sur le musée sélectionné (non implémenté ici pour simplicité, mais peut être fait avec une référence à la carte)
    setSelectedMusee(musee);
  };

  const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
  };

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-indigo-800">🏛️ Musées et Patrimoine du Gers (32)</h1>
        <p className="text-xl text-indigo-600 mt-2">Découvrez les sites culturels, historiques et artistiques du département.</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne de la Carte */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-700">Carte des Musées</h2>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={defaultZoom}
              options={mapOptions}
            >
              {musees.map((musee, index) => (
                <MarkerF
                  key={index}
                  position={{ lat: musee.lat, lng: musee.lng }}
                  onClick={() => handleMarkerClick(musee)}
                />
              ))}

              {selectedMusee && (
                <InfoWindowF
                  position={{ lat: selectedMusee.lat, lng: selectedMusee.lng }}
                  onCloseClick={() => setSelectedMusee(null)}
                >
                  <div className="p-2">
                    <h3 className="font-bold text-md text-indigo-800">{selectedMusee.nom}</h3>
                    <p className="text-sm">{selectedMusee.commune} ({selectedMusee.categorie})</p>
                    {selectedMusee.url && (
                      <a 
                        href={selectedMusee.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-indigo-500 hover:text-indigo-700 text-sm mt-1 inline-block"
                      >
                        Voir le site
                      </a>
                    )}
                  </div>
                </InfoWindowF>
              )}
            </GoogleMap>
          ) : (
            <div>Chargement de la carte...</div>
          )}
        </div>

        {/* Colonne de la Liste */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-700">Liste des Sites ({musees.length})</h2>
          <div className="max-h-[600px] overflow-y-auto pr-2">
            <ul className="space-y-3">
              {musees
                .sort((a, b) => a.commune.localeCompare(b.commune))
                .map((musee, index) => (
                  <li 
                    key={index} 
                    className={`p-3 border rounded-lg shadow-sm cursor-pointer transition-all ${
                      selectedMusee?.nom === musee.nom ? 'bg-indigo-100 border-indigo-500' : 'bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => handleListClick(musee)}
                  >
                    <div className="font-semibold text-indigo-800">{musee.nom}</div>
                    <div className="text-sm text-gray-600">{musee.commune}</div>
                    <div className="text-xs text-gray-400">Catégorie: {musee.categorie}</div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MuseeGersPage;
