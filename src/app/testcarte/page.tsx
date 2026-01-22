'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Globe, MapPin } from "lucide-react";

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

  // 2. Initialisation robuste de Leaflet
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (mapInstance.current) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      mapInstance.current = L.map(mapRef.current).setView([25, 10], 2);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);

      setTimeout(() => {
        if (mapInstance.current) {
          mapInstance.current.invalidateSize();
          setIsReady(true);
        }
      }, 300);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 3. Ajout des Marqueurs pour TOUTES les catégories
  useEffect(() => {
    if (!isReady || !mapInstance.current || !data) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;

      const addMarkers = (list: any[], color: string) => {
        list?.forEach((p, index) => {
          if (p.lat && p.lng) {
            const customIcon = L.divIcon({
              className: 'custom-marker',
              html: `<div style="background-color:${color}; color:white; border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; font-weight:bold; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3); font-size:9px;">${index + 1}</div>`,
              iconSize: [22, 22],
              iconAnchor: [11, 11]
            });

            L.marker([p.lat, p.lng], { icon: customIcon })
              .bindPopup(`<strong>${p.pays}</strong><br/><span style="font-size:10px; color:#666;">Partenaire OTAN</span>`)
              .addTo(mapInstance.current);
          }
        });
      };

      addMarkers(data.candidatures_promesses, "#ef4444"); // Rouge
      addMarkers(data.partenaires_plan_individuel, "#475569"); // Gris Ardoise
      addMarkers(data.partenariat_global, "#8b5cf6"); // Violet
      addMarkers(data.partenariat_paix_membres, "#3b82f6"); // Bleu
      addMarkers(data.dialogue_mediterraneen, "#f59e0b"); // Ambre
      addMarkers(data.cooperation_istanbul, "#10b981"); // Emeraude
    };

    updateMarkers();
  }, [isReady, data]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8 border-b-2 border-slate-900 pb-6">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 flex items-center gap-4">
          <Globe size={40} className="text-blue-800" />
          {data?.nom_liste || "Partenaires de l'OTAN"}
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Analyse des {data?.total} pays partenaires et candidats</p>
      </header>

      {/* CARTE */}
      <div className="relative h-[45vh] md:h-[60vh] w-full mb-10 border-4 border-white shadow-xl rounded-3xl bg-slate-200 overflow-hidden z-0">
        <div ref={mapRef} className="h-full w-full" />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10 italic text-blue-900 font-bold">
            Chargement des données géographiques...
          </div>
        )}
      </div>

      <div className="space-y-12">
        
        {/* 1. CANDIDATURES */}
        <section>
          <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center gap-2 underline underline-offset-8 decoration-red-200">
            🚀 Candidatures et Promesses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data?.candidatures_promesses?.map((p: any, i: number) => (
              <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-red-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-black text-xl text-slate-800">{p.pays}</h3>
                  <span className="bg-red-50 text-red-600 text-[10px] px-2 py-1 rounded-md font-bold uppercase">{p.statut}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-medium">
                  <p>PPP: <span className="text-slate-800">{p.ppp}</span></p>
                  <p>IPAP: <span className="text-slate-800">{p.ipap}</span></p>
                  <p>MAP: <span className="text-slate-800">{p.map}</span></p>
                  <p>DIALOGUE: <span className="text-slate-800">{p.dialogue}</span></p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. IPAP (LES DONNÉES QUE VOUS VOULIEZ) */}
        <section>
          <h2 className="text-2xl font-bold text-slate-700 mb-4 flex items-center gap-2 underline underline-offset-8 decoration-slate-200">
            📋 Plan d'action individuel (IPAP)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {data?.partenaires_plan_individuel?.map((p: any, i: number) => (
              <div key={i} className="bg-white p-4 rounded-xl border-2 border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold">{i+1}</span>
                  <span className="font-bold text-slate-800 text-lg">{p.pays}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Partenaire IPAP</span>
                  <span className="text-[8px] text-slate-300 italic">{p.lat.toFixed(2)}, {p.lng.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. PARTENARIAT GLOBAL */}
        <section>
          <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center gap-2 underline underline-offset-8 decoration-purple-200">
            🌐 Partenariat Global
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data?.partenariat_global?.map((p: any, i: number) => (
              <div key={i} className="bg-purple-50 p-3 rounded-xl border border-purple-100 flex items-center gap-3">
                <MapPin size={14} className="text-purple-400" />
                <span className="font-bold text-purple-900">{p.pays}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 4. PARTENARIAT POUR LA PAIX (PPP) */}
        <section>
          <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2 underline underline-offset-8 decoration-blue-200">
            🕊️ Partenariat pour la Paix
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {data?.partenariat_paix_membres?.map((p: any, i: number) => (
              <div key={i} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-blue-300 transition-all group">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{p.pays}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-400 font-medium italic">{p.date}</span>
                  <span className={`text-[10px] font-black uppercase ${p.statut === 'Actif' ? 'text-blue-500' : 'text-red-500'}`}>{p.statut}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. DIALOGUE MED ET ISTANBUL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100">
            <h2 className="text-xl font-bold text-amber-700 mb-4 flex items-center gap-2">☀️ Dialogue Méditerranéen</h2>
            <div className="grid grid-cols-2 gap-y-3">
              {data?.dialogue_mediterraneen?.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm text-amber-900 font-semibold">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span> {p.pays}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100">
            <h2 className="text-xl font-bold text-emerald-700 mb-4 flex items-center gap-2">🕌 Coopération d'Istanbul (ICI)</h2>
            <div className="grid grid-cols-2 gap-y-3">
              {data?.cooperation_istanbul?.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm text-emerald-900 font-semibold">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> {p.pays}
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
