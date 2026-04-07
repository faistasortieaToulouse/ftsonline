'use client';

import { useEffect, useState, useRef, CSSProperties } from "react"; 
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp, MapPin, Calendar, Info } from "lucide-react";

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
const THEME_COLOR = '#16a34a';

export default function MarchesPage() { 
  const [marches, setMarches] = useState<Marche[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // 1. Charger les données
  useEffect(() => {
    async function fetchMarches() {
      try {
        const response = await fetch('/api/marches'); 
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        let data: Marche[] = await response.json();
        data.sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }));
        setMarches(data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchMarches();
  }, []);

  // 2. Initialisation de la carte (Fix du bug d'affichage)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current).setView(TOULOUSE_CENTER, 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);

      // Correction du bug de rendu : on force le rafraîchissement
      setTimeout(() => {
        mapInstance.current?.invalidateSize();
      }, 200);

      setIsReady(true);
    };

    initMap();
  }, [isLoadingData]);

  // 3. Ajout des marqueurs avec ANCRE vers le tableau
  useEffect(() => {
    if (!isReady || !mapInstance.current || marches.length === 0) return;

    const addMarkers = async () => {
      const L = (await import('leaflet')).default;

      marches.forEach((m, i) => {
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${THEME_COLOR}; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${i + 1}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        // Infobulle avec lien ancre #marche-ID
        const popupHTML = `
          <div style="font-family: sans-serif; padding: 5px; min-width: 150px;"> 
            <strong style="color: ${THEME_COLOR}; font-size: 14px;">${i + 1}. ${m.nom}</strong><br/> 
            <div style="margin: 5px 0; font-size: 12px; color: #666;">${m.jours_de_tenue}</div>
            <a href="#marche-${m.id}" style="display: block; background: ${THEME_COLOR}; color: white; text-align: center; padding: 5px; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 11px; margin-top: 5px;">
              VOIR LES DÉTAILS ↓
            </a>
          </div>
        `;

        L.marker([m.lat, m.lon], { icon: customIcon })
          .bindPopup(popupHTML)
          .addTo(mapInstance.current);
      });
    };

    addMarkers();
  }, [isReady, marches]);

  return ( 
    <div className="p-4 max-w-7xl mx-auto bg-slate-50 min-h-screen"> 
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-green-700 hover:text-green-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">
          🥕 LES MARCHÉS <span className="text-green-600">TOULOUSAINS</span>
        </h1> 
        <p className="font-bold text-slate-500 text-sm uppercase tracking-widest">
          {isLoadingData ? 'Chargement...' : `${marches.length} RENDEZ-VOUS GOURMANDS RÉPERTORIÉS`}
        </p>
      </header>

      {/* ZONE CARTE CORRIGÉE */}
      <div className="mb-12 border-4 border-white rounded-[2rem] bg-slate-200 shadow-2xl relative z-0 overflow-hidden h-[50vh] md:h-[60vh]"> 
        <div ref={mapRef} className="h-full w-full" />
        {isLoadingData && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 z-10">
            <p className="animate-pulse font-black text-green-600 uppercase tracking-tighter">Initialisation...</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-black mb-6 text-slate-800 flex items-center gap-2">
        <Info className="text-green-600" /> LISTE DES MARCHÉS
      </h2> 

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <table className="w-full text-left border-collapse text-sm"> 
          <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-widest"> 
            <tr> 
              <th className="p-4 text-center w-12">#</th>
              <th className="p-4">Nom du Marché</th> 
              <th className="p-4 hidden md:table-cell">Adresse</th> 
              <th className="p-4">Jours</th> 
              <th className="p-4 hidden lg:table-cell text-center">Type</th> 
            </tr> 
          </thead> 
          <tbody className="divide-y divide-slate-100"> 
            {marches.map((m, i) => ( 
              <MarcheRow key={m.id} m={m} i={i} />
            ))} 
          </tbody> 
        </table>
      </div> 
    </div> 
  ); 
}

function MarcheRow({ m, i }: { m: Marche; i: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <tr 
        id={`marche-${m.id}`} // L'id qui reçoit l'ancre du marqueur
        className={`cursor-pointer transition-colors scroll-mt-10 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"} hover:bg-green-50`}
        onClick={() => setIsOpen(!isOpen)}
      > 
        <td className="p-4 text-center font-black text-green-700">{i + 1}</td>
        <td className="p-4">
          <div className="flex items-center justify-between font-bold text-slate-900">
            {m.nom}
            <span className="md:hidden">
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </div>
        </td> 
        <td className="p-4 hidden md:table-cell text-slate-500 italic text-xs">{m.adresse}</td> 
        <td className="p-4">
          <div className="flex items-center gap-1 text-[11px] font-black uppercase text-slate-600">
            <Calendar size={12} className="text-green-600" /> {m.jours_de_tenue}
          </div>
        </td> 
        <td className="p-4 hidden lg:table-cell text-center">
            <span className="px-2 py-1 bg-slate-100 rounded text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                {m.type}
            </span>
        </td> 
      </tr>
      
      {/* Détails accordéon */}
      {isOpen && (
        <tr className="bg-green-50/30">
          <td colSpan={5} className="p-5 border-t border-green-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <MapPin className="text-green-600 flex-shrink-0" size={16} />
                <p className="text-xs"><strong>Localisation :</strong> {m.adresse}, {m.commune} {m.code_postal}</p>
              </div>
              <div className="text-xs">
                <strong>Type :</strong> {m.type}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
