'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Anchor } from "lucide-react";
import 'leaflet/dist/leaflet.css';

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

  // --- 1. Charger les données ---
  useEffect(() => {
    fetch("/api/OTAN")
      .then((res) => res.json())
      .then((json) => {
        if (json.otan_membres) {
          // Tri par date d'admission (optionnel) ou par nom
          const sorted = json.otan_membres.sort((a: MembreOTAN, b: MembreOTAN) => 
            a.pays.localeCompare(b.pays, 'fr')
          );
          setData({ ...json, otan_membres: sorted });
        }
      })
      .catch(console.error);
  }, []);

  // --- 2. Initialisation de Leaflet ---
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || mapInstance.current) return;
      const L = (await import('leaflet')).default;

      // Correction icônes par défaut
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      mapInstance.current = L.map(mapRef.current, {
        scrollWheelZoom: true,
      }).setView([45, -10], 3); // Centré Atlantique Nord

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

  // --- 3. Ajout des Marqueurs Numérotés ---
  useEffect(() => {
    if (!isReady || !mapInstance.current || !data) return;

    const addMarkers = async () => {
      const L = (await import('leaflet')).default;
      
      // Nettoyage des anciens marqueurs
      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) mapInstance.current.removeLayer(layer);
      });

      data.otan_membres.forEach((p, index) => {
        if (p.lat && p.lng) {
          // Style Bleu OTAN
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color:#1e3a8a; color:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-weight:bold; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3); font-size:10px;">${index + 1}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const marker = L.marker([p.lat, p.lng], { icon: customIcon });

          // Survol (Tooltip)
          marker.bindTooltip(`<strong>${p.pays}</strong>`, {
            direction: 'top',
            offset: [0, -10],
            opacity: 0.9
          });
          
          // Clic (Popup)
          marker.bindPopup(`
            <div style="color: black; font-family: sans-serif; min-width: 180px; padding: 5px;">
              <strong style="font-size: 16px; color: #1e3a8a;">${p.pays}</strong><br>
              <div style="margin-top: 5px; font-size: 13px;">
                🏠 Capitale: <b>${p.capitale}</b><br>
                📅 Admission: ${p.date_admission}<br>
                👥 Pop: ${p.population.toLocaleString()}
              </div>
            </div>
          `);

          marker.addTo(mapInstance.current);
        }
      });
    };

    addMarkers();
  }, [isReady, data]);

  if (!data) return <div className="p-10 text-center animate-pulse">Chargement des données OTAN...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      
      {/* BOUTON RETOUR */}
      <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-semibold mb-6 transition-all group">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour à l'accueil
      </Link>

      <header className="mb-8 border-b-4 border-blue-900 pb-6">
        <h1 className="text-3xl md:text-5xl font-black text-blue-950 flex items-center gap-4">
          <Anchor size={40} className="text-blue-900" />
          {data.nom_liste.toUpperCase()}
        </h1>
        <p className="text-gray-600 mt-2 font-medium">
          Alliance politique et militaire transatlantique — <span className="text-blue-800">{data.total} nations membres</span>
        </p>
      </header>

      {/* CARTE RESPONSIVE */}
      <div
        ref={mapRef}
        className="h-[45vh] md:h-[60vh] w-full mb-10 border-4 border-white shadow-xl rounded-3xl bg-slate-200 overflow-hidden z-0"
      />

      {/* GRILLE DES MEMBRES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {data.otan_membres.map((p, index) => (
          <div 
            key={p.pays} 
            className="group relative p-5 bg-white rounded-2xl shadow-sm border border-slate-200 hover:bg-blue-900 hover:border-blue-900 transition-all duration-300 overflow-hidden"
          >
            {/* Numéro en arrière-plan */}
            <span className="absolute -right-2 -bottom-4 text-6xl font-black text-slate-100 group-hover:text-blue-800/40 transition-colors pointer-events-none">
              {index + 1}
            </span>

            <div className="relative z-10">
              <h3 className="font-bold text-blue-900 group-hover:text-white text-xl mb-1 truncate">
                {p.pays}
              </h3>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-500 group-hover:text-blue-300 mb-4">
                {p.capitale}
              </p>
              
              <div className="space-y-2">
                <div className="text-[11px] bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-bold inline-block group-hover:bg-blue-800 group-hover:text-blue-100 transition-colors">
                  Admis en {p.date_admission.split(' ').pop()}
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 group-hover:text-blue-200 pt-2">
                  <span>Population</span>
                  <span className="font-bold">{p.population.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
