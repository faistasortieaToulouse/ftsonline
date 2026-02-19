'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Globe2, AlertTriangle } from "lucide-react";
import 'leaflet/dist/leaflet.css';

interface Langue {
  id: number; // Désormais obligatoire pour l'affichage
  nom: string;
  famille: string;
  zone?: string;
  details?: string;
  statut?: string;
  lat?: number;
  lng?: number;
  varietes?: string[];
  sous_varietes?: string[];
}

export default function LanguesFrancePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [langues, setLangues] = useState<Langue[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetch("/api/languesfrance")
      .then(async (res) => {
        const data = await res.json();
        if (Array.isArray(data)) setLangues(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const updateMap = async () => {
      if (!mapRef.current) return;
      const L = (await import('leaflet')).default;

      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current, {
          scrollWheelZoom: false,
          tap: true
        }).setView([46.6033, 1.8883], 5);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap'
        }).addTo(mapInstance.current);
        
        setIsReady(true);
      }

      // Suppression des anciens marqueurs pour éviter les doublons
      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) mapInstance.current.removeLayer(layer);
      });

      if (langues.length > 0) {
        langues.forEach(langue => {
          if (langue.lat && langue.lng) {
            // Création d'une icône personnalisée avec le numéro
            const customIcon = L.divIcon({
              className: 'custom-div-icon',
              html: `<div style="
                background-color: #4f46e5;
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: bold;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              ">${langue.id}</div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });

            L.marker([langue.lat, langue.lng], { icon: customIcon })
              .addTo(mapInstance.current)
              .bindPopup(`
                <div style="font-family: sans-serif; padding: 5px;">
                  <strong style="color: #4f46e5; font-size: 14px;">#${langue.id} - ${langue.nom}</strong><br/>
                  <span style="font-size: 12px; color: #64748b;">${langue.famille}</span>
                </div>
              `);
          }
        });
      }
    };

    updateMap();

    return () => {
      if (mapInstance.current && !mapRef.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [langues]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900">
      
      <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 hover:underline mb-6 transition-colors group text-sm font-medium">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour à l'accueil
      </Link>

      <header className="mb-6 md:mb-10">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 flex items-center gap-3">
          <Globe2 size={40} className="text-indigo-600" /> Langues de France
        </h1>
        <p className="text-gray-600 mt-2 italic max-w-2xl">
          Inventaire numéroté de la diversité linguistique (Métropole et Outre-mer).
        </p>
      </header>

      <div className="relative">
        <div ref={mapRef} className="h-[40vh] md:h-[55vh] w-full mb-10 border-4 border-white shadow-2xl rounded-3xl bg-slate-200 overflow-hidden z-0" />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100/50 backdrop-blur-sm rounded-3xl z-10">
             <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold text-indigo-600 text-sm">Chargement des 131 langues...</p>
             </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-xl font-bold text-slate-800 uppercase tracking-widest flex items-center gap-3">
          Inventaire <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-black">{langues.length}</span>
        </h2>
        <div className="h-px flex-1 bg-slate-200"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {langues.map((langue) => (
          <div 
            key={langue.id} 
            className="group flex flex-col p-5 bg-white shadow-sm border border-slate-200 rounded-2xl hover:shadow-xl hover:border-indigo-200 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-3 gap-2">
              <div className="flex items-center gap-2">
                <span className="flex-shrink-0 w-7 h-7 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg flex items-center justify-center text-[10px] font-black">
                  {langue.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                  {langue.nom}
                </h3>
              </div>
              {langue.statut && (
                <span className={`flex-shrink-0 text-[8px] font-black px-1.5 py-0.5 rounded border uppercase ${
                  langue.statut === 'mort' || langue.statut === 'disparu' 
                  ? 'bg-red-50 text-red-600 border-red-100' 
                  : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  {langue.statut}
                </span>
              )}
            </div>

            <div className="space-y-1 mb-4 text-[11px]">
              <p><span className="font-bold text-slate-400 uppercase tracking-tighter mr-2">Famille</span><span className="text-slate-700">{langue.famille}</span></p>
              <p><span className="font-bold text-slate-400 uppercase tracking-tighter mr-2">Zone</span><span className="text-slate-700">{langue.zone || "France"}</span></p>
            </div>

            {langue.details && (
              <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border-l-2 border-indigo-300 italic mb-4 flex-grow">
                {langue.details}
              </p>
            )}

            {(langue.varietes || langue.sous_varietes) && (
              <div className="flex flex-wrap gap-1 mt-auto">
                {(langue.varietes || langue.sous_varietes)?.map((v, idx) => (
                  <span key={idx} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                    {v}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <footer className="mt-20 py-10 text-center border-t border-slate-200 text-slate-400 text-xs">
        Atlas linguistique • {new Date().getFullYear()}
      </footer>
    </div>
  );
}
