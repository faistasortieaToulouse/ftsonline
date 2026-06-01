'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Globe, Landmark, ChevronDown, ExternalLink } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface Coordonnees {
  latitude: number;
  longitude: number;
}

interface Mairie {
  nom: string;
  ville: string;
  url: string;
  coordonnees: Coordonnees;
}

export default function HotelDeVillePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [mairies, setMairies] = useState<Mairie[] | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Utilitaire pour créer des IDs d'ancres valides
  const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  // 1. Chargement des données depuis l'API
  useEffect(() => {
    fetch("/api/hoteldeville")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur serveur API");
        return res.json();
      })
      .then((json) => {
        if (Array.isArray(json)) setMairies(json);
      })
      .catch((err) => console.error("Erreur fetch mairies:", err));
  }, []);

  // 2. Initialisation dynamique de la carte Leaflet
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || !mairies || mairies.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      if (mapInstance.current) return;

      // Centrage initial de la carte sur le sud de la France (proche de tes données)
      const map = L.map(mapRef.current, {
        center: [44.0, 2.5],
        zoom: 7,
        zoomControl: true
      });
      
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      // Ajout des marqueurs numérotés avec popups au survol/clic
      mairies.forEach((m, index) => {
        if (m.coordonnees?.latitude && m.coordonnees?.longitude) {
          const markerColor = "#1d4ed8"; // Bleu uniforme

          // Création du rond bleu avec le numéro
          const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="
              background-color: ${markerColor}; 
              color: white; 
              border-radius: 50%; 
              width: 28px; 
              height: 28px; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-weight: 900; 
              border: 3px solid white; 
              box-shadow: 0 4px 10px rgba(0,0,0,0.2); 
              font-size: 11px;
            ">${index + 1}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          const marker = L.marker([m.coordonnees.latitude, m.coordonnees.longitude], { icon: customIcon }).addTo(map);

          // Contenu du Popup : Nom, Ville + Lien Ancre vers le tableau
          const popupContent = `
            <div style="font-family: sans-serif; text-align: center; padding: 4px; min-width: 170px;">
              <strong style="font-size: 14px; color: #1e293b; display: block; margin-bottom: 2px;">${m.nom}</strong>
              <div style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 8px;">Ville : ${m.ville}</div>
              <a href="#mairie-${slugify(m.nom)}" style="
                display: inline-block;
                background: #1d4ed8;
                color: white;
                text-decoration: none;
                padding: 5px 10px;
                border-radius: 8px;
                font-size: 10px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              ">Voir dans la liste ↓</a>
            </div>
          `;

          marker.bindPopup(popupContent);

          // Gestion du survol à la souris (ordinateur)
          marker.on('mouseover', function () {
            marker.openPopup();
          });
        }
      });

      setTimeout(() => {
        map.invalidateSize();
        setIsMapReady(true);
      }, 500);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [mairies]);

  if (!mairies) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em] animate-pulse italic">Indexation du patrimoine...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      
      {/* NAVIGATION */}
      <nav className="mb-8 flex justify-between items-center px-2">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-black uppercase text-[10px] tracking-widest transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Portail Principal
        </Link>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
          <Globe size={14} /> Territoires Database 2026
        </div>
      </nav>

      {/* EN-TÊTE DE PAGE */}
      <header className="mb-10 relative">
        <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 -z-10"></div>
          <div className="z-10">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
              Hôtels <span className="text-blue-600">de Ville</span>
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2 italic mt-4">
              <Landmark size={14} className="text-blue-500" /> Répertoire et cartographie des édifices
            </p>
          </div>
          <div>
            <div className="bg-slate-900 text-white p-4 rounded-3xl text-center min-w-[110px] shadow-md">
              <div className="text-2xl font-black italic tracking-tighter">{mairies.length}</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Édifices</div>
            </div>
          </div>
        </div>
      </header>

      {/* ZONE CARTE LEAFLET */}
      <div className="relative w-full mb-12 border-4 border-white shadow-xl rounded-[3rem] bg-slate-200 overflow-hidden z-0" style={{ height: "55vh" }}>
        <div ref={mapRef} className="h-full w-full" />
        
        {!isMapReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 z-10 backdrop-blur-sm">
            <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-3" />
            <p className="text-slate-900 font-black text-xs uppercase tracking-widest italic animate-pulse">Génération de la cartographie...</p>
          </div>
        )}
      </div>

      {/* SECTION DU CATALOGUE */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
           <ChevronDown size={20} />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter italic text-slate-800">Catalogue Alphabétique</h2>
      </div>

      {/* GRILLE DES ÉDIFICES COMPORTANT LES LIENS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mairies.map((m, index) => (
          <div 
            key={index} 
            id={`mairie-${slugify(m.nom)}`}
            className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[160px] scroll-mt-24"
          >
            {/* Numéro officiel correspondant à la carte */}
            <span className="absolute -right-2 -bottom-4 text-7xl font-black text-slate-100 group-hover:text-slate-200 pointer-events-none -z-0">
              {(index + 1).toString().padStart(2, '0')}
            </span>

            <div className="relative z-10 w-full">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 font-black text-xs">
                  #{index + 1}
                </div>
              </div>

              {/* LE NOM EST LE LIEN WIKIPÉDIA CLIQUABLE */}
              <h3 className="font-black text-slate-900 text-xl uppercase tracking-tighter mb-1 leading-tight group">
                <a 
                  href={m.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-baseline gap-1 hover:text-blue-600 transition-colors underline decoration-dotted decoration-slate-300 hover:decoration-solid break-words"
                >
                  {m.nom}
                </a>
              </h3>
              
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 italic">
                {m.ville}
              </p>
            </div>

            {/* Pied de carte avec bouton d'action externe */}
            <div className="relative z-10 pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
              <a 
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] text-slate-400 font-bold uppercase tracking-wider hover:text-blue-600 flex items-center gap-1 transition-colors"
              >
                Ouvrir Wikipédia <ExternalLink size={10} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* STYLES PERSONNALISÉS POUR LES POPUPS LEAFLET */}
      <style jsx global>{`
        .custom-div-icon { background: none !important; border: none !important; }
        
        .leaflet-popup-content-wrapper { 
          border-radius: 1.2rem; 
          border: 1px solid #e2e8f0; 
          background: white;
          box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1);
        }
        .leaflet-popup-tip { background: white; border: 1px solid #e2e8f0; }
        html { scroll-behavior: smooth; }
      `}</style>

    </div>
  );
}
