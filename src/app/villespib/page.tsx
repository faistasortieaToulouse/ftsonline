'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, TrendingUp, Info, Loader2 } from "lucide-react";
import 'leaflet/dist/leaflet.css';

export default function VillesPIBPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [villes, setVilles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // 1. Récupération des données
  useEffect(() => {
    fetch("/api/villespib")
      .then(res => res.json())
      .then(data => {
        if (data && data.classement_pib_france) {
          setVilles(data.classement_pib_france);
        } else {
          console.error("Format de données invalide", data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur fetch:", err);
        setLoading(false);
      });
  }, []);

  // 2. Initialisation de la carte
  useEffect(() => {
    if (loading || !mapRef.current || mapInstance.current || villes.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      mapInstance.current = L.map(mapRef.current).setView([46.6, 2.2], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(mapInstance.current);

      const markersGroup = L.featureGroup();

      villes.forEach((v, i) => {
        if (v.lat && v.lng) {
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color:#1e40af; color:white; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-weight:bold; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3); font-size:10px;">${v.rang}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          // CORRECTION : On utilise une ancre (#ville-card-index) au lieu d'une URL de page
          const anchorTarget = `#ville-card-${i}`;

          const marker = L.marker([v.lat, v.lng], { icon: customIcon });
          marker.bindPopup(`
            <div style="min-width:160px; font-family:sans-serif; padding:5px">
              <b style="font-size:14px; display:block; margin-bottom:2px">${v.ville}</b>
              <span style="color:#16a34a; font-weight:bold; font-size:12px; display:block; margin-bottom:10px">
                PIB: ${v.pib_mds_euros} Md€
              </span>
              <a href="${anchorTarget}" 
                 style="display:block; background-color:#10b981; color:white; text-align:center; padding:6px; border-radius:6px; text-decoration:none; font-weight:bold; font-size:10px;"
              >
                Voir les détails ↓
              </a>
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

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [loading, villes]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900 scroll-smooth">
      <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8 font-medium group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour à l'accueil
      </Link>

      <header className="mb-10">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4">
          Économie <span className="text-blue-600">Française</span>
        </h1>
        <div className="flex items-center gap-2 text-slate-500 font-bold text-lg">
          <TrendingUp className="text-blue-500" size={24} />
          Top 100 des pôles de richesse
        </div>
      </header>

      {/* --- CARTE LEAFLET --- */}
      <div className="mb-8 relative border rounded-2xl bg-gray-100 shadow-inner overflow-hidden h-[40vh] md:h-[60vh]">
        <div
          ref={mapRef}
          className="w-full h-full"
          style={{ zIndex: 0 }}
        />

        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 z-10">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600 mb-2" />
            <p className="text-slate-500 animate-pulse text-sm font-bold uppercase tracking-widest">
              Chargement de la carte…
            </p>
          </div>
        )}
      </div>

      {/* Grille des résultats */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin h-10 w-10 mb-4" />
          <p className="italic">Récupération des indicateurs économiques...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {villes.map((v, i) => (
            /* CORRECTION : Ajout de l'ID et de scroll-mt-10 pour ne pas coller au haut de l'écran lors du scroll */
            <div 
              key={i} 
              id={`ville-card-${i}`}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col group scroll-mt-10"
            >
              <div className="flex justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 bg-blue-900 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                    {v.rang}
                  </span>
                  <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{v.ville}</h3>
                </div>
                <BarChart3 size={18} className="text-blue-500" />
              </div>
              <div className="mt-auto">
                <div className="text-2xl font-black text-emerald-600">
                  {v.pib_mds_euros} <span className="text-xs uppercase">Md €</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">Secteurs clés :</p>
                <p className="text-xs text-slate-600 line-clamp-2 italic">{v.secteurs_cles}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
