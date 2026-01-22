'use client';

import { useEffect, useRef, useState } from "react";
// Importation dynamique de Leaflet pour éviter les erreurs SSR
import L from 'leaflet';
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
  const mapInstance = useRef<L.Map | null>(null);
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
    if (!mapRef.current || mapInstance.current) return;

    // Création de la carte
    mapInstance.current = L.map(mapRef.current).setView([39.8283, -98.5795], 4);

    // Ajout de la couche OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    setIsReady(true);
  }, []);

  // --- Ajout des Marqueurs avec Géocodage ---
  useEffect(() => {
    if (!isReady || !mapInstance.current || etats.length === 0) return;

    etats.forEach(async (etat) => {
      try {
        // Utilisation de Nominatim pour transformer le nom en coordonnées
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(etat.nom + ", USA")}&limit=1`
        );
        const results = await response.json();

        if (results && results.length > 0) {
          const { lat, lon } = results[0];

          // Création d'un marqueur personnalisé pour ressembler au label Google Maps
          const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `
              <div style="
                background-color: #2563eb; 
                color: white; 
                border-radius: 50%; 
                width: 24px; 
                height: 24px; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                font-weight: bold; 
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                font-size: 10px;">
                ${etat.ordre_entree}
              </div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const popupContent = `
            <div style="color: black; padding: 5px; font-family: sans-serif;">
              <strong>#${etat.ordre_entree} - ${etat.nom}</strong><br>
              <small>Entrée le : ${new Date(etat.date_entree).toLocaleDateString('fr-FR')}</small><br>
              <p style="margin-top:5px; font-size: 12px; line-height: 1.4;">${etat.description}</p>
            </div>
          `;

          L.marker([parseFloat(lat), parseFloat(lon)], { icon: customIcon })
            .addTo(mapInstance.current!)
            .bindPopup(popupContent);
        }
      } catch (error) {
        console.error(`Erreur géocodage pour ${etat.nom}:`, error);
      }
    });
  }, [isReady, etats]);

  return (
    <div className="p-4 max-w-7xl mx-auto font-sans">
      <header className="mb-8">
        <h1 className="text-4xl font-black text-blue-900 flex items-center gap-3">
          🇺🇸 Ordre d'entrée des États de l'Union
        </h1>
        <p className="text-gray-600 mt-2">Chronologie de la ratification de la Constitution</p>
      </header>

      {/* --- Carte --- */}
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

      {/* --- Tableau / Liste des États --- */}
      <h2 className="text-2xl font-bold mb-6 text-red-700">Palmarès Chronologique</h2>

      <div className="overflow-x-auto mb-12 shadow-xl rounded-xl border border-gray-200">
        <table className="w-full text-left bg-white">
          <thead className="bg-blue-900 text-white font-bold">
            <tr>
              <th className="p-4">Rang</th>
              <th className="p-4">État</th>
              <th className="p-4">Date d'entrée</th>
              <th className="p-4 hidden md:table-cell">Description</th>
            </tr>
          </thead>
          <tbody>
            {etats.map((etat, i) => (
              <tr key={i} className="border-b hover:bg-blue-50 transition-colors">
                <td className="p-4 font-black text-blue-600">#{etat.ordre_entree}</td>
                <td className="p-4 font-bold text-gray-800">{etat.nom}</td>
                <td className="p-4 text-sm text-gray-600">{new Date(etat.date_entree).toLocaleDateString('fr-FR')}</td>
                <td className="p-4 text-sm text-gray-600 hidden md:table-cell">{etat.description.substring(0, 100)}...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Grilles de cartes originales conservées --- */}
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
