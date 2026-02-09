'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
// Importation du CSS à l'extérieur pour garantir sa disponibilité
import "leaflet/dist/leaflet.css";

interface PaysEurope {
  nom: string;
  nom_long: string;
  ue: boolean;
  noms_originaux: string;
  capitale: string;
  population: string;
  superficie: string;
  lat: number;
  lng: number;
}

interface EuropeData {
  nom_liste: string;
  total: number;
  pays_europe: PaysEurope[];
}

export default function EuropePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [data, setData] = useState<EuropeData | null>(null);
  const [isReady, setIsReady] = useState(false);

  // 1. Chargement des données
  useEffect(() => {
    fetch("/api/europe")
      .then((res) => res.json())
      .then((json) => {
        if (json.pays_europe) setData(json);
      })
      .catch(console.error);
  }, []);

  // 2. Initialisation de la carte et des marqueurs
  useEffect(() => {
    // On n'exécute QUE si on a le DOM (mapRef) et les DONNÉES (data)
    if (typeof window === "undefined" || !mapRef.current || !data) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Éviter de réinitialiser si l'instance existe déjà
      if (mapInstance.current) return;

      // Création de l'instance centrée sur l'Europe centrale
      const map = L.map(mapRef.current, {
        center: [48.5, 12],
        zoom: 4,
        zoomControl: true
      });
      
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      // Ajout des marqueurs numérotés
      data.pays_europe.forEach((p, index) => {
        if (p.lat && p.lng) {
          const markerColor = p.ue ? "#1d4ed8" : "#64748b";

          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="
              background-color: ${markerColor}; 
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
              font-size: 10px;
            ">${index + 1}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          L.marker([p.lat, p.lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(`
              <div style="color: black; padding: 2px;">
                <strong style="font-size: 14px;">#${index + 1} ${p.nom}</strong><br>
                <span style="font-size: 12px;">Capitale : ${p.capitale}</span>
              </div>
            `);
        }
      });

      // RÉGLAGE CRITIQUE : Forcer Leaflet à recalculer sa taille après le rendu initial
      setTimeout(() => {
        map.invalidateSize();
        setIsReady(true);
      }, 250);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [data]); // Se déclenche dès que 'data' arrive

  if (!data) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
      <p className="text-slate-600 font-medium">Chargement des pays d'Europe...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8 border-b-2 border-slate-200 pb-6">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900">
          🌍 {data.nom_liste}
        </h1>
      </header>

      {/* CONTENEUR CARTE */}
      <div className="relative w-full mb-10 border-4 border-white shadow-xl rounded-3xl bg-slate-200 overflow-hidden z-0" style={{ height: "60vh" }}>
        <div ref={mapRef} className="h-full w-full" />
        
        {/* Overlay de chargement interne à la carte */}
        {!isMapReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 z-10">
            <Loader2 className="animate-spin h-8 w-8 text-violet-600 mb-2" />
            <p className="text-slate-500 animate-pulse text-sm">Chargement de la carte…</p>
          </div>
        )}
      </div>
        )}

      {/* GRILLE DES PAYS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.pays_europe.map((p, index) => (
          <div key={index} className="group p-5 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-blue-500 transition-all duration-300 flex gap-4">
            <span className="text-2xl font-black text-slate-200 group-hover:text-blue-100 transition-colors">
              {(index + 1).toString().padStart(2, '0')}
            </span>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-lg truncate">{p.nom}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">{p.capitale}</p>
              {p.ue && (
                <span className="inline-block mt-2 text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold uppercase">
                  Union Européenne
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
