'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, MapPin, Box, AlertCircle, Loader2, Info, Map as MapIcon } from "lucide-react";
import 'leaflet/dist/leaflet.css';

export default function EnclavesPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [enclaves, setEnclaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetch("/api/enclave")
      .then(res => res.json())
      .then(data => {
        setEnclaves(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading || !mapRef.current || mapInstance.current || enclaves.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      mapInstance.current = L.map(mapRef.current).setView([46.5, 2.5], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(mapInstance.current);

      const markersGroup = L.featureGroup();

      enclaves.forEach((e, i) => {
        if (e.lat && e.lng) {
          let markerColor = '#64748b'; 
          if (e.type === 'Régional') markerColor = '#ef4444'; 
          if (e.type === 'Départemental') markerColor = '#8b5cf6'; 
          if (e.type === 'Communal') markerColor = '#3b82f6'; 

          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color:${markerColor}; color:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-weight:bold; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3); font-size:10px;">${i + 1}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const marker = L.marker([e.lat, e.lng], { icon: customIcon });
          marker.bindPopup(`
            <div style="font-family:sans-serif; padding:2px">
              <b style="font-size:14px">${e.nom}</b><br>
              <span style="color:${markerColor}; font-weight:bold; font-size:11px">${e.type}</span><br>
              <span style="font-size:10px; color:#666">${e.appartenance}</span>
            </div>
          `);
          marker.addTo(markersGroup);
        }
      });

      markersGroup.addTo(mapInstance.current);
      // --- AJOUTER ICI ---
      setTimeout(() => {
        if (mapInstance.current) {
          mapInstance.current.invalidateSize();
          setIsReady(true); // <--- L'interrupteur magique
        }
      }, 500);
      // ------------------

      if (enclaves.length > 0) {
        mapInstance.current.fitBounds(markersGroup.getBounds(), { padding: [50, 50] });
      }
    };

    initMap();
  }, [loading, enclaves]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900">
      
      <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-8 transition-colors font-medium group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour à l'accueil
      </Link>

      <header className="mb-10">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4">
          Enclaves & <span className="text-indigo-600">Exclaves</span>
        </h1>
        
        <div className="flex items-center gap-2 text-slate-500 font-bold text-lg md:text-xl">
          <Info className="text-indigo-500" size={24} />
          Géographie : Les curiosités territoriales de France
        </div>
      </header>

      {/* --- CARTE LEAFLET - VERSION CORRIGÉE --- */}
      <div className="mb-12 relative">
        <div
          ref={mapRef}
          className="border-4 border-white rounded-3xl bg-gray-100 shadow-xl overflow-hidden h-[40vh] md:h-[60vh] z-0"
        />
        
        {/* Overlay de chargement */}
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 z-10 rounded-3xl">
            <Loader2 className="animate-spin h-8 w-8 text-violet-600 mb-2" />
            <p className="text-slate-500 animate-pulse text-sm">Chargement de la carte…</p>
          </div>
        )}
          
        {/* Légende - Elle est maintenant BIEN à l'intérieur du conteneur parent */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur px-4 py-2 rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest shadow-md z-[1000] flex flex-wrap gap-4 border border-slate-100">
          <span className="flex items-center gap-1.5 text-red-600"><div className="w-2.5 h-2.5 rounded-full bg-red-500"/> Régional</span>
          <span className="flex items-center gap-1.5 text-purple-600"><div className="w-2.5 h-2.5 rounded-full bg-purple-500"/> Départemental</span>
          <span className="flex items-center gap-1.5 text-blue-600"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"/> Communal</span>
          <span className="flex items-center gap-1.5 text-slate-500"><div className="w-2.5 h-2.5 rounded-full bg-slate-400"/> Parcelles</span>
        </div>
      </div> 
      {/* Un seul </div> ici pour fermer le bloc de la carte ! */}

      {/* SECTION ENCLAVES */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8 border-b border-slate-200 pb-4">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Box size={24} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">Enclaves en France</h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 font-medium italic">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
            Chargement de la base de données...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enclaves.map((e, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-slate-900 text-white text-[10px] font-bold rounded-full">
                      {i + 1}
                    </span>
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{e.nom}</h3>
                  </div>
                  <MapPin size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>

                <div className="space-y-3 mt-auto">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Localisation / Appartenance</p>
                    <p className="text-sm font-semibold text-slate-700 flex items-start gap-1 mt-1">
                      <span>{e.lieu} <br /><small className="text-indigo-600 font-bold uppercase text-[10px]">{e.appartenance}</small></span>
                    </p>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase border w-fit ${
                    e.type === 'Régional' ? 'bg-red-50 border-red-100 text-red-600' : 
                    e.type === 'Départemental' ? 'bg-purple-50 border-purple-100 text-purple-600' : 
                    'bg-blue-50 border-blue-100 text-blue-600'
                  }`}>
                    {e.type}
                  </span>
                  {e.notes && (
                    <div className="flex gap-2 p-3 bg-slate-50 rounded-xl italic text-[11px] text-slate-500 border border-slate-100">
                      <AlertCircle size={14} className="shrink-0 text-slate-300" />
                      {e.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION EXCLAVES */}
      <section className="bg-indigo-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/10 backdrop-blur rounded-lg">
              <MapIcon size={28} />
            </div>
            <h2 className="text-3xl font-extrabold uppercase tracking-tight">Exclaves en France</h2>
          </div>
          
          <p className="text-indigo-100 mb-8 max-w-2xl text-lg leading-relaxed">
            Une exclave est une portion de territoire qui n'est pas connectée physiquement au reste de son entité principale. 
            Découvrez la liste complète et l'histoire des exclaves intérieures sur Wikipédia.
          </p>

          <a 
            href="https://fr.wikipedia.org/wiki/Liste_d%27enclaves_et_d%27exclaves_int%C3%A9rieures_de_la_France" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-indigo-900 px-6 py-4 rounded-xl font-black hover:bg-indigo-50 transition-all shadow-lg hover:shadow-white/10 active:scale-95 group"
          >
            VOIR LA LISTE SUR WIKIPÉDIA
            <ExternalLink size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>
        </div>

        {/* Déco en arrière plan */}
        <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity">
          <MapIcon size={300} />
        </div>
      </section>

      <footer className="mt-20 py-8 border-t border-slate-200 text-center text-slate-400 text-xs italic">
        FTS Online 2026 — Étude géographique des anomalies territoriales françaises.
      </footer>
    </div>
  );
}
