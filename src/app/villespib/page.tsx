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
        // CORRECTION ICI : On accède à la clé du JSON
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
    // On attend que le chargement soit fini, que la div soit là et qu'on ait des villes
    if (loading || !mapRef.current || mapInstance.current || villes.length === 0) return;

    const initMap = async () => {
      // Import dynamique de Leaflet pour éviter l'erreur SSR
      const L = (await import('leaflet')).default;

      // Création de l'instance
      mapInstance.current = L.map(mapRef.current).setView([46.6, 2.2], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(mapInstance.current);

      const markersGroup = L.featureGroup();

      villes.forEach((v) => {
        if (v.lat && v.lng) {
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color:#1e40af; color:white; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-weight:bold; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3); font-size:10px;">${v.rang}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          const marker = L.marker([v.lat, v.lng], { icon: customIcon });
          marker.bindPopup(`
            <div style="min-width:150px">
              <b style="font-size:14px">${v.ville}</b><br>
              <span style="color:#16a34a; font-weight:bold">PIB: ${v.pib_mds_euros} Md€</span>
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

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [loading, villes]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900">
      <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8 font-medium">
        <ArrowLeft size={18} /> Retour à l'accueil
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

      {/* --- CARTE LEAFLET - STRUCTURE CORRIGÉE --- */}
      <div className="mb-8 relative border rounded-2xl bg-gray-100 shadow-inner overflow-hidden h-[40vh] md:h-[60vh]">
        {/* La div de la carte doit être seule */}
        <div
          ref={mapRef}
          className="w-full h-full"
          style={{ zIndex: 0 }}
        />

        {/* L'overlay de chargement doit être un FRÈRE de la div mapRef, pas un enfant */}
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
        <div className="text-center py-20">Chargement des données...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {villes.map((v, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
              <div className="flex justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 bg-blue-900 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                    {v.rang}
                  </span>
                  <h3 className="font-bold text-slate-800">{v.ville}</h3>
                </div>
                <BarChart3 size={18} className="text-blue-500" />
              </div>
              <div className="mt-auto">
                <div className="text-2xl font-black text-emerald-600">
                  {v.pib_mds_euros} <span className="text-xs uppercase">Md €</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Secteurs :</p>
                <p className="text-xs text-slate-600 line-clamp-2">{v.secteurs_cles}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
