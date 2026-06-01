'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Globe, Landmark, ChevronDown } from "lucide-react";
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
  const [isReady, setIsReady] = useState(false);

  // Utilitaire pour créer des IDs d'ancres valides pour le défilement
  const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  // 1. Récupération des données depuis l'API sécurisée
  useEffect(() => {
    fetch("/api/hoteldeville")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur serveur API");
        return res.json();
      })
      .then((json) => {
        if (Array.isArray(json)) {
          setMairies(json);
        } else {
          console.error("Format de données invalide reçu de l'API");
        }
      })
      .catch((err) => console.error("Erreur fetch mairies:", err));
  }, []);

  // 2. Initialisation et gestion de la carte Leaflet
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || !mairies || mairies.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Évite les doublons d'initialisation
      if (mapInstance.current) return;

      // Centrage initial de la carte (coordonnées moyennes de la France)
      const map = L.map(mapRef.current, {
        center: [46.603354, 1.888334],
        zoom: 5.5,
        zoomControl: true
      });
      
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Ajout des marqueurs personnalisés numérotés
      mairies.forEach((m, index) => {
        if (m.coordonnees?.latitude && m.coordonnees?.longitude) {
          const markerColor = "#1d4ed8"; // Bleu uniforme

          const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="
              background-color: ${markerColor}; 
              color: white; 
              border-radius: 50%; 
              width: 26px; 
              height: 26px; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-weight: 900; 
              border: 3px solid white; 
              box-shadow: 0 4px 10px rgba(0,0,0,0.2); 
              font-size: 10px;
            ">${index + 1}</div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13]
          });

          // Création du marqueur avec Popup contenant le nom en lien Wikipédia
          L.marker([m.coordonnees.latitude, m.coordonnees.longitude], { icon: customIcon })
            .addTo(map)
            .bindPopup(`
              <div style="font-family: sans-serif; text-align: center; padding: 5px; min-width: 180px;">
                <div style="text-transform: uppercase; font-size: 9px; font-weight: 900; color: ${markerColor}; letter-spacing: 1px;">PATRIMOINE</div>
                <a href="${m.url}" target="_blank" rel="noopener noreferrer" style="
                  font-size: 15px; 
                  color: #1e293b; 
                  font-weight: bold; 
                  display: block; 
                  margin: 4px 0; 
                  text-decoration: underline; 
                  text-decoration-color: #3b82f6;
                ">${m.nom}</a>
                <div style="font-size: 11px; color: #64748b; font-weight: bold; margin-bottom: 8px;">Ville : ${m.ville}</div>
                <div style="font-size: 9px; color: #94a3b8; font-style: italic;">Cliquez sur le nom pour ouvrir Wikipédia ↗</div>
              </div>
            `);
        }
      });

      // Forcer le rafraîchissement des dimensions de la carte
      setTimeout(() => {
        map.invalidateSize();
        setIsReady(true);
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

  // Déplacement fluide vers l'hôtel de ville sélectionné depuis la liste
  const focusOnMairie = (m: Mairie) => {
    if (mapInstance.current && m.coordonnees?.latitude && m.coordonnees?.longitude) {
      mapInstance.current.flyTo([m.coordonnees.latitude, m.coordonnees.longitude], 13, { duration: 1.5 });
      if (window.innerWidth < 1024) {
        window.scrollTo({ top: 150, behavior: 'smooth' });
      }
    }
  };

  // Écran de chargement structuré
  if (!mairies) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em] animate-pulse italic">Indexation du patrimoine...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      
      {/* BARRE DE NAVIGATION */}
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
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2 italic">
                <Landmark size={14} className="text-blue-500" /> Cartographie des édifices communaux
              </p>
              <a 
                href="#liste-mairies" 
                className="bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
              >
                Explorer la liste
              </a>
            </div>
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
      <div className="relative w-full mb-16 border-4 border-white shadow-2xl rounded-[3rem] bg-slate-200 overflow-hidden z-0" style={{ height: "65vh" }}>
        <div ref={mapRef} className="h-full w-full" />
        
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 z-10 backdrop-blur-sm">
            <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-3" />
            <p className="text-slate-900 font-black text-xs uppercase tracking-widest italic animate-pulse">Génération de la cartographie...</p>
          </div>
        )}
      </div>

      {/* TITRE DU CATALOGUE */}
      <div id="liste-mairies" className="flex items-center gap-3 mb-8 scroll-mt-20">
        <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
           <ChevronDown size={20} />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter italic text-slate-800">Catalogue Alphabétique</h2>
      </div>

      {/* GRILLE DES ÉDIFICES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mairies.map((m, index) => (
          <div 
            key={index} 
            id={`mairie-${slugify(m.nom)}`}
            onClick={() => focusOnMairie(m)}
            className="group cursor-pointer bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-500 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden scroll-mt-10"
          >
            {/* Index en arrière-plan */}
            <span className="absolute -right-2 -bottom-4 text-7xl font-black text-slate-50 group-hover:text-blue-50 transition-colors -z-0">
              {(index + 1).toString().padStart(2, '0')}
            </span>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-xl bg-blue-600 text-white shadow-lg">
                  <Landmark size={18} />
                </div>
              </div>

              {/* TITRE PRINCIPAL COMMUNIQUANT AVEC LE LIEN WIKIPÉDIA */}
              <h3 className="font-black text-slate-900 text-xl uppercase tracking-tighter mb-1 truncate leading-tight">
                <a 
                  href={m.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()} // Évite de déplacer la carte au clic sur le lien externe
                  className="hover:text-blue-600 transition-colors underline decoration-dotted decoration-slate-300 hover:decoration-solid"
                >
                  {m.nom}
                </a>
              </h3>
              
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 italic mb-4">
                {m.ville}
              </p>

              <div className="pt-2 border-t border-slate-100 mt-4 flex items-center justify-between">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  Positionner sur la carte
                </span>
                <span className="text-xs group-hover:translate-x-1 transition-transform text-blue-600 font-bold">&rarr;</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* INJECTION STYLES CSS GLOBAUX POUR LEAFLET */}
      <style jsx global>{`
        .custom-div-icon { background: none !important; border: none !important; }
        
        .leaflet-popup-content-wrapper { 
          border-radius: 1.5rem; 
          border: 1px solid #e2e8f0; 
          background: white;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          overflow: hidden; 
        }
        .leaflet-popup-tip { background: white; border: 1px solid #e2e8f0; }
        
        .leaflet-container a.leaflet-popup-close-button {
          color: #1e293b;
          font-weight: bold;
          padding: 8px 12px 0 0;
        }

        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
