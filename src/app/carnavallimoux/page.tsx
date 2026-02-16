'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mask } from "lucide-react"; // Import d'une icône plus festive
import 'leaflet/dist/leaflet.css';

interface LieuCarnaval {
  id: number;
  name: string;
  coords: [number, number];
  note: string;
}

export default function CarnavalLimouxPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [locations, setLocations] = useState<LieuCarnaval[]>([]);
  const [isReady, setIsReady] = useState(false);

  // 1. Récupération des données depuis votre API
  useEffect(() => {
    fetch("/api/carnavallimoux")
      .then(async (res) => {
        const data = await res.json();
        if (Array.isArray(data)) setLocations(data);
      })
      .catch(console.error);
  }, []);

  // 2. Initialisation de la carte Leaflet
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || mapInstance.current) return;
      const L = (await import('leaflet')).default;

      // Correction du chemin des icônes par défaut
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Centrage sur Limoux [43.05, 2.21] avec un zoom plus proche
      mapInstance.current = L.map(mapRef.current, {
        scrollWheelZoom: true,
        tap: true
      }).setView([42.98, 2.25], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
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

  // 3. Ajout des marqueurs numérotés et du tracé
  useEffect(() => {
    if (!isReady || !mapInstance.current || locations.length === 0) return;
    
    const addElements = async () => {
      const L = (await import('leaflet')).default;
      const markersGroup = L.featureGroup();

      locations.forEach((lieu) => {
        if (lieu.coords) {
          // Utilisation de l'ID pour le numéro dans le marqueur
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color:#991b1b; color:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-weight:bold; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3); font-size:10px;">${lieu.id}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const marker = L.marker(lieu.coords, { icon: customIcon });
          
          marker.bindTooltip(`<strong>${lieu.name}</strong>`, { 
            direction: 'top', 
            offset: [0, -10] 
          });

          marker.bindPopup(`
            <div style="color: black; padding: 2px; font-family: sans-serif; max-width: 200px;">
              <strong style="font-size: 14px; color: #991b1b;">#${lieu.id} - ${lieu.name}</strong><br>
              <p style="font-size: 12px; margin-top: 5px; line-height: 1.4;">${lieu.note || 'Lieu remarquable à découvrir.'}</p>
            </div>
          `);
          marker.addTo(markersGroup);
        }
      });

      // Tracé spécial Toulouse -> Limoux (ID 1 vers ID 2)
      const toulouse = locations.find(l => l.id === 1);
      const limoux = locations.find(l => l.id === 2);
      if (toulouse && limoux) {
        L.polyline([toulouse.coords, limoux.coords], {
          color: '#991b1b',
          weight: 3,
          dashArray: '10, 10',
          opacity: 0.6
        }).addTo(mapInstance.current);
      }

      markersGroup.addTo(mapInstance.current);
      // Ajuster la vue pour voir tous les points au chargement
      mapInstance.current.fitBounds(markersGroup.getBounds().pad(0.1));
    };
    addElements();
  }, [isReady, locations]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-stone-50 min-h-screen">
      
      <Link href="/" className="inline-flex items-center gap-2 text-red-700 hover:text-red-900 hover:underline mb-6 transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour à l'accueil
      </Link>

      <header className="mb-6 md:mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-black text-red-900 flex flex-wrap justify-center md:justify-start items-center gap-3">
          <span>🎭</span> Expédition Limoux
        </h1>
        <p className="text-stone-600 mt-2 italic text-sm md:text-base">
          De Toulouse au cœur du Carnaval : exploration de la Haute Vallée de l'Aude
        </p>
      </header>

      {/* CARTE */}
      <div
        ref={mapRef}
        className="h-[50vh] md:h-[65vh] w-full mb-10 border-4 border-white shadow-2xl rounded-3xl bg-stone-100 overflow-hidden z-0"
      >
        {!isReady && (
          <div className="flex items-center justify-center h-full bg-stone-50">
             <p className="animate-pulse font-bold text-red-700">Chargement de la carte audoise...</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold text-stone-800 uppercase tracking-tight">Lieux d'intérêt</h2>
        <div className="h-px flex-1 bg-stone-200"></div>
      </div>

      {/* GRILLE DES LIEUX */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((lieu) => (
          <div 
            key={lieu.id} 
            className="group p-6 border-l-4 border-red-700 bg-white shadow-md rounded-r-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-4xl font-black text-stone-100 group-hover:text-red-50">#{lieu.id}</span>
              <span className="text-[10px] font-bold px-3 py-1 bg-red-50 text-red-700 rounded-full uppercase">
                Aude (11)
              </span>
            </div>
            <h3 className="text-xl font-bold text-stone-900">{lieu.name}</h3>
            <p className="text-sm text-gray-600 mt-2 line-clamp-3">
              {lieu.note || "Découvrez ce site exceptionnel situé dans l'arrière-pays de Limoux, entre montagnes et abbayes."}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
