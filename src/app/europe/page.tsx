'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Globe, Landmark, Users, Maximize2, ListFilter, ChevronDown, ExternalLink } from "lucide-react";
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

  // Utilitaire pour créer des IDs d'ancres valides
  const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  // 1. Chargement des données
  useEffect(() => {
    fetch("/api/europe")
      .then((res) => res.json())
      .then((json) => {
        if (json.pays_europe) setData(json);
      })
      .catch(console.error);
  }, []);

  // 2. Initialisation de la carte
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || !data) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      if (mapInstance.current) return;

      const map = L.map(mapRef.current, {
        center: [48.5, 12],
        zoom: 4,
        zoomControl: true
      });
      
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      // Ajout des marqueurs
      data.pays_europe.forEach((p, index) => {
        if (p.lat && p.lng) {
          const markerColor = p.ue ? "#1d4ed8" : "#64748b";

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

          L.marker([p.lat, p.lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(`
              <div style="font-family: sans-serif; text-align: center; padding: 5px; min-width: 160px;">
                <div style="text-transform: uppercase; font-size: 9px; font-weight: 900; color: ${markerColor}; letter-spacing: 1px;">PAYS D'EUROPE</div>
                <strong style="font-size: 16px; color: #1e293b; display: block; margin: 4px 0;">${p.nom}</strong>
                <div style="font-size: 11px; color: #64748b; font-weight: bold; margin-bottom: 8px;">Capitale : ${p.capitale}</div>
                
                <a href="#pays-${slugify(p.nom)}" style="
                  display: block;
                  background: #f1f5f9;
                  color: #1e293b;
                  text-decoration: none;
                  padding: 8px;
                  border-radius: 10px;
                  font-size: 10px;
                  font-weight: 900;
                  text-transform: uppercase;
                  border: 1px solid #e2e8f0;
                ">Consulter la fiche ↓</a>
                
                <hr style="margin: 10px 0; border: 0; border-top: 1px solid #f1f5f9;"/>
                <div style="font-size: 9px; color: #94a3b8; font-style: italic; line-height: 1.2;">${p.nom_long}</div>
              </div>
            `);
        }
      });

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
  }, [data]);

  const focusOnCountry = (p: PaysEurope) => {
    if (mapInstance.current && p.lat && p.lng) {
      mapInstance.current.flyTo([p.lat, p.lng], 6, { duration: 1.5 });
      if (window.innerWidth < 1024) {
        window.scrollTo({ top: 150, behavior: 'smooth' });
      }
    }
  };

  if (!data) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em] animate-pulse italic">Analyse géopolitique en cours...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      
      <nav className="mb-8 flex justify-between items-center px-2">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-black uppercase text-[10px] tracking-widest transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Portail Principal
        </Link>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
          <Globe size={14} /> Global Database 2026
        </div>
      </nav>

      <header className="mb-10 relative">
        <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 -z-10"></div>
            <div className="z-10">
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
                {data.nom_liste.split(' ')[0]} <span className="text-blue-600">{data.nom_liste.split(' ').slice(1).join(' ')}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2 italic">
                  <Landmark size={14} className="text-blue-500" /> Inventaire des nations souveraines
                </p>
                <a 
                  href="#liste-pays" 
                  className="bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                  <ListFilter size={14} /> Explorer la liste
                </a>
              </div>
            </div>
            <div className="flex gap-4 z-10">
              <div className="bg-slate-900 text-white p-4 rounded-3xl text-center min-w-[100px]">
                <div className="text-2xl font-black italic tracking-tighter">{data.total}</div>
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Pays total</div>
              </div>
            </div>
        </div>
      </header>

      {/* CARTE */}
      <div className="relative w-full mb-16 border-4 border-white shadow-2xl rounded-[3rem] bg-slate-200 overflow-hidden z-0" style={{ height: "65vh" }}>
        <div ref={mapRef} className="h-full w-full" />
        
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 z-10 backdrop-blur-sm">
            <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-3" />
            <p className="text-slate-900 font-black text-xs uppercase tracking-widest italic animate-pulse">Génération de la cartographie...</p>
          </div>
        )}
      </div>

      <div id="liste-pays" className="flex items-center gap-3 mb-8 scroll-mt-20">
        <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
           <ChevronDown size={20} />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter italic text-slate-800">Catalogue des Nations</h2>
      </div>

      {/* GRILLE DES PAYS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.pays_europe.map((p, index) => (
          <div 
            key={index} 
            id={`pays-${slugify(p.nom)}`} // ID POUR ANCRE
            onClick={() => focusOnCountry(p)}
            className="group cursor-pointer bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-500 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden scroll-mt-10"
          >
            <span className="absolute -right-2 -bottom-4 text-7xl font-black text-slate-50 group-hover:text-blue-50 transition-colors -z-0">
              {(index + 1).toString().padStart(2, '0')}
            </span>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-xl ${p.ue ? 'bg-blue-600' : 'bg-slate-400'} text-white shadow-lg`}>
                  <Landmark size={18} />
                </div>
                {p.ue && (
                  <span className="text-[8px] bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-black uppercase tracking-tighter shadow-sm border border-blue-200">
                    Union Européenne
                  </span>
                )}
              </div>

              <h3 className="font-black text-slate-900 text-xl uppercase tracking-tighter mb-1 truncate leading-none">
                {p.nom}
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 italic mb-4">{p.capitale}</p>

              <div className="space-y-2 pt-2 border-t border-slate-50 mt-4">
                <div className="flex items-center gap-2 text-slate-500 group-hover:text-slate-900 transition-colors">
                  <Users size={14} className="text-slate-300 group-hover:text-blue-400" />
                  <span className="text-[11px] font-bold">{p.population}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 group-hover:text-slate-900 transition-colors">
                  <Maximize2 size={14} className="text-slate-300 group-hover:text-blue-400" />
                  <span className="text-[11px] font-bold">{p.superficie}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        .custom-div-icon { background: none !important; border: none !important; }
        
        /* Modifs visibilité croix fermeture (infobulle claire) */
        .leaflet-popup-content-wrapper { 
          border-radius: 1.5rem; 
          border: 1px solid #e2e8f0; 
          background: white;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          overflow: hidden; 
        }
        .leaflet-popup-tip { background: white; border: 1px solid #e2e8f0; }
        
        /* On force la croix de fermeture en noir si elle ne l'est pas */
        .leaflet-container a.leaflet-popup-close-button {
          color: #000;
          font-weight: bold;
          padding: 8px 12px 0 0;
        }

        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
