'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Globe } from "lucide-react";
import 'leaflet/dist/leaflet.css';

export default function OTANSupPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [data, setData] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  // 1. Charger les données
  useEffect(() => {
    fetch("/api/OTANsup")
      .then(res => res.json())
      .then(json => { if (!json.error) setData(json); })
      .catch(console.error);
  }, []);

  // 2. Initialisation de Leaflet
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (mapInstance.current) return;

      // Correction icônes
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      mapInstance.current = L.map(mapRef.current).setView([20, 10], 2);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);

      setIsReady(true);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 3. Ajout des Marqueurs par Catégorie
  useEffect(() => {
    if (!isReady || !mapInstance.current || !data) return;

    const addMarkers = async () => {
      const L = (await import('leaflet')).default;
      
      // Nettoyage
      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) mapInstance.current.removeLayer(layer);
      });

      const createCategoryMarkers = (list: any[], color: string, label: string) => {
        list?.forEach((p, i) => {
          if (p.lat && p.lng) {
            const customIcon = L.divIcon({
              className: 'custom-marker',
              html: `<div style="background-color:${color}; color:white; border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; font-weight:bold; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3); font-size:9px;">${i + 1}</div>`,
              iconSize: [22, 22],
              iconAnchor: [11, 11]
            });

            const marker = L.marker([p.lat, p.lng], { icon: customIcon });
            marker.bindTooltip(`<strong>${p.pays}</strong><br><small>${label}</small>`);
            marker.bindPopup(`
              <div style="color: black; font-family: sans-serif;">
                <strong style="color:${color}">${p.pays}</strong><br>
                <small>${label}</small>
                ${p.statut ? `<p style="margin:5px 0 0; font-size:11px;">Statut: ${p.statut}</p>` : ''}
              </div>
            `);
            marker.addTo(mapInstance.current);
          }
        });
      };

      // Couleurs par catégorie
      createCategoryMarkers(data.candidatures_promesses, "#ef4444", "Candidat/Promesse");
      createCategoryMarkers(data.partenaires_plan_individuel, "#64748b", "Plan Individuel");
      createCategoryMarkers(data.partenariat_global, "#8b5cf6", "Global");
      createCategoryMarkers(data.partenariat_paix_membres, "#3b82f6", "Partenariat Paix");
      createCategoryMarkers(data.dialogue_mediterraneen, "#f59e0b", "Méditerranée");
      createCategoryMarkers(data.cooperation_istanbul, "#10b981", "Istanbul (ICI)");
    };

    addMarkers();
  }, [isReady, data]);

  if (!data) return <div className="p-10 text-center animate-pulse">Chargement des données...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold mb-6 transition-all">
        <ArrowLeft size={20} /> Retour
      </Link>

      <header className="mb-8 border-b-2 border-indigo-900 pb-6">
        <h1 className="text-3xl md:text-5xl font-black text-indigo-950 flex items-center gap-4">
          <Globe size={40} className="text-indigo-700" />
          {data.nom_liste}
        </h1>
        <p className="text-slate-500 mt-2 italic">Détail des {data.total} coopérations internationales</p>
      </header>

      {/* CARTE */}
      <div className="relative h-[45vh] md:h-[60vh] w-full mb-10 border-4 border-white shadow-xl rounded-3xl bg-slate-200 overflow-hidden z-0">
        <div ref={mapRef} className="h-full w-full" />
      </div>

      <div className="space-y-12">
        {/* Section Dynamique : Candidatures */}
        <section>
          <h2 className="text-2xl font-bold text-red-700 mb-6 flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span> Candidatures et Promesses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.candidatures_promesses?.map((p: any, i: number) => (
              <div key={i} className="group bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500 flex gap-3">
                <span className="text-xl font-black text-slate-200 group-hover:text-red-200">{(i+1).toString().padStart(2,'0')}</span>
                <div>
                  <h3 className="font-bold text-slate-800">{p.pays}</h3>
                  <p className="text-[10px] text-red-600 font-bold uppercase">{p.statut}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section Globale */}
        <section>
          <h2 className="text-2xl font-bold text-purple-700 mb-6 flex items-center gap-2">
            <span className="w-3 h-3 bg-purple-500 rounded-full"></span> Partenariat Global
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.partenariat_global?.map((p: any, i: number) => (
              <div key={i} className="bg-purple-50 p-3 rounded-lg border border-purple-100 flex items-center gap-3">
                <span className="font-black text-purple-300">{i+1}</span>
                <span className="font-bold text-purple-900 text-sm">{p.pays}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Partenariat pour la Paix */}
        <section>
          <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2">
             <span className="w-3 h-3 bg-blue-500 rounded-full"></span> Partenariat pour la Paix (PPP)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {data.partenariat_paix_membres?.map((p: any, i: number) => (
              <div key={i} className="bg-white p-3 rounded-lg border border-slate-200 text-center group hover:bg-blue-600 transition-colors">
                <div className="text-xs font-black text-slate-300 group-hover:text-blue-300">{i+1}</div>
                <div className="font-bold text-slate-800 group-hover:text-white text-sm">{p.pays}</div>
                <div className={`text-[9px] ${p.statut.includes('Suspendue') ? 'text-red-500 group-hover:text-red-200' : 'text-blue-500 group-hover:text-blue-100'}`}>
                  {p.statut}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dialogue et Istanbul */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
              <h2 className="text-xl font-bold text-amber-700 mb-4">☀️ Dialogue Méditerranéen</h2>
              <div className="grid grid-cols-2 gap-3">
                {data.dialogue_mediterraneen?.map((p: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-medium text-amber-900">
                    <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-[10px]">{i+1}</span>
                    {p.pays}
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
              <h2 className="text-xl font-bold text-emerald-700 mb-4">🕌 Coopération d'Istanbul</h2>
              <div className="grid grid-cols-2 gap-3">
                {data.cooperation_istanbul?.map((p: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-medium text-emerald-900">
                    <span className="w-5 h-5 bg-emerald-200 rounded-full flex items-center justify-center text-[10px]">{i+1}</span>
                    {p.pays}
                  </div>
                ))}
              </div>
            </section>
        </div>
      </div>
    </div>
  );
}
