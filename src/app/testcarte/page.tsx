'use client';

import { useEffect, useRef, useState } from "react";
// Importation du CSS de Leaflet obligatoirement ici
import 'leaflet/dist/leaflet.css';

interface EtatUSA {
  nom: string;
  ordre_entree: number;
  date_entree: string;
  description: string;
}

export default function EtatsUSAPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null); // On utilise any pour éviter les conflits de types au début
  const [etats, setEtats] = useState<EtatUSA[]>([]);
  const [isReady, setIsReady] = useState(false);

  // 1. Charger les données
  useEffect(() => {
    fetch("/api/EtatsUSA")
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setEtats(data); })
      .catch(console.error);
  }, []);

  // 2. Initialiser Leaflet UNIQUEMENT côté client
  useEffect(() => {
    // Import dynamique de Leaflet pour éviter l'erreur "window is not defined"
    const initMap = async () => {
      if (!mapRef.current || mapInstance.current) return;

      const L = (await import('leaflet')).default;

      // Correction pour les icônes par défaut de Leaflet qui buggent souvent avec Webpack/Next
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      mapInstance.current = L.map(mapRef.current).setView([39.8283, -98.5795], 4);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);

      setIsReady(true);
    };

    initMap();

    // Nettoyage au démontage du composant
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 3. Ajouter les marqueurs
  useEffect(() => {
    if (!isReady || etats.length === 0) return;

    const addMarkers = async () => {
      const L = (await import('leaflet')).default;

      etats.forEach(async (etat) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(etat.nom + ", USA")}&limit=1`);
          const data = await res.json();

          if (data && data[0]) {
            const customIcon = L.divIcon({
              className: '',
              html: `<div style="background:#2563eb;color:white;border-radius:50%;width:25px;height:25px;display:flex;align-items:center;justify-content:center;font-weight:bold;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);font-size:11px;">${etat.ordre_entree}</div>`,
              iconSize: [25, 25],
              iconAnchor: [12, 12]
            });

            L.marker([parseFloat(data[0].lat), parseFloat(data[0].lon)], { icon: customIcon })
              .addTo(mapInstance.current)
              .bindPopup(`<b>#${etat.ordre_entree} - ${etat.nom}</b><br>${etat.description}`);
          }
        } catch (e) { console.error(e); }
      });
    };

    addMarkers();
  }, [isReady, etats]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">🇺🇸 États de l'Union</h1>
      
      {/* Conteneur de la carte : l'ID ou la REF est cruciale */}
      <div 
        ref={mapRef} 
        className="h-[500px] w-full rounded-xl shadow-lg border-2 border-gray-200 z-0 mb-8"
        style={{ minHeight: '500px' }} // Sécurité pour l'affichage
      />

      {/* Tableau en dessous */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Rang</th>
              <th className="p-3 text-left">Nom</th>
            </tr>
          </thead>
          <tbody>
            {etats.map((e, i) => (
              <tr key={i} className="border-t">
                <td className="p-3 font-bold">#{e.ordre_entree}</td>
                <td className="p-3">{e.nom}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
