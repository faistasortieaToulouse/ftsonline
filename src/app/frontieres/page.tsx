'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Globe, ExternalLink, MapPin, Anchor, AlertCircle } from "lucide-react";
import 'leaflet/dist/leaflet.css';

export default function FrontieresPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [frontieres, setFrontieres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Initialisation de la carte Leaflet
  useEffect(() => {
    if (loading || !mapRef.current || mapInstance.current || frontieres.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Création de la carte centrée sur un point neutre
      mapInstance.current = L.map(mapRef.current).setView([20, 0], 2);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(mapInstance.current);

      const markersGroup = L.featureGroup();

      frontieres.forEach((f, i) => {
        if (f.lat && f.lng) {
          // Marqueur numéroté personnalisé
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color:${f.type.includes('Terrestre') ? '#10b981' : '#3b82f6'}; color:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-weight:bold; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3); font-size:10px;">${i + 1}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const marker = L.marker([f.lat, f.lng], { icon: customIcon });
          marker.bindPopup(`<b>${i + 1}. ${f.pays}</b><br><span style="font-size:11px">${f.zone}</span>`);
          marker.addTo(markersGroup);
        }
      });

      markersGroup.addTo(mapInstance.current);
    };

    initMap();
  }, [loading, frontieres]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900">
      
      {/* Navigation Retour */}
      <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-8 transition-colors font-medium group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour à l'accueil
      </Link>

      {/* Header avec Titre Lien Wikipédia */}
      <header className="mb-10">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4">
          Frontières <span className="text-indigo-600">Françaises</span>
        </h1>
        
        {/* Ton nouveau titre interactif pour remplacer le bouton Source */}
        <a 
          href="https://fr.wikipedia.org/wiki/Frontières_de_la_France" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group inline-flex flex-col md:flex-row md:items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <div className="flex items-center gap-2 font-bold text-lg md:text-xl">
            <Globe className="text-indigo-500" size={24} />
            Consulter les détails officiels sur Wikipédia
            <ExternalLink size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-sm md:text-base text-slate-400 font-medium">
            (Cliquez ici pour plus d'informations sur l'histoire et les traités)
          </p>
        </a>
      </header>

      {/* Carte Leaflet */}
      <div className="mb-12 relative">
        <div 
          ref={mapRef} 
          className="h-[400px] md:h-[500px] w-full rounded-3xl border-4 border-white shadow-xl z-0 overflow-hidden bg-slate-200"
        />
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm z-[1000] flex gap-4">
          <span className="flex items-center gap-1 text-emerald-600"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Terrestre</span>
          <span className="flex items-center gap-1 text-blue-600"><div className="w-2 h-2 rounded-full bg-blue-500"/> Maritime</span>
        </div>
      </div>

      {/* Grille des Frontières */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 text-slate-400 font-medium">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
          Chargement de la liste...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {frontieres.map((f, i) => (
            <div 
              key={i} 
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col relative"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-slate-900 text-white text-[10px] font-bold rounded-full">
                    {i + 1}
                  </span>
                  <h3 className="font-bold text-slate-800 leading-tight">{f.pays}</h3>
                </div>
                {f.type.includes('Terrestre') ? 
                  <MapPin size={16} className="text-emerald-500 shrink-0" /> : 
                  <Anchor size={16} className="text-blue-500 shrink-0" />
                }
              </div>

              <div className="space-y-2 mt-auto">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{f.zone}</p>
                <p className="text-xs font-semibold text-indigo-600">{f.type}</p>
                {f.notes && (
                  <div className="flex gap-1.5 mt-2 pt-2 border-t border-slate-50 italic text-[10px] text-slate-500">
                    <AlertCircle size={12} className="shrink-0 text-slate-300" />
                    {f.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-slate-200 text-center text-slate-400 text-xs italic">
        FTS Online 2026 — Données issues de l'article Wikipédia "Frontières de la France".
      </footer>
    </div>
  );
}
