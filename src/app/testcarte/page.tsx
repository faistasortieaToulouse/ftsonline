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

  // 1. Chargement des données depuis votre API
  useEffect(() => {
    fetch("/api/OTAN")
      .then(res => res.json())
      .then(json => {
        if (json.otan_membres) {
          // Tri alphabétique par pays
          const sorted = json.otan_membres.sort((a: MembreOTAN, b: MembreOTAN) => 
            a.pays.localeCompare(b.pays, 'fr')
          );
          setData({ ...json, otan_membres: sorted });
        }
      })
      .catch(console.error);
  }, []);

  // 2. Initialisation de Leaflet
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

      mapInstance.current = L.map(mapRef.current).setView([45, -20], 3);

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

  // 3. Ajout des marqueurs numérotés "OTAN"
  useEffect(() => {
    if (!isReady || !mapInstance.current || !data) return;

    const addMarkers = async () => {
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

          // Tooltip au survol
          marker.bindTooltip(`<strong>${p.pays}</strong>`, {
            direction: 'top',
            offset: [0, -10]
          });

          // Popup au clic
          marker.bindPopup(`
            <div style="font-family: sans-serif; min-width: 150px;">
              <strong style="font-size: 14px; color: #1e3a8a;">${p.pays}</strong><br>
              <p style="margin: 5px 0 0; font-size: 12px;">🏠 Capitale: ${p.capitale}</p>
              <p style="margin: 2px 0 0; font-size: 12px;">📅 Admission: ${p.date_admission}</p>
            </div>
          `);

          marker.addTo(mapInstance.current);
        }
      });
    };

    addMarkers();
  }, [isReady, data]);

  if (!data) return <div className="p-10 text-center animate-pulse">Chargement des membres de l'OTAN...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      
      {/* BARRE DE NAVIGATION / RETOUR */}
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Retour à l'Accueil
        </Link>
      </nav>

      <header className="mb-8 border-b-2 border-blue-900 pb-6">
        <h1 className="text-3xl md:text-5xl font-black text-blue-950 flex items-center gap-3">
          <Anchor size={36} className="text-blue-900" />
          {data.nom_liste}
        </h1>
        <p className="text-gray-600 mt-2 font-medium italic">
          Organisation du Traité de l'Atlantique Nord — {data.total} nations engagées
        </p>
      </header>

      {/* CARTE LEAFLET RESPONSIVE */}
      <div 
        ref={mapRef} 
        className="h-[40vh] md:h-[60vh] w-full mb-10 border-4 border-white shadow-2xl rounded-3xl bg-slate-200 overflow-hidden z-0" 
      />

      {/* GRILLE DES CARTES RESPONSIVE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {data.otan_membres.map((p, index) => (
          <div key={index} className="group relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:bg-blue-900 transition-all duration-300">
            {/* Numéro décoratif */}
            <span className="absolute top-2 right-4 text-4xl font-black text-slate-100 group-hover:text-blue-800 transition-colors">
              {(index + 1).toString().padStart(2, '0')}
            </span>
            
            <div className="relative z-10">
              <h3 className="font-bold text-blue-900 group-hover:text-white text-lg mb-1">{p.pays}</h3>
              <p className="text-xs text-slate-500 group-hover:text-blue-300 mb-4 uppercase tracking-widest">{p.capitale}</p>
              
              <div className="space-y-3">
                <div className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-bold inline-block group-hover:bg-blue-800 group-hover:text-blue-100">
                  DEPUIS : {p.date_admission}
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 group-hover:text-blue-200">
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
