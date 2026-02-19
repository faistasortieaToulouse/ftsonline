'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Globe2, AlertTriangle } from "lucide-react";
import 'leaflet/dist/leaflet.css';

interface Langue {
  nom: string;
  famille: string;
  zone?: string;
  details?: string;
  statut?: string;
  varietes?: string[];
  sous_varietes?: string[];
}

export default function LanguesFrancePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [langues, setLangues] = useState<Langue[]>([]);
  const [isReady, setIsReady] = useState(false);

  // 1. Récupération des données via ton API
  useEffect(() => {
    fetch("/api/languesfrance")
      .then(async (res) => {
        const data = await res.json();
        if (Array.isArray(data)) setLangues(data);
      })
      .catch(console.error);
  }, []);

  // 2. Initialisation de la carte (Leaflet)
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || mapInstance.current) return;
      const L = (await import('leaflet')).default;

      // Correction icônes Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Vue centrée sur la France
      mapInstance.current = L.map(mapRef.current, {
        scrollWheelZoom: false,
        tap: true
      }).setView([46.6033, 1.8883], 5);

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

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      
      {/* BOUTON RETOUR */}
      <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 hover:underline mb-6 transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour à l'accueil
      </Link>

      <header className="mb-6 md:mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 flex flex-wrap justify-center md:justify-start items-center gap-3">
          <Globe2 size={40} className="text-indigo-600" /> Langues de France
        </h1>
        <p className="text-gray-600 mt-2 italic text-sm md:text-base">
          Exploration du patrimoine linguistique hexagonal et ultra-marin
        </p>
      </header>

      {/* CARTE */}
      <div
        ref={mapRef}
        className="h-[35vh] md:h-[45vh] w-full mb-10 border-4 border-white shadow-xl rounded-3xl bg-slate-100 overflow-hidden z-0"
      >
        {!isReady && (
          <div className="flex items-center justify-center h-full bg-slate-50">
             <p className="animate-pulse font-bold text-indigo-600">Initialisation de la carte...</p>
          </div>
        )}
      </div>

      {/* SEPARATEUR ET TITRE GRILLE */}
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-xl font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
          Inventaire <span className="text-indigo-600 text-sm">({langues.length})</span>
        </h2>
        <div className="h-px flex-1 bg-slate-200"></div>
      </div>

      {/* GRILLE DES LANGUES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {langues.map((langue, i) => (
          <div 
            key={i} 
            className="group p-5 bg-white shadow-sm border border-slate-200 rounded-2xl hover:shadow-lg hover:border-indigo-200 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {langue.nom}
              </h3>
              {langue.statut && (
                <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md border ${
                  langue.statut === 'mort' || langue.statut === 'disparu' 
                  ? 'bg-red-50 text-red-600 border-red-100' 
                  : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  <AlertTriangle size={10} /> {langue.statut.toUpperCase()}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs">
                <span className="font-semibold text-slate-500 uppercase tracking-tighter">Famille :</span> 
                <span className="ml-2 text-slate-700">{langue.famille}</span>
              </p>
              <p className="text-xs">
                <span className="font-semibold text-slate-500 uppercase tracking-tighter">Zone :</span> 
                <span className="ml-2 text-slate-700">{langue.zone || "Non spécifiée"}</span>
              </p>
            </div>

            {langue.details && (
              <p className="mt-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border-l-4 border-indigo-400 italic">
                {langue.details}
              </p>
            )}

            {(langue.varietes || langue.sous_varietes) && (
              <div className="mt-4 flex flex-wrap gap-1">
                {(langue.varietes || langue.sous_varietes)?.map((v, idx) => (
                  <span key={idx} className="text-[9px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                    {v}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <footer className="mt-16 py-8 text-center text-slate-400 text-xs border-t border-slate-100">
        Données issues de : data/toulousain/languesfrance.json
      </footer>
    </div>
  );
}
