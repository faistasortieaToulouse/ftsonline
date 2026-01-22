'use client';

import { useEffect, useRef, useState } from "react";
import 'leaflet/dist/leaflet.css';

interface EtatUSA {
  nom: string;
  genre: string;
  ordre_entree: number;
  date_entree: string;
  description: string;
}

export default function EtatsUSAPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);

  const [etats, setEtats] = useState<EtatUSA[]>([]);
  const [isReady, setIsReady] = useState(false);

  // --- Charger les données ---
  useEffect(() => {
    fetch("/api/EtatsUSA")
      .then(async (res) => {
        const data = await res.json();
        if (Array.isArray(data)) {
          setEtats(data);
        }
      })
      .catch(console.error);
  }, []);

  // --- Initialisation de Leaflet ---
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || mapInstance.current) return;

      // Import dynamique de Leaflet pour éviter "window is not defined"
      const L = (await import('leaflet')).default;

      // Correction des icônes par défaut
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      mapInstance.current = L.map(mapRef.current).setView([39.8283, -98.5795], 4);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      setIsReady(true);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // --- Gestion des Marqueurs (Geocoding Leaflet) ---
  useEffect(() => {
    if (!isReady || !mapInstance.current || etats.length === 0) return;

    const addMarkers = async () => {
      const L = (await import('leaflet')).default;

      etats.forEach(async (etat) => {
        try {
          const recherche = `${etat.nom}, USA`;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(recherche)}&limit=1`
          );
          const data = await response.json();

          if (data && data[0]) {
            const { lat, lon } = data[0];

            // Création du marqueur avec le numéro (Label style Google Maps)
            const customIcon = L.divIcon({
              className: 'custom-marker',
              html: `<div style="background-color:#2563eb; color:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-weight:bold; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3); font-size:10px;">${etat.ordre_entree}</div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });

            const marker = L.marker([parseFloat(lat), parseFloat(lon)], { icon: customIcon }).addTo(mapInstance.current);

            marker.bindPopup(`
              <div style="color: black; padding: 5px; font-family: sans-serif;">
                <strong>#${etat.ordre_entree} - ${etat.nom}</strong><br>
                <small>Entrée le : ${new Date(etat.date_entree).toLocaleDateString('fr-FR')}</small><br>
                <p style="margin-top:5px; font-size: 12px;">${etat.description}</p>
              </div>
            `);
          }
        } catch (error) {
          console.error("Erreur de géocodage:", error);
        }
      });
    };

    addMarkers();
  }, [isReady, etats]);

  return (
    <div className="p-4 max-w-7xl mx-auto font-sans">
      <header className="mb-8">
        <h1 className="text-4xl font-black text-blue-900 flex items-center gap-3">
          🇺🇸 Ordre d'entrée des États de l'Union
        </h1>
        <p className="text-gray-600 mt-2">Chronologie de la ratification de la Constitution</p>
      </header>

      {/* --- Carte Leaflet --- */}
      <div
        ref={mapRef}
        style={{ height: "60vh", width: "100%" }}
        className="mb-8 border-4 border-white shadow-2xl rounded-2xl bg-slate-100 overflow-hidden z-0"
      >
        {!isReady && (
          <div className="flex items-center justify-center h-full">
            <p className="animate-pulse font-bold text-blue-600">Initialisation de la carte Leaflet...</p>
          </div>
        )}
      </div>

      {/* --- Liste des États (Mise en page originale conservée) --- */}
      <h2 className="text-2xl font-bold mb-6 text-red-700">Palmarès Chronologique</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {etats.map((etat, i) => (
          <div key={i} className="p-5 border-l-4 border-blue-600 bg-white shadow-lg rounded-r-lg hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-3xl font-black text-slate-200">#{etat.ordre_entree}</span>
              <span className="text-xs font-bold uppercase p-1 bg-slate-100 text-slate-500 rounded">
                {etat.date_entree}
              </span>
            </div>
            <h3 className="text-xl font-bold text-blue-900 mt-2">{etat.nom}</h3>
            <p className="text-sm text-gray-700 mt-3 leading-relaxed">
              {etat.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
