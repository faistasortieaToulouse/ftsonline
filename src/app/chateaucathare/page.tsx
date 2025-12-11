// src/app/chateaucathare/page.tsx

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { ChateauType } from '../api/chateaucathare/route'; // Importe le type créé dans l'API

// --- Style pour les différents types de châteaux ---
const PIN_STYLE: Record<ChateauType['type'], google.maps.MarkerOptions['icon']> = {
  Emblematic: {
    // Les principaux, en rouge vif (ou une icône spécifique)
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: '#b30000',
    fillOpacity: 0.9,
    strokeWeight: 1,
    scale: 8,
  },
  Secondary: {
    // Les secondaires, en bleu ou gris
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: '#0066b3',
    fillOpacity: 0.8,
    strokeWeight: 0.5,
    scale: 6,
  },
};

// --- Composant Carte (Map) ---
const CatharMap: React.FC<{ chateaux: ChateauType[]; filters: { emblematic: boolean; secondary: boolean } }> = ({ chateaux, filters }) => {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<google.maps.Map | null>(null);
  const markersRef = React.useRef<google.maps.Marker[]>([]);

  // Filtre les châteaux à afficher en fonction des options sélectionnées
  const filteredChateaux = useMemo(() => {
    return chateaux.filter(chateau => {
      if (chateau.type === 'Emblematic' && filters.emblematic) return true;
      if (chateau.type === 'Secondary' && filters.secondary) return true;
      return false;
    });
  }, [chateaux, filters]);

  // Initialisation de la carte
  useEffect(() => {
    if (!mapRef.current) return;

    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      version: "weekly",
      libraries: ["marker"], // Assure que la bibliothèque de marqueurs est chargée
    });

    loader.load().then(() => {
      // Centre initial (Ariège/Aude)
      const center = { lat: 43.05, lng: 2.0 };
      
      const mapOptions: google.maps.MapOptions = {
        center: center,
        zoom: 9,
        mapId: "CATHAR_CASTLES_MAP", // Peut être utilisé pour personnaliser le style de carte
      };

      mapInstanceRef.current = new google.maps.Map(mapRef.current!, mapOptions);
    }).catch(e => console.error("Erreur de chargement de Google Maps:", e));

    // Nettoyage au démontage
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, []); // Exécuté une seule fois à la première charge

  // Mise à jour des marqueurs quand les filtres changent
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Supprime les anciens marqueurs
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Crée les nouveaux marqueurs
    filteredChateaux.forEach(chateau => {
      const marker = new google.maps.Marker({
        position: { lat: chateau.lat, lng: chateau.lng },
        map: map,
        title: `${chateau.name} (${chateau.type})`,
        icon: PIN_STYLE[chateau.type], // Utilise l'icône définie
      });
      
      // Ajoute une fenêtre d'information (InfoWindow)
      const infowindow = new google.maps.InfoWindow({
        content: `<div><strong>${chateau.name}</strong> (${chateau.city})<br/>Type: ${chateau.type}</div>`
      });

      marker.addListener("click", () => {
        infowindow.open(map, marker);
      });

      markersRef.current.push(marker);
    });

  }, [filteredChateaux]); // Dépend de la liste filtrée

  return <div ref={mapRef} style={{ height: '700px', width: '100%' }} aria-label="Carte des Châteaux Cathares" />;
};


// --- Composant Principal de la Page ---
export default function ChateauxCatharesPage() {
  const [chateaux, setChateaux] = useState<ChateauType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    emblematic: true,
    secondary: false,
  });

  // 1. Chargement des données via l'API locale
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/chateaucathare');
        const data: ChateauType[] = await response.json();
        setChateaux(data);
      } catch (error) {
        console.error("Erreur lors du chargement des données des châteaux:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleFilterChange = (type: 'emblematic' | 'secondary') => {
    setFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };
  
  const handleToggleAll = () => {
      const allActive = filters.emblematic && filters.secondary;
      if (allActive) {
          setFilters({ emblematic: false, secondary: false }); // Désactive tout si tout est actif
      } else {
          setFilters({ emblematic: true, secondary: true }); // Active tout
      }
  };


  if (loading) {
    return <div className="p-8">Chargement des données des châteaux...</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-4">🗺️ Les Châteaux Cathares</h1>
      
      {/* Contrôles de filtrage */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <span className="font-semibold">Afficher :</span>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filters.emblematic}
            onChange={() => handleFilterChange('emblematic')}
            className="form-checkbox text-red-600 h-5 w-5"
          />
          <span>Sites Emblématiques (Citadelles du Vertige)</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filters.secondary}
            onChange={() => handleFilterChange('secondary')}
            className="form-checkbox text-blue-600 h-5 w-5"
          />
          <span>Autres Forteresses Médiévales</span>
        </label>

        <button
            onClick={handleToggleAll}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-3 rounded text-sm"
        >
            {filters.emblematic && filters.secondary ? 'Désactiver tout' : 'Afficher tout'}
        </button>
      </div>

      {/* Affichage de la Carte */}
      <CatharMap chateaux={chateaux} filters={filters} />
      
      <p className="mt-4 text-sm text-gray-600">
        **NOTE :** Les coordonnées de cette carte sont fictives et doivent être remplacées par les coordonnées GPS précises pour chaque site. Les marqueurs rouges représentent les sites emblématiques, les bleus les secondaires.
      </p>
    </div>
  );
}

// NOTE: Pour que les classes Tailwind CSS (form-checkbox, text-red-600, etc.) fonctionnent, 
// assurez-vous que Tailwind CSS est configuré dans votre projet Next.js.
