'use client';

import { useEffect, useRef, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface Hotel {
  id: number;
  nom: string;
  adresse: string;
  profession_proprietaire: string;
  siecle: string;
  lat: number;
  lng: number;
}

export default function HotelsMapPage() {
  // ----------------------------------------------------
  // 1. ÉTATS ET RÉFÉRENCES
  // ----------------------------------------------------
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [openDetailsId, setOpenDetailsId] = useState<number | null>(null);

  const toggleDetails = (id: number) => {
    setOpenDetailsId((prevId) => (prevId === id ? null : id));
  };

  // --- Charger les données ---
  useEffect(() => {
    async function fetchHotels() {
      try {
        const res = await fetch('/api/hotelsparticuliers');
        if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
        const data = await res.json();
        setHotels(data);
      } catch (error) {
        console.error("Erreur chargement hôtels:", error);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchHotels();
  }, []);

  // ----------------------------------------------------
  // 2. INITIALISATION LEAFLET
  // ----------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData || hotels.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      if (mapInstance.current) return;

      const center: [number, number] = [43.6015, 1.443]; // Centrage optimisé Vieux-Toulouse
      const map = L.map(mapRef.current!).setView(center, 15);
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      hotels.forEach((hotel, i) => {
        if (!hotel.lat || !hotel.lng) return;

        const id = i + 1;
        const customIcon = L.divIcon({
          className: 'custom-marker-hotel',
          html: `
            <div style="
              background-color: #2563eb;
              width: 28px; height: 28px;
              border-radius: 50%; border: 2px solid white;
              display: flex; align-items: center; justify-content: center;
              color: white; font-weight: bold; font-size: 11px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ">
              ${id}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([hotel.lat, hotel.lng], { icon: customIcon }).addTo(map);
        
        marker.bindPopup(`
          <div style="text-align: center; font-family: sans-serif; min-width: 140px;">
            <strong style="color: #1e40af;">${id}. ${hotel.nom}</strong><br/>
            <span style="font-size: 11px; color: #64748b;">${hotel.siecle}ᵉ siècle</span><br/>
            <a href="#hotel-item-${hotel.id}" style="display: inline-block; background-color: #2563eb; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 10px; font-weight: bold; margin-top: 8px;">Détails ↓</a>
          </div>
        `);

        marker.on("click", () => {
          toggleDetails(hotel.id);
          map.setView([hotel.lat, hotel.lng], 17, { animate: true });
        });
      });

      setTimeout(() => {
        map.invalidateSize();
        setIsMapReady(true);
      }, 300);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isLoadingData, hotels]);

  // ----------------------------------------------------
  // 3. RENDU
  // ----------------------------------------------------
  return (
    <div className="p-4 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-black mb-2 text-slate-900 tracking-tight uppercase">
          🏰 Hôtels Particuliers
        </h1>
        <p className="text-slate-500 font-medium italic">L'âge d'or du Pastel et du Parlement de Toulouse — ({hotels.length} Lieux)</p>
      </header>

      {/* ZONE CARTE */}
      <div className="mb-10 h-[60vh] border-4 border-white rounded-[2.5rem] bg-slate-200 relative z-0 overflow-hidden shadow-2xl">
        <div ref={mapRef} className="h-full w-full" />
        {(!isMapReady || isLoadingData) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/60 backdrop-blur-sm z-10">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
            <p className="text-blue-600 font-black text-xs uppercase tracking-widest">Ouverture des registres...</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-black mb-6 text-slate-800 flex items-center gap-3">
        <span className="h-1.5 w-12 bg-blue-600 rounded-full"></span>
        LES DEMEURES HISTORIQUES
      </h2>

      {/* LISTE AVEC ACCORDÉON */}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hotels.map((h, i) => {
          const id = i + 1;
          const isOpen = openDetailsId === h.id;

          return (
            <li 
              key={h.id} 
              id={`hotel-item-${h.id}`}
              onClick={() => toggleDetails(h.id)}
              className={`p-6 border-2 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col scroll-mt-24 ${
                isOpen 
                  ? "bg-white border-blue-400 shadow-xl scale-[1.01]" 
                  : "bg-white border-white shadow-sm hover:border-blue-100 hover:shadow-md"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <p className="text-lg font-bold text-slate-900 leading-tight flex-grow pr-4">
                  <span className={`mr-2 transition-colors ${isOpen ? 'text-blue-600' : 'text-slate-300'}`}>{id}.</span> 
                  {h.nom}
                </p>
                <span className={`text-slate-400 font-bold transition-transform duration-300 ${isOpen ? "rotate-180 text-blue-600" : "rotate-0"}`}>
                  ▼
                </span>
              </div>
              
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                📍 {h.adresse}
              </p>

              {isOpen && (
                <div className="mt-2 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <span className="font-black text-slate-400 uppercase text-[9px] block mb-1">Propriétaire d'origine</span>
                      <p className="text-sm font-bold text-slate-700">{h.profession_proprietaire}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-50">
                      <span className="font-black text-blue-400 uppercase text-[9px] block mb-1">Époque de construction</span>
                      <p className="text-sm font-bold text-blue-900">{h.siecle}ᵉ Siècle</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 italic leading-relaxed">
                    Cet hôtel particulier témoigne de la richesse des capitouls et de la noblesse de robe toulousaine de l'époque.
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <footer className="mt-20 py-10 border-t border-slate-200 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em]">
            Patrimoine Toulousain • Pastel & Renaissance • 2026
        </p>
      </footer>
    </div>
  );
}
