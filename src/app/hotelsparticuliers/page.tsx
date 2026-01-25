'use client';

import { useEffect, useRef, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

interface Hotel {
  id: number;
  nom: string;
  adresse: string;
  profession_proprietaire: string;
  siecle: string;
  lat: number;
  lng: number;
}

export default function HotelsMapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // --- 1. Charger les données ---
  useEffect(() => {
    async function fetchHotels() {
      try {
        const res = await fetch('/api/hotelsparticuliers');
        if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
        const data = await res.json();
        setHotels(data);
      } catch (error) {
        console.error("Erreur chargement hôtels:", error);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchHotels();
  }, []);

  // --- 2. Initialisation de Leaflet (Méthode OTAN) ---
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData || hotels.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (mapInstance.current) return;

      // Centre sur le premier hôtel ou Toulouse par défaut
      const center: [number, number] = [hotels[0].lat || 43.6045, hotels[0].lng || 1.444];

      const map = L.map(mapRef.current).setView(center, 14);
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Ajout des marqueurs
      hotels.forEach((hotel, i) => {
        if (!hotel.lat || !hotel.lng) return;

        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: #3b82f6;
              width: 24px; height: 24px;
              border-radius: 50%; border: 2px solid white;
              display: flex; align-items: center; justify-content: center;
              color: white; font-weight: bold; font-size: 11px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              ${i + 1}
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([hotel.lat, hotel.lng], { icon: customIcon }).addTo(map);
        
        marker.bindPopup(`
          <div style="font-family: sans-serif;">
            <strong>${i + 1}. ${hotel.nom}</strong><br>
            <span style="font-size: 12px;">${hotel.adresse}</span><br>
            <hr style="margin: 5px 0;">
            <span style="font-size: 11px;">Propriétaire : ${hotel.profession_proprietaire}</span><br>
            <span style="font-size: 11px;">Siècle : ${hotel.siecle}ᵉ</span>
          </div>
        `);
      });

      // Correction de l'affichage
      setTimeout(() => {
        map.invalidateSize();
        setIsMapReady(true);
      }, 200);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isLoadingData, hotels]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-6">
        🗺️ Hôtels particuliers de Toulouse
      </h1>

      {/* ZONE CARTE */}
      <div
        style={{ height: '70vh', width: '100%' }}
        className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center relative z-0 overflow-hidden"
      >
        <div ref={mapRef} className="h-full w-full" />
        {(!isMapReady || isLoadingData) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
            <p className="text-gray-500 font-medium">Chargement de la carte…</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-semibold mb-4">
        Liste des hôtels ({hotels.length})
      </h2>

      {/* GRILLE DES HOTELS (Mise en page conservée) */}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hotels.map((h, i) => (
          <li key={h.id} className="p-4 border rounded bg-white shadow">
            <p className="text-lg font-bold">
              {i + 1}. {h.nom}
            </p>
            <p className="italic text-gray-600">{h.adresse}</p>
            <p className="mt-2 text-sm">Propriétaire : {h.profession_proprietaire}</p>
            <p className="text-sm">Siècle : {h.siecle}ᵉ</p>
          </li>
        ))}
      </ul>
    </div>
  );
}