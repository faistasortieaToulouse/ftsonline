'use client';

import { useEffect, useRef, useState } from 'react';
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Quartier {
  id: number;
  nom: string;
  lat: number;
  lng: number;
}

export default function QuartiersToulouseMapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const [quartiers, setQuartiers] = useState<Quartier[]>([]);
  const [isReady, setIsReady] = useState(false);

  // --- 1. Charger les données ---
  useEffect(() => {
    fetch('/api/quartiertoulouse')
      .then(res => res.json())
      .then(data => setQuartiers(data))
      .catch(console.error);
  }, []);

  // --- 2. Initialisation de la carte (Méthode OTAN) ---
  useEffect(() => {
    // Empêche l'exécution côté serveur (Next.js)
    if (typeof window === "undefined" || !mapRef.current || quartiers.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      if (!mapInstance.current) {
        // Centrer sur Toulouse par défaut
        const toulouseCenter: [number, number] = [43.6045, 1.444];
        
        mapInstance.current = L.map(mapRef.current!).setView(toulouseCenter, 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance.current);

        // Création d'un groupe pour les marqueurs
        markersLayerRef.current = L.layerGroup().addTo(mapInstance.current);
      }

      // Nettoyer les anciens marqueurs si les données changent
      markersLayerRef.current.clearLayers();

      // Ajouter les markers Leaflet
      quartiers.forEach((quartier, i) => {
        if (typeof quartier.lat !== 'number' || typeof quartier.lng !== 'number') return;

        const numero = i + 1;

        // Icône personnalisée avec numéro
        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="
            background-color: #2563eb; 
            color: white; 
            width: 24px; height: 24px; 
            border-radius: 50%; 
            display: flex; align-items: center; justify-content: center; 
            font-size: 11px; font-weight: bold; 
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">${numero}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const popupContent = `
          <div style="font-family: sans-serif;">
            <strong>${numero}. ${quartier.nom}</strong><br>
            Quartier n°${quartier.id}
          </div>
        `;

        L.marker([quartier.lat, quartier.lng], { icon: customIcon })
          .addTo(markersLayerRef.current)
          .bindPopup(popupContent);
      });

      setIsReady(true);
    };

    initMap();

    // Nettoyage au démontage
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [quartiers]);

  return (
    <div className="p-4 max-w-7xl mx-auto bg-gray-50 min-h-screen">

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-6 text-slate-800">
        🗺️ Quartiers de Toulouse sur la carte
      </h1>

      {/* ZONE CARTE */}
      <div
        style={{ height: '70vh', width: '100%', zIndex: 0 }}
        className="mb-8 border-2 border-white rounded-xl bg-gray-100 shadow-lg relative overflow-hidden"
      >
        <div ref={mapRef} className="h-full w-full" />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <p className="animate-pulse font-semibold text-gray-500">Chargement de la carte…</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-6 text-slate-700">
        Liste des quartiers ({quartiers.length})
      </h2>

      {/* MISE EN PAGE LISTE CONSERVÉE */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {quartiers.map((q, i) => (
          <li key={q.id} className="p-4 border border-gray-100 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-1">
              Quartier n°{q.id}
            </div>
            <div className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                {i + 1}
              </span>
              {q.nom}
            </div>
            <div className="mt-2 text-xs font-mono text-gray-400">
              {q.lat.toFixed(4)}, {q.lng.toFixed(4)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}