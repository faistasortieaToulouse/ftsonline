'use client';

import { useEffect, useState, useRef, CSSProperties } from "react"; 
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp, MapPin, Calendar, Clock, ShoppingBasket, Loader2 } from "lucide-react";

interface Marche {
  id: number;
  nom: string;
  type: string;
  adresse: string;
  code_postal: number | null;
  commune: string;
  jours_de_tenue: string;
  horaires: Record<string, string | null>;
  lat: number;
  lon: number;
}

const TOULOUSE_CENTER: [number, number] = [43.6047, 1.4442];
const THEME_COLOR = '#16a34a'; // Vert Émeraude

export default function MarchesPage() { 
  const [marches, setMarches] = useState<Marche[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isReady, setIsReady] = useState(false);
  
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    async function fetchMarches() {
      try {
        const response = await fetch('/api/marches'); 
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        let data: Marche[] = await response.json();
        data.sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }));
        setMarches(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des marchés:", error);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchMarches();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current!).setView(TOULOUSE_CENTER, 13);
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
  }, [isLoadingData]);

  useEffect(() => {
    if (!isReady || !mapInstance.current || marches.length === 0) return;

    const addMarkers = async () => {
      const L = (await import('leaflet')).default;

      marches.forEach((m, i) => {
        if(!m.lat || !m.lon) return;

        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${THEME_COLOR}; width: 26px; height: 26px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 11px; box-shadow: 0 3px 6px rgba(0,0,0,0.2);">${i + 1}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const popupContent = `
          <div style="text-align: center; font-family: sans-serif; padding: 5px;">
            <strong style="color: ${THEME_COLOR}; font-size: 14px;">${i + 1}. ${m.nom}</strong><br/>
            <span style="font-size: 11px; color: #64748b; display: block; margin: 4px 0 italic;">${m.jours_de_tenue}</span>
            <a href="#marche-${m.id}" style="display: inline-block; background: ${THEME_COLOR}; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 10px; font-weight: bold; margin-top: 5px;">DÉTAILS ↓</a>
          </div>
        `;

        L.marker([m.lat, m.lon], { icon: customIcon })
          .bindPopup(popupContent)
          .addTo(mapInstance.current);
      });
    };
    addMarkers();
  }, [isReady, marches]);

  return ( 
    <div className="p-4 max-w-7xl mx-auto bg-slate-50 min-h-screen font-sans"> 
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-green-700 hover:text-green-900 font-bold group transition-all">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight uppercase tracking-tighter italic">
          🥕 Les Marchés <span className="text-green-600 font-black">Toulousains</span>
        </h1>
        <p className="text-slate-500 font-bold italic text-sm mt-1 uppercase tracking-widest">
           {isLoadingData ? 'Récolte des données...' : `${marches.length} rendez-vous gourmands répertoriés`}
        </p>
      </header>

      {/* ZONE CARTE */}
      <div
        className="mb-12 border-4 border-white rounded-[2.5rem] bg-slate-200 shadow-2xl overflow-hidden h-[45vh] md:h-[60vh] relative z-0"
      > 
        <div ref={mapRef} className="h-full w-full" />
        {(!isReady || isLoadingData) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 z-10 backdrop-blur-sm">
            <Loader2 className="animate-spin h-10 w-10 text-green-600 mb-2" />
            <p className="text-green-700 font-black text-xs uppercase tracking-widest">Ouverture des étals...</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800">
        <ShoppingBasket className="text-green-600" />
        LISTE DES MARCHÉS
      </h2> 

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <table className="w-full text-left border-collapse text-sm"> 
          <thead className="bg-slate-900 text-white"> 
            <tr className="uppercase text-[10px] tracking-widest font-black"> 
              <th className="p-5 w-12 text-center">#</th>
              <th className="p-5">Nom du Marché</th> 
              <th className="p-5">Localisation</th> 
              <th className="p-5 hidden md:table-cell">Jours de tenue</th> 
              <th className="p-5 hidden lg:table-cell text-center">Type</th> 
            </tr> 
          </thead> 
          <tbody className="divide-y divide-slate-100"> 
            {marches.map((m, i) => ( 
              <MarcheRow key={m.id} m={m} i={i} />
            ))} 
          </tbody> 
        </table>
      </div> 

      <footer className="py-12 text-center text-slate-400">
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">
            Produits Frais • Proximité • Toulouse 2026
        </p>
      </footer>
    </div> 
  ); 
}

function MarcheRow({ m, i }: { m: Marche; i: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <tr 
        id={`marche-${m.id}`}
        className={`cursor-pointer transition-colors scroll-mt-24 ${isOpen ? 'bg-green-50' : 'hover:bg-slate-50'}`}
        onClick={() => setIsOpen(!isOpen)}
      > 
        <td className="p-5 text-center font-black text-green-700 align-top">{i + 1}</td>
        <td className="p-5 align-top">
           <div className="flex flex-col">
              <span className="font-black text-base text-slate-900 uppercase tracking-tighter leading-tight">{m.nom}</span>
              <span className="md:hidden text-[10px] font-bold text-green-600 uppercase mt-1 italic">{m.jours_de_tenue}</span>
           </div>
        </td> 
        <td className="p-5 align-top">
          <div className="flex items-start gap-2 text-slate-500">
            <MapPin size={14} className="mt-1 flex-shrink-0 text-slate-300" />
            <div className="text-xs font-semibold leading-relaxed whitespace-normal italic">
               {m.adresse}<br/>
               <span className="text-slate-400 not-italic uppercase font-bold text-[10px]">{m.commune} {m.code_postal}</span>
            </div>
          </div>
        </td> 
        <td className="p-5 hidden md:table-cell align-top">
           <div className="flex items-start gap-2 text-slate-600">
              <Calendar size={14} className="mt-0.5 text-green-600" />
              <span className="text-xs font-black uppercase italic tracking-tighter">{m.jours_de_tenue}</span>
           </div>
        </td> 
        <td className="p-5 hidden lg:table-cell align-top text-center">
           <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-widest">
              {m.type}
           </span>
        </td> 
      </tr>
      
      {/* Accordéon Détails */}
      {isOpen && (
        <tr className="bg-green-50/30 animate-in slide-in-from-top-1 duration-200">
          <td colSpan={5} className="p-6 border-t border-green-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Horaires & Infos</p>
                    <div className="flex items-center gap-2 text-slate-700">
                        <Clock size={16} className="text-green-600" />
                        <span className="text-sm font-bold italic">Consulter sur place</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Type de Marché</p>
                    <p className="text-sm font-bold text-slate-700 uppercase">{m.type}</p>
                </div>
                <div className="flex items-end justify-end">
                    <button className="text-[10px] font-black bg-green-600 text-white px-4 py-2 rounded-full uppercase hover:bg-green-700 transition-colors">
                        Ajouter au calendrier
                    </button>
                </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
