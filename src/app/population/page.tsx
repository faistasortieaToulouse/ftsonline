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

  // Initialisation de la carte Leaflet
  useEffect(() => {
    if (loading || !mapRef.current || mapInstance.current || villes.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Création de la carte centrée sur la France
      mapInstance.current = L.map(mapRef.current).setView([46.5, 2.5], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(mapInstance.current);

      const markersGroup = L.featureGroup();

      villes.forEach((v, i) => {
        if (v.lat && v.lng) {
          // Marqueur numéroté personnalisé (Indigo pour la population)
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color:#4f46e5; color:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-weight:bold; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3); font-size:10px;">${v.rang}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const marker = L.marker([v.lat, v.lng], { icon: customIcon });
          marker.bindPopup(`
            <div style="font-family:sans-serif; padding:2px">
              <b style="font-size:14px">${v.commune}</b><br>
              <span style="color:#4f46e5; font-weight:bold">${v.pop.toLocaleString()} hab.</span><br>
              <span style="font-size:10px; color:#666">${v.region}</span>
            </div>
          `);
          marker.addTo(markersGroup);
        }
      });

      markersGroup.addTo(mapInstance.current);

      // --- AJOUTE CES LIGNES JUSTE ICI ---
      setTimeout(() => {
        if (mapInstance.current) {
          mapInstance.current.invalidateSize();
          setIsReady(true); // C'est CA qui fait disparaître le chargement
        }
      }, 500);
            
      // Ajuster la vue si des villes sont présentes
      if (villes.length > 0) {
        mapInstance.current.fitBounds(markersGroup.getBounds(), { padding: [50, 50] });
      }
    };

    initMap();
  }, [loading, villes]);

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
          Population <span className="text-indigo-600">Française</span>
        </h1>
        
        <a 
          href="https://fr.wikipedia.org/wiki/Liste_des_communes_de_France_les_plus_peupl%C3%A9es" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group inline-flex flex-col md:flex-row md:items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <div className="flex items-center gap-2 font-bold text-lg md:text-xl">
            <Users className="text-indigo-500" size={24} />
            Classement des communes les plus peuplées : 'use client';
            <ExternalLink size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-sm md:text-base text-slate-400 font-medium italic">
            Consulter la liste détaillée sur Wikipédia
          </p>
        </a>
      </header>

      {/* Carte Leaflet */}
      <div className="mb-12 relative">
        <div 
          ref={mapRef} 
          className="h-[400px] md:h-[500px] w-full rounded-3xl border-4 border-white shadow-xl z-0 overflow-hidden bg-slate-200"
        />

        {/* --- AJOUT DU CHARGEMENT ICI --- */}
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/80 backdrop-blur-sm z-10 rounded-3xl">
            <Loader2 className="animate-spin h-10 w-10 text-indigo-600 mb-3" />
            <p className="text-slate-600 font-bold animate-pulse tracking-wide uppercase text-xs">
              Chargement de la carte...
            </p>
          </div>
        )}
        {/* ------------------------------ */}

        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm z-[1000] flex gap-4 border border-slate-100">
          <span className="flex items-center gap-1.5 text-indigo-600">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"/> Grandes Métropoles
          </span>
        </div>
      </div>

      {/* Titre de la section Grille */}
      <div className="flex items-center gap-3 mb-8 border-b border-slate-200 pb-4">
        <TrendingUp className="text-indigo-600" size={28} />
        <h2 className="text-2xl font-extrabold text-slate-800 uppercase tracking-tight">
          Top des villes de France
        </h2>
      </div>

      {/* Grille des Villes */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 font-medium">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
          Analyse des données démographiques...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {villes.map((v, i) => (
            <div 
              key={i} 
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-indigo-600 text-white text-[10px] font-bold rounded-full">
                    {v.rang}
                  </span>
                  <h3 className="font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                    {v.commune}
                  </h3>
                </div>
                <TrendingUp size={16} className="text-indigo-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="space-y-2 mt-auto">
                <div className="flex items-baseline gap-1">
                  <p className="text-xl font-black text-slate-900">{v.pop.toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Hab.</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <MapPin size={10} /> {v.dept} — {v.region}
                  </p>
                  <p className="text-xs font-semibold text-indigo-500 italic">{v.statut}</p>
                </div>

                {v.notes && (
                  <div className="flex gap-1.5 mt-2 pt-2 border-t border-slate-50 italic text-[10px] text-slate-500">
                    <AlertCircle size={12} className="shrink-0 text-slate-300" />
                    {v.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lien secondaire sous le tableau */}
      <div className="mt-12 p-8 bg-indigo-50 rounded-3xl border border-indigo-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <h3 className="text-indigo-900 font-bold text-lg">Données démographiques complètes</h3>
          <p className="text-indigo-600/70 text-sm">Retrouvez l'intégralité du classement des communes françaises.</p>
        </div>
        <a 
          href="https://fr.wikipedia.org/wiki/Liste_des_communes_de_France_les_plus_peupl%C3%A9es" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          Exclaves en France, voir sur Wikipédia
          <ExternalLink size={18} />
        </a>
      </div>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-slate-200 text-center text-slate-400 text-xs italic">
        FTS Online 2026 — Données issues de l'étude Insee et de Wikipédia.
      </footer>
    </div>
  );
}
