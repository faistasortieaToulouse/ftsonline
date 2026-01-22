'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Anchor } from "lucide-react";

// On n'importe pas Leaflet ici car il a besoin de 'window'
interface MembreOTAN {
  pays: string;
  capitale: string;
  date_admission: string;
  population: number;
  lat: number;
  lng: number;
}

interface OTANData {
  nom_liste: string;
  total: number;
  otan_membres: MembreOTAN[];
}

export default function OTANPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [data, setData] = useState<OTANData | null>(null);
  const [isReady, setIsReady] = useState(false);

  // 1. Charger les données
  useEffect(() => {
    fetch("/api/OTAN")
      .then((res) => res.json())
      .then((json) => {
        if (json.otan_membres) setData(json);
      })
      .catch(console.error);
  }, []);

  // 2. Initialisation sécurisée de Leaflet
  useEffect(() => {
    // Empêche l'exécution côté serveur
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      // Import dynamique de Leaflet
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (mapInstance.current) return; // Évite les doubles initialisations

      // Correction icônes
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Création de la map
      mapInstance.current = L.map(mapRef.current).setView([45, -15], 3);

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

  // 3. Ajout des Marqueurs une fois que la map ET les données sont prêtes
  useEffect(() => {
    if (!isReady || !mapInstance.current || !data) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      
      data.otan_membres.forEach((p, index) => {
        if (p.lat && p.lng) {
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color:#1e3a8a; color:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-weight:bold; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3); font-size:10px;">${index + 1}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const marker = L.marker([p.lat, p.lng], { icon: customIcon });
          
          marker.bindTooltip(`<strong>${p.pays}</strong>`, { direction: 'top', offset: [0, -10] });
          
          marker.bindPopup(`
            <div style="color: black; font-family: sans-serif; min-width: 140px;">
              <strong style="font-size: 14px; color: #1e3a8a;">#${index + 1} - ${p.pays}</strong><br>
              <p style="font-size: 12px; margin: 5px 0 0;">🏠 ${p.capitale}</p>
              <p style="font-size: 11px; margin: 2px 0 0;">📅 ${p.date_admission}</p>
            </div>
          `);

          marker.addTo(mapInstance.current);
        }
      });
    };

    updateMarkers();
  }, [isReady, data]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8 border-b-2 border-blue-900 pb-6">
        <h1 className="text-3xl md:text-5xl font-black text-blue-950 flex items-center gap-4">
          <Anchor size={40} className="text-blue-900" />
          {data?.nom_liste || "Membres de l'OTAN"}
        </h1>
      </header>

      {/* CONTENEUR CARTE AVEC TAILLE FIXE INITIALE */}
      <div className="relative h-[45vh] md:h-[60vh] w-full mb-10 border-4 border-white shadow-xl rounded-3xl bg-slate-200 overflow-hidden z-0">
        <div ref={mapRef} className="h-full w-full" />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
              <p className="italic text-blue-900 font-bold">Chargement de la carte...</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {data?.otan_membres.map((p, index) => (
          <div key={index} className="group relative p-5 bg-white rounded-2xl shadow-sm border border-slate-200 hover:bg-blue-900 hover:border-blue-900 transition-all duration-300 flex gap-4">
            <span className="text-2xl font-black text-slate-200 group-hover:text-blue-400/50 transition-colors">
              {(index + 1).toString().padStart(2, '0')}
            </span>
            <div className="overflow-hidden">
              <h3 className="font-bold text-blue-900 group-hover:text-white text-lg transition-colors truncate">{p.pays}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 group-hover:text-blue-200 transition-colors">{p.capitale}</p>
              <p className="text-[11px] text-slate-500 group-hover:text-blue-100 mt-2">{p.date_admission}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
