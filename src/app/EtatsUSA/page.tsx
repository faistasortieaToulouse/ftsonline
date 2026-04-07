'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, MapPin, Calendar, Star } from "lucide-react";
import 'leaflet/dist/leaflet.css';

interface EtatUSA {
  nom: string;
  genre: string;
  ordre_entree: number;
  date_entree: string;
  description: string;
  lat: number;
  lng: number;
}

export default function EtatsUSAPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [etats, setEtats] = useState<EtatUSA[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Utilitaire pour créer des ancres propres (ex: "New York" -> "new-york")
  const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  useEffect(() => {
    fetch("/api/EtatsUSA")
      .then(async (res) => {
        const data = await res.json();
        if (Array.isArray(data)) setEtats(data.sort((a, b) => a.ordre_entree - b.ordre_entree));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || mapInstance.current) return;
      const L = (await import('leaflet')).default;

      // Configuration des icônes Leaflet par défaut
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      mapInstance.current = L.map(mapRef.current, {
        scrollWheelZoom: true, 
        tap: true
      }).setView([39.8283, -98.5795], 4);

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

  useEffect(() => {
    if (!isReady || !mapInstance.current || etats.length === 0) return;
    const addMarkers = async () => {
      const L = (await import('leaflet')).default;
      const markersGroup = L.featureGroup();

      etats.forEach((etat) => {
        if (etat.lat && etat.lng) {
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color:#1e3a8a; color:white; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-weight:900; border:2px solid white; box-shadow:0 4px 6px rgba(0,0,0,0.3); font-size:11px; font-family:sans-serif;">${etat.ordre_entree}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          const marker = L.marker([etat.lat, etat.lng], { icon: customIcon });
          
          marker.bindPopup(`
            <div style="min-width: 180px; padding: 5px; font-family: sans-serif;">
              <div style="font-size: 10px; font-weight: 900; color: #b91c1c; text-transform: uppercase; margin-bottom: 2px;">État n°${etat.ordre_entree}</div>
              <strong style="font-size: 16px; color: #1e3a8a; display: block; margin-bottom: 5px;">${etat.nom}</strong>
              <div style="font-size: 11px; color: #64748b; margin-bottom: 10px;">
                Admis le : ${new Date(etat.date_entree).toLocaleDateString('fr-FR')}
              </div>
              <a href="#etat-${slugify(etat.nom)}" style="
                display: block;
                background: #1e3a8a;
                color: white;
                text-decoration: none;
                padding: 8px;
                border-radius: 6px;
                font-size: 10px;
                font-weight: bold;
                text-align: center;
                text-transform: uppercase;
              ">Voir la fiche ↓</a>
            </div>
          `);
          marker.addTo(markersGroup);
        }
      });
      markersGroup.addTo(mapInstance.current);
    };
    addMarkers();
  }, [isReady, etats]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      
      <nav className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-900 font-black uppercase text-[10px] tracking-widest group transition-colors">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour Accueil
        </Link>
      </nav>

      <header className="mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 flex items-center gap-4 italic tracking-tighter uppercase">
            <span className="text-blue-900">États</span>
            <span className="text-red-600 underline decoration-blue-900 underline-offset-8">Unis</span>
          </h1>
          <p className="text-slate-500 mt-4 font-bold uppercase tracking-[0.2em] text-xs">
            Chronologie de la ratification de l'Union
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hidden md:block">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total des membres</p>
           <p className="text-3xl font-black text-blue-900">50 États</p>
        </div>
      </header>

      {/* MAP CONTAINER */}
      <div className="relative w-full h-[45vh] md:h-[65vh] mb-16 border-4 md:border-[12px] border-white shadow-2xl rounded-[2.5rem] bg-slate-200 overflow-hidden z-0">
        <div ref={mapRef} className="h-full w-full" />
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/90 backdrop-blur-md z-10">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
              <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Chargement des frontières...</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mb-12">
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">L'Ordre d'Entrée</h2>
        <div className="h-2 flex-1 bg-red-600 rounded-full"></div>
        <Star className="text-blue-900 fill-blue-900" size={24} />
      </div>

      {/* GRID DES ETATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {etats.map((etat, i) => (
          <div 
            key={i} 
            id={`etat-${slugify(etat.nom)}`}
            className="group relative p-8 bg-white border border-slate-100 shadow-sm rounded-[2rem] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 scroll-mt-10 overflow-hidden"
          >
            {/* Background number */}
            <span className="absolute -right-4 -top-4 text-9xl font-black text-slate-50 group-hover:text-blue-50 transition-colors pointer-events-none">
                {etat.ordre_entree}
            </span>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-blue-900 text-white rounded-xl shadow-lg">
                    <MapPin size={20} />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admis en</span>
                  <span className="text-sm font-bold text-red-600">
                    {new Date(etat.date_entree).getFullYear()}
                  </span>
                </div>
              </div>

              <h3 className="text-2xl font-black text-blue-900 uppercase tracking-tight mb-4 group-hover:text-red-600 transition-colors">
                {etat.nom}
              </h3>
              
              <div className="flex items-center gap-2 mb-4 text-slate-400 italic text-xs font-bold uppercase">
                <Calendar size={14} />
                {new Date(etat.date_entree).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long'
                })}
              </div>

              <p className="text-slate-600 text-sm leading-relaxed line-clamp-4 group-hover:line-clamp-none transition-all duration-500">
                {etat.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        .custom-marker { background: none !important; border: none !important; }
        .leaflet-popup-content-wrapper { border-radius: 1.2rem; border: 1px solid #e2e8f0; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
