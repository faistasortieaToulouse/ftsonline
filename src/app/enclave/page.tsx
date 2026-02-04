'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, MapPin, Box, AlertCircle, Info } from "lucide-react";
import 'leaflet/dist/leaflet.css';

export default function EnclavesPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [enclaves, setEnclaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      
      // Initialisation de la carte centrée sur la France
      mapInstance.current = L.map(mapRef.current).setView([46.5, 2.5], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(mapInstance.current);

      const markersGroup = L.featureGroup();

      enclaves.forEach((e, i) => {
        if (e.lat && e.lng) {
          // Logique de couleur selon le type (Régional, Départemental, Communal)
          let markerColor = '#64748b'; // Gris par défaut
          if (e.type === 'Régional') markerColor = '#ef4444'; // Rouge
          if (e.type === 'Départemental') markerColor = '#8b5cf6'; // Violet
          if (e.type === 'Communal') markerColor = '#3b82f6'; // Bleu

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
      
      // Ajustement automatique du zoom pour voir tous les points
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
        
        <a 
          href="https://fr.wikipedia.org/wiki/Liste_d%27enclaves_et_d%27exclaves_int%C3%A9rieures_de_la_France" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group inline-flex flex-col md:flex-row md:items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <div className="flex items-center gap-2 font-bold text-lg md:text-xl">
            <Info className="text-indigo-500" size={24} />
            Géographie : Les curiosités territoriales de France
            <ExternalLink size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-sm md:text-base text-slate-400 font-medium italic">
            Consulter la liste détaillée sur Wikipédia
          </p>
        </a>
      </header>

      {/* Carte */}
      <div className="mb-12 relative">
        <div 
          ref={mapRef} 
          className="h-[450px] md:h-[600px] w-full rounded-3xl border-4 border-white shadow-xl z-0 overflow-hidden bg-slate-200"
        />
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur px-4 py-2 rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest shadow-md z-[1000] flex flex-wrap gap-4">
          <span className="flex items-center gap-1.5 text-red-600"><div className="w-2.5 h-2.5 rounded-full bg-red-500"/> Régional</span>
          <span className="flex items-center gap-1.5 text-purple-600"><div className="w-2.5 h-2.5 rounded-full bg-purple-500"/> Départemental</span>
          <span className="flex items-center gap-1.5 text-blue-600"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"/> Communal</span>
          <span className="flex items-center gap-1.5 text-slate-500"><div className="w-2.5 h-2.5 rounded-full bg-slate-400"/> Parcelles</span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 font-medium">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
          Analyse des frontières intérieures...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enclaves.map((e, i) => (
            <div 
              key={i} 
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-slate-900 text-white text-[10px] font-bold rounded-full">
                    {i + 1}
                  </span>
                  <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{e.nom}</h3>
                </div>
                <Box size={18} className="text-slate-300 group-hover:rotate-12 transition-transform" />
              </div>

              <div className="space-y-3 mt-auto">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Localisation / Appartenance</p>
                  <p className="text-sm font-semibold text-slate-700 flex items-start gap-1 mt-1">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-slate-400" /> 
                    <span>{e.lieu} <br /><small className="text-indigo-600 font-bold">{e.appartenance}</small></span>
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase border ${
                    e.type === 'Régional' ? 'bg-red-50 border-red-100 text-red-600' : 
                    e.type === 'Départemental' ? 'bg-purple-50 border-purple-100 text-purple-600' : 
                    'bg-blue-50 border-blue-100 text-blue-600'
                  }`}>
                    {e.type}
                  </span>
                </div>

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

      <footer className="mt-20 py-8 border-t border-slate-200 text-center text-slate-400 text-xs italic">
        FTS Online 2026 — Données cartographiques issues de l'étude des enclaves bigourdanes et de l'Enclave des Papes.
      </footer>
    </div>
  );
}
