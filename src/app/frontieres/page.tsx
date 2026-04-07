'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Globe, ExternalLink, MapPin, Anchor, AlertCircle, Loader2 } from "lucide-react";
import 'leaflet/dist/leaflet.css';

export default function FrontieresPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [frontieres, setFrontieres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Utilitaire pour les ancres (ex: "Brésil" -> "bresil")
  const slugify = (text: string) => 
    text.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

  useEffect(() => {
    fetch("/api/frontieres")
      .then(res => res.json())
      .then(data => {
        setFrontieres(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading || !mapRef.current || mapInstance.current || frontieres.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      mapInstance.current = L.map(mapRef.current!).setView([20, 0], 2);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(mapInstance.current);

      const markersGroup = L.featureGroup();

      frontieres.forEach((f, i) => {
        if (f.lat && f.lng) {
          const isTerrestre = f.type.includes('Terrestre');
          const color = isTerrestre ? '#10b981' : '#3b82f6';

          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color:${color}; color:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-weight:900; border:2px solid white; box-shadow:0 4px 8px rgba(0,0,0,0.3); font-size:10px;">${i + 1}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const marker = L.marker([f.lat, f.lng], { icon: customIcon });
          
          marker.bindPopup(`
            <div style="font-family: sans-serif; min-width: 160px; padding: 5px;">
              <div style="font-size: 9px; font-weight: 900; color: ${color}; text-transform: uppercase; margin-bottom: 2px;">Frontière #${i+1}</div>
              <strong style="font-size: 15px; color: #0f172a; display: block; margin-bottom: 4px;">${f.pays}</strong>
              <div style="font-size: 11px; color: #64748b; margin-bottom: 10px;">${f.zone}</div>
              
              <a href="#frontiere-${slugify(f.pays + '-' + i)}" style="
                display: block;
                background: ${color};
                color: white;
                text-decoration: none;
                padding: 6px;
                border-radius: 6px;
                font-size: 10px;
                font-weight: bold;
                text-align: center;
                text-transform: uppercase;
              ">Détails techniques ↓</a>
            </div>
          `);
          marker.addTo(markersGroup);
        }
      });

      markersGroup.addTo(mapInstance.current);
      
      setTimeout(() => {
        if (mapInstance.current) {
          mapInstance.current.invalidateSize();
          setIsReady(true);
        }
      }, 500);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [loading, frontieres]);

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black uppercase text-[10px] tracking-widest group transition-colors">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour Accueil
        </Link>
      </nav>

      <header className="mb-12 border-b-8 border-slate-900 pb-8">
        <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-6">
          Lignes de <span className="text-indigo-600">Partage</span>
        </h1>
        
        <a 
          href="https://fr.wikipedia.org/wiki/Frontières_de_la_France" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group inline-flex flex-col md:flex-row md:items-center gap-3 text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <div className="flex items-center gap-2 font-black text-lg uppercase tracking-tighter">
            <Globe className="text-indigo-600" size={24} />
            Données Wikipédia Officielles
            <ExternalLink size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-xs md:text-sm text-slate-400 font-bold uppercase tracking-widest">
            (Histoire, traités et délimitations territoriales)
          </p>
        </a>
      </header>

      {/* CARTE */}
      <div className="relative w-full mb-16 border-4 md:border-[12px] border-white shadow-2xl rounded-[2.5rem] bg-slate-200 overflow-hidden z-0" style={{ height: "65vh" }}>
        <div ref={mapRef} className="h-full w-full" />
        
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 backdrop-blur-sm z-10">
            <Loader2 className="animate-spin h-10 w-10 text-indigo-600 mb-4" />
            <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Tracé des limites souveraines...</p>
          </div>
        )}

        <div className="absolute bottom-6 left-6 bg-slate-900 text-white px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl z-[1000] flex gap-6">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/> Terrestre
          </span>
          <span className="flex items-center gap-2 border-l border-slate-700 pl-6">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"/> Maritime
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-2xl font-black uppercase tracking-tighter italic text-slate-800">Répertoire des Voisinages</h2>
        <div className="h-px flex-1 bg-slate-200"></div>
      </div>

      {/* GRILLE */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin h-12 w-12 text-indigo-600 mb-4" />
          <p className="font-black uppercase tracking-widest text-xs">Compilation de la liste...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {frontieres.map((f, i) => {
            const isTerrestre = f.type.includes('Terrestre');
            return (
              <div 
                key={i} 
                id={`frontiere-${slugify(f.pays + '-' + i)}`}
                className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 p-7 flex flex-col relative overflow-hidden scroll-mt-10"
              >
                {/* Numéro en arrière-plan */}
                <span className="absolute -right-2 -top-4 text-7xl font-black text-slate-50 group-hover:text-indigo-50 transition-colors pointer-events-none">
                  {i + 1}
                </span>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl text-white ${isTerrestre ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                        {isTerrestre ? <MapPin size={18} /> : <Anchor size={18} />}
                      </div>
                      <h3 className="font-black text-slate-900 uppercase italic tracking-tighter text-lg leading-none">
                        {f.pays}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Localisation</p>
                      <p className="text-sm font-bold text-slate-700">{f.zone}</p>
                    </div>
                    
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Type de limite</p>
                      <p className={`text-xs font-black uppercase tracking-tighter ${isTerrestre ? 'text-emerald-600' : 'text-blue-600'}`}>
                        {f.type}
                      </p>
                    </div>

                    {f.notes && (
                      <div className="pt-4 border-t border-slate-50">
                        <div className="flex gap-2 text-slate-500">
                          <AlertCircle size={14} className="shrink-0 text-amber-400" />
                          <p className="text-[11px] leading-relaxed italic">{f.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <footer className="mt-24 py-12 border-t border-slate-200 text-center">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
          FTS Online 2026 — Souveraineté & Territoires
        </p>
      </footer>

      <style jsx global>{`
        .custom-marker { background: none !important; border: none !important; }
        .leaflet-popup-content-wrapper { border-radius: 1.5rem; border: none; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1); }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
