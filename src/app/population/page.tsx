'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, ExternalLink, MapPin, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import 'leaflet/dist/leaflet.css';

export default function PopulationPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [villes, setVilles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Utilitaire pour créer des ancres propres
  const slugify = (text: string) => 
    text.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

  useEffect(() => {
    fetch("/api/population")
      .then(res => res.json())
      .then(data => {
        setVilles(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading || !mapRef.current || mapInstance.current || villes.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      mapInstance.current = L.map(mapRef.current!).setView([46.5, 2.5], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(mapInstance.current);

      const markersGroup = L.featureGroup();

      villes.forEach((v) => {
        if (v.lat && v.lng) {
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color:#4f46e5; color:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-weight:bold; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3); font-size:10px;">${v.rang}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const marker = L.marker([v.lat, v.lng], { icon: customIcon });
          
          // LIEN VERS L'ANCRE DANS LA POPUP
          marker.bindPopup(`
            <div style="font-family:sans-serif; padding:5px; min-width:150px">
              <b style="font-size:14px; display:block; margin-bottom:2px">${v.commune}</b>
              <span style="color:#4f46e5; font-weight:bold; display:block; margin-bottom:8px">${v.pop.toLocaleString()} hab.</span>
              <a href="#ville-${slugify(v.commune)}" style="
                display: block;
                background: #4f46e5;
                color: white;
                text-decoration: none;
                padding: 6px;
                border-radius: 6px;
                font-size: 10px;
                font-weight: bold;
                text-align: center;
                text-transform: uppercase;
              ">Voir les détails ↓</a>
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
            
      if (villes.length > 0) {
        mapInstance.current.fitBounds(markersGroup.getBounds(), { padding: [50, 50] });
      }
    };

    initMap();
  }, [loading, villes]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900 scroll-smooth">
      
      {/* Style global pour le scroll fluide */}
      <style jsx global>{`
        html { scroll-behavior: smooth; }
        .custom-marker { background: none !important; border: none !important; }
      `}</style>

      {/* Navigation Retour */}
      <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-8 transition-colors font-medium group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour à l'accueil
      </Link>

      <header className="mb-10">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4 italic uppercase">
          Population <span className="text-indigo-600">Française</span>
        </h1>
        
        <div className="flex items-center gap-2 font-bold text-lg text-slate-500 uppercase tracking-tight">
          <Users className="text-indigo-500" size={24} />
          Top des communes les plus peuplées (2026)
        </div>
      </header>

      {/* Carte Leaflet */}
      <div className="mb-12 relative">
        <div 
          ref={mapRef} 
          className="h-[400px] md:h-[550px] w-full rounded-[2.5rem] border-4 border-white shadow-2xl z-0 overflow-hidden bg-slate-200"
        />

        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/80 backdrop-blur-sm z-10 rounded-[2.5rem]">
            <Loader2 className="animate-spin h-10 w-10 text-indigo-600 mb-3" />
            <p className="text-slate-900 font-black animate-pulse tracking-widest uppercase text-xs">
              Chargement de la carte démographique...
            </p>
          </div>
        )}

        <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm z-[1000] flex gap-4 border border-slate-100">
          <span className="flex items-center gap-1.5 text-indigo-600">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"/> Zones Urbaines Denses
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-8 border-b border-slate-200 pb-4">
        <TrendingUp className="text-indigo-600" size={28} />
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">
          Données par commune
        </h2>
      </div>

      {/* Grille des Villes */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 font-bold uppercase text-xs tracking-[0.2em]">
          <Loader2 className="animate-spin h-10 w-10 text-indigo-600 mb-4" />
          Analyse des données Insee...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {villes.map((v, i) => (
            <div 
              key={i} 
              id={`ville-${slugify(v.commune)}`} // L'ANCRE EST ICI
              className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-500 transition-all duration-300 p-6 flex flex-col group scroll-mt-10"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-slate-900 text-white text-[10px] font-black rounded-lg group-hover:bg-indigo-600 transition-colors">
                    {v.rang}
                  </span>
                  <h3 className="font-black text-slate-900 text-lg uppercase tracking-tighter leading-tight group-hover:text-indigo-600 transition-colors">
                    {v.commune}
                  </h3>
                </div>
                <TrendingUp size={20} className="text-slate-200 group-hover:text-indigo-500 transition-colors" />
              </div>

              <div className="space-y-4 mt-auto">
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-black text-slate-900 italic tracking-tighter">
                    {v.pop.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Habitants</p>
                </div>
                
                <div className="pt-4 border-t border-slate-50 space-y-2">
                  <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                    <MapPin size={12} className="text-indigo-400" /> {v.region}
                  </p>
                  <p className="text-xs font-bold text-slate-500">Dép : {v.dept}</p>
                  <p className="text-[10px] font-bold text-indigo-500 italic bg-indigo-50 px-2 py-1 rounded inline-block">
                    {v.statut}
                  </p>
                </div>

                {v.notes && (
                  <div className="flex gap-2 mt-2 italic text-[10px] text-slate-400 font-medium">
                    <AlertCircle size={14} className="shrink-0 text-slate-200" />
                    {v.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Info Wikipédia */}
      <div className="mt-16 p-10 bg-slate-900 rounded-[3rem] border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
        <div className="text-center md:text-left">
          <h3 className="text-white font-black text-xl uppercase tracking-tighter italic">Base de données exhaustive</h3>
          <p className="text-slate-400 text-sm font-medium">Accédez à l'historique complet des recensements sur Wikipédia.</p>
        </div>
        <a 
          href="https://fr.wikipedia.org/wiki/Liste_des_communes_de_France_les_plus_peupl%C3%A9es" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl"
        >
          Voir sur Wikipédia
          <ExternalLink size={18} />
        </a>
      </div>

      <footer className="mt-12 py-8 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
        FTS Online 2026 — Insee Data Synchronized
      </footer>
    </div>
  );
}
