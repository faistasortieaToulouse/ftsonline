'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Globe } from "lucide-react";

export default function OTANSupPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [data, setData] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  // 1. Charger les données
  useEffect(() => {
    fetch("/api/OTANsup")
      .then((res) => res.json())
      .then((json) => {
        if (!json.error) setData(json);
      })
      .catch(console.error);
  }, []);

  // 2. Initialisation sécurisée de Leaflet (Modèle Robuste)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (mapInstance.current) return;

      // Correction icônes
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Création de la map centrée
      mapInstance.current = L.map(mapRef.current).setView([30, 15], 2);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);

      // Forcer le rendu après un court délai
      setTimeout(() => {
        if (mapInstance.current) {
          mapInstance.current.invalidateSize();
          setIsReady(true);
        }
      }, 250);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 3. Ajout des Marqueurs par catégories
  useEffect(() => {
    if (!isReady || !mapInstance.current || !data) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;

      const addGroup = (list: any[], color: string) => {
        list?.forEach((p, index) => {
          if (p.lat && p.lng) {
            const customIcon = L.divIcon({
              className: 'custom-marker',
              html: `<div style="background-color:${color}; color:white; border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; font-weight:bold; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3); font-size:9px;">${index + 1}</div>`,
              iconSize: [22, 22],
              iconAnchor: [11, 11]
            });

            L.marker([p.lat, p.lng], { icon: customIcon })
              .bindPopup(`<strong>${p.pays}</strong>`)
              .addTo(mapInstance.current);
          }
        });
      };

      // Distribution des marqueurs sur la carte
      addGroup(data.candidatures_promesses, "#ef4444"); // Rouge
      addGroup(data.partenaires_plan_individuel, "#64748b"); // Ardoise
      addGroup(data.partenariat_global, "#8b5cf6"); // Violet
      addGroup(data.partenariat_paix_membres, "#3b82f6"); // Bleu
      addGroup(data.dialogue_mediterraneen, "#f59e0b"); // Orange
      addGroup(data.cooperation_istanbul, "#10b981"); // Vert
    };

    updateMarkers();
  }, [isReady, data]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8 border-b-2 border-indigo-900 pb-6">
        <h1 className="text-3xl md:text-5xl font-black text-indigo-950 flex items-center gap-4">
          <Globe size={40} className="text-indigo-900" />
          {data?.nom_liste || "Partenaires de l'OTAN"}
        </h1>
      </header>

      {/* CONTENEUR CARTE */}
      <div className="relative h-[45vh] md:h-[60vh] w-full mb-10 border-4 border-white shadow-xl rounded-3xl bg-slate-200 overflow-hidden z-0">
        <div ref={mapRef} className="h-full w-full" />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-indigo-900 border-t-transparent rounded-full animate-spin"></div>
              <p className="italic text-indigo-900 font-bold">Chargement de la carte mondiale...</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-12">
        
        {/* 1. SECTION IPAP (CORRIGÉE) */}
        <section>
          <h2 className="text-2xl font-bold text-slate-700 mb-4 flex items-center gap-2">📋 Plan d'action individuel (IPAP)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {data?.partenaires_plan_individuel?.map((p: any, i: number) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-slate-400 transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-slate-300">{(i+1).toString().padStart(2,'0')}</span>
                  <span className="font-bold text-slate-800">{p.pays}</span>
                </div>
                <span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-bold text-slate-500 uppercase">Partenaire IPAP</span>
              </div>
            ))}
          </div>
        </section>

        {/* 2. CANDIDATURES */}
        <section>
          <h2 className="text-2xl font-bold text-red-700 mb-4">🚀 Candidatures et Promesses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data?.candidatures_promesses?.map((p: any, i: number) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm border-t-4 border-red-500">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="font-bold text-lg">{p.pays}</h3>
                   <span className="text-xs font-black text-red-200">{(i+1).toString().padStart(2,'0')}</span>
                </div>
                <p className="text-xs text-slate-500 italic mb-2">{p.statut}</p>
                <p className="text-[10px] text-slate-400">PPP: {p.ppp} | MAP: {p.map}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. GLOBAL */}
        <section>
          <h2 className="text-2xl font-bold text-purple-700 mb-4">🌐 Partenariat Global</h2>
          <div className="flex flex-wrap gap-3">
            {data?.partenariat_global?.map((p: any, i: number) => (
              <span key={i} className="bg-purple-50 text-purple-700 border border-purple-100 px-4 py-2 rounded-full font-bold text-sm">
                {p.pays}
              </span>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
