'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, TrendingUp, Info } from "lucide-react";
import 'leaflet/dist/leaflet.css';

export default function VillesPIBPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [villes, setVilles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Récupération des données
  useEffect(() => {
    fetch("/api/villespib")
      .then(res => res.json())
      .then(data => {
        setVilles(data.classement_pib_france || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur:", err);
        setLoading(false);
      });
  }, []);

  // Initialisation de la carte Leaflet (même logique que frontières)
  useEffect(() => {
    if (loading || !mapRef.current || mapInstance.current || villes.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Création de la carte centrée sur la France
      mapInstance.current = L.map(mapRef.current).setView([46.6033, 1.8883], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(mapInstance.current);

      const markersGroup = L.featureGroup();

      villes.forEach((v) => {
        if (v.lat && v.lng) {
          // Marqueur personnalisé avec le rang
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color:#1e40af; color:white; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-weight:bold; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3); font-size:10px;">${v.rang}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          const marker = L.marker([v.lat, v.lng], { icon: customIcon });
          marker.bindPopup(`
            <div style="font-family: sans-serif; padding: 5px;">
              <b style="font-size: 14px;">${v.ville}</b><br>
              <span style="color: #16a34a; font-weight: bold;">PIB : ${v.pib_mds_euros} Md€</span><br>
              <p style="font-size: 11px; margin-top: 5px; color: #64748b;">${v.secteurs_cles}</p>
            </div>
          `);
          marker.addTo(markersGroup);
        }
      });

      markersGroup.addTo(mapInstance.current);
    };

    initMap();

    // Nettoyage de l'instance au démontage
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [loading, villes]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900">
      
      {/* Navigation Retour */}
      <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8 transition-colors font-medium group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour à l'accueil
      </Link>

      {/* Header */}
      <header className="mb-10">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4">
          Économie <span className="text-blue-600">Française</span>
        </h1>
        <div className="flex items-center gap-2 text-slate-500 font-bold text-lg">
          <TrendingUp className="text-blue-500" size={24} />
          Classement des 100 premiers pôles de richesse (PIB)
        </div>
      </header>

      {/* Carte Leaflet (Utilisation de la Ref) */}
      <div className="mb-12">
        <div 
          ref={mapRef} 
          className="h-[400px] md:h-[600px] w-full rounded-3xl border-4 border-white shadow-xl z-0 overflow-hidden bg-slate-200"
        />
      </div>

      {/* Liste des Villes */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 text-slate-400 font-medium">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
          Analyse des données économiques...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {villes.map((v, i) => (
            <div 
              key={i} 
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 bg-blue-900 text-white text-[11px] font-bold rounded-full shadow-sm">
                    {v.rang}
                  </span>
                  <h3 className="font-bold text-slate-800 leading-tight">{v.ville}</h3>
                </div>
                <BarChart3 size={18} className="text-blue-500 shrink-0" />
              </div>

              <div className="space-y-2 mt-auto">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-emerald-600">{v.pib_mds_euros}</span>
                  <span className="text-xs font-bold text-emerald-700 uppercase">Mds €</span>
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Secteurs Clés</p>
                <p className="text-xs font-medium text-slate-600 leading-relaxed">{v.secteurs_cles}</p>
                
                <div className="flex gap-1.5 mt-3 pt-3 border-t border-slate-50 italic text-[10px] text-slate-400">
                  <Info size={12} className="shrink-0" />
                  Données estimatives par zone urbaine.
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-slate-200 text-center text-slate-400 text-xs italic">
        FTS Online 2026 — Classement basé sur les données du PIB des aires urbaines françaises.
      </footer>
    </div>
  );
}
