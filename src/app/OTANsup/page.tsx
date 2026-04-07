'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Globe, MapPin, ExternalLink, ShieldAlert, Users, Info } from "lucide-react";

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

      mapInstance.current = L.map(mapRef.current!).setView([25, 10], 2);

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

  // 3. Ajout des Marqueurs avec numéros et couleurs
  useEffect(() => {
    if (!isReady || !mapInstance.current || !data) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;

      const addMarkers = (list: any[], color: string, categoryId: string, categoryLabel: string) => {
        list?.forEach((p, index) => {
          if (p.lat && p.lng) {
            const customIcon = L.divIcon({
              className: 'custom-marker',
              html: `<div style="background-color:${color}; color:white; border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; font-weight:900; border:2px solid white; box-shadow:0 4px 8px rgba(0,0,0,0.2); font-size:9px;">${index + 1}</div>`,
              iconSize: [22, 22],
              iconAnchor: [11, 11]
            });

            L.marker([p.lat, p.lng], { icon: customIcon })
              .bindPopup(`
                <div style="font-family: sans-serif; min-width: 150px; padding: 5px;">
                  <div style="font-size: 9px; font-weight: 900; color: ${color}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">${categoryLabel}</div>
                  <strong style="font-size: 15px; color: #0f172a; display: block; margin-bottom: 8px;">${p.pays}</strong>
                  
                  <a href="#${categoryId}" style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                    background: #f8fafc;
                    color: #334155;
                    text-decoration: none;
                    padding: 6px;
                    border-radius: 8px;
                    font-size: 10px;
                    font-weight: 800;
                    border: 1px solid #e2e8f0;
                    text-transform: uppercase;
                  ">Détails section ↓</a>
                </div>
              `)
              .addTo(mapInstance.current);
          }
        });
      };

      addMarkers(data.candidatures_promesses, "#ef4444", "section-candidats", "Candidat / Promesse");
      addMarkers(data.partenaires_plan_individuel, "#475569", "section-ipap", "Partenaire IPAP");
      addMarkers(data.partenariat_global, "#8b5cf6", "section-global", "Partenariat Global");
      addMarkers(data.partenariat_paix_membres, "#3b82f6", "section-ppp", "Partenaire pour la Paix");
      addMarkers(data.dialogue_mediterraneen, "#f59e0b", "section-med", "Dialogue Méditerranéen");
      addMarkers(data.cooperation_istanbul, "#10b981", "section-istanbul", "Initiative Istanbul");
    };

    updateMarkers();
  }, [isReady, data]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-black uppercase text-[10px] tracking-widest transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Portail Diplomatique
        </Link>
      </nav>

      <header className="mb-10 border-b-4 border-slate-900 pb-8">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 flex items-center gap-4 italic uppercase tracking-tighter">
          <Globe size={48} className="text-blue-700" />
          {data?.nom_liste || "Partenaires de l'OTAN"}
        </h1>
        <p className="text-slate-500 mt-4 font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-2 italic">
          <Info size={16} className="text-blue-600" /> Analyse Géopolitique : {data?.total} nations partenaires
        </p>
      </header>

      {/* CARTE */}
      <div className="relative h-[45vh] md:h-[65vh] w-full mb-16 border-4 border-white shadow-2xl rounded-[3rem] bg-slate-200 overflow-hidden z-0">
        <div ref={mapRef} className="h-full w-full" />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/90 z-10 backdrop-blur-md">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 animate-pulse">Cartographie des alliances en cours...</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-20">
        
        {/* 1. CANDIDATURES */}
        <section id="section-candidats" className="scroll-mt-10">
          <h2 className="text-3xl font-black text-red-700 mb-8 flex items-center gap-4 italic uppercase tracking-tighter">
            <ShieldAlert size={32} /> Candidatures et Promesses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data?.candidatures_promesses?.map((p: any, i: number) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-red-100 hover:shadow-xl transition-all relative overflow-hidden group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <span className="bg-red-600 text-white w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black shadow-lg shadow-red-200">{i+1}</span>
                    <h3 className="font-black text-2xl text-slate-900 uppercase tracking-tighter">{p.pays}</h3>
                  </div>
                  <span className="bg-red-50 text-red-600 text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-red-100">{p.statut}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                  <div className="p-3 bg-slate-50 rounded-xl">PPP: <span className="text-red-600 block text-xs">{p.ppp}</span></div>
                  <div className="p-3 bg-slate-50 rounded-xl">IPAP: <span className="text-red-600 block text-xs">{p.ipap}</span></div>
                  <div className="p-3 bg-slate-50 rounded-xl">MAP: <span className="text-red-600 block text-xs">{p.map}</span></div>
                  <div className="p-3 bg-slate-50 rounded-xl">DIALOGUE: <span className="text-red-600 block text-xs">{p.dialogue}</span></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. IPAP */}
        <section id="section-ipap" className="scroll-mt-10">
          <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3 italic uppercase tracking-tighter">
            <MapPin size={24} className="text-slate-400" /> Plan d'action individuel (IPAP)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.partenaires_plan_individuel?.map((p: any, i: number) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between hover:border-slate-900 transition-all group">
                <div className="flex items-center gap-4">
                  <span className="bg-slate-900 text-white w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black">{i+1}</span>
                  <span className="font-black text-slate-900 text-lg uppercase tracking-tight">{p.pays}</span>
                </div>
                <ExternalLink size={16} className="text-slate-200 group-hover:text-slate-900 transition-colors" />
              </div>
            ))}
          </div>
        </section>

        {/* 3. PARTENARIAT GLOBAL */}
        <section id="section-global" className="scroll-mt-10">
          <h2 className="text-2xl font-black text-purple-700 mb-6 flex items-center gap-3 italic uppercase tracking-tighter">
            <Globe size={24} /> Partenariat Global
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {data?.partenariat_global?.map((p: any, i: number) => (
              <div key={i} className="bg-purple-50 p-4 rounded-2xl border border-purple-100 flex items-center gap-3 hover:bg-purple-600 hover:text-white transition-all group cursor-default">
                <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black group-hover:bg-white group-hover:text-purple-600 shrink-0">{i+1}</span>
                <span className="font-black uppercase tracking-tighter text-sm">{p.pays}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 4. PARTENARIAT POUR LA PAIX (PPP) */}
        <section id="section-ppp" className="scroll-mt-10">
          <h2 className="text-2xl font-black text-blue-700 mb-8 flex items-center gap-3 italic uppercase tracking-tighter">
            <Users size={28} /> Partenariat pour la Paix
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {data?.partenariat_paix_membres?.map((p: any, i: number) => (
              <div key={i} className="bg-white p-5 rounded-[1.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black">{i+1}</span>
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${p.statut.includes('Actif') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{p.statut}</span>
                </div>
                <h3 className="font-black text-slate-900 uppercase tracking-tighter group-hover:text-blue-600 transition-colors">{p.pays}</h3>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{p.date}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. DIALOGUE MED ET ISTANBUL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          <section id="section-med" className="bg-amber-50/50 p-8 rounded-[3rem] border border-amber-100 scroll-mt-10">
            <h2 className="text-xl font-black text-amber-700 mb-6 flex items-center gap-3 uppercase tracking-widest">☀️ Dialogue Méditerranéen</h2>
            <div className="grid grid-cols-2 gap-4">
              {data?.dialogue_mediterraneen?.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-3 text-sm text-amber-900 font-black uppercase tracking-tighter">
                  <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0">{i+1}</span>
                  {p.pays}
                </div>
              ))}
            </div>
          </section>

          <section id="section-istanbul" className="bg-emerald-50/50 p-8 rounded-[3rem] border border-emerald-100 scroll-mt-10">
            <h2 className="text-xl font-black text-emerald-700 mb-6 flex items-center gap-3 uppercase tracking-widest">🕌 Initiative Istanbul (ICI)</h2>
            <div className="grid grid-cols-2 gap-4">
              {data?.cooperation_istanbul?.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-3 text-sm text-emerald-900 font-black uppercase tracking-tighter">
                  <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0">{i+1}</span>
                  {p.pays}
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>

      <style jsx global>{`
        .custom-marker { background: none !important; border: none !important; }
        
        .leaflet-popup-content-wrapper { 
          border-radius: 1.5rem; 
          border: 1px solid #e2e8f0; 
          background: white;
          box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.1);
        }
        .leaflet-popup-tip { background: white; border: 1px solid #e2e8f0; }
        
        .leaflet-container a.leaflet-popup-close-button {
          color: #0f172a;
          font-weight: 900;
          padding: 12px 12px 0 0;
        }

        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
