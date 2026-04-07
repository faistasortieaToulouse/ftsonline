'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Map as MapIcon, Compass, Anchor } from "lucide-react";
import 'leaflet/dist/leaflet.css';

interface Territoire {
  nom: string;
  statut: string;
  continent: string;
  lat: number;
  lng: number;
  description: string;
}

export default function FranceTerritoiresPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [territoires, setTerritoires] = useState<Territoire[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Utilitaire pour les ancres
  const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  useEffect(() => {
    fetch("/api/France")
      .then(async (res) => {
        const data = await res.json();
        if (Array.isArray(data)) {
          const ordreContinents = ["Europe", "Afrique", "Amérique", "Asie", "Antarctique", "Océanie"];
          const sorted = data.sort((a, b) => {
            if (a.continent !== b.continent) {
              return ordreContinents.indexOf(a.continent) - ordreContinents.indexOf(b.continent);
            }
            return a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' });
          });
          setTerritoires(sorted);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || territoires.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (mapInstance.current) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, {
        scrollWheelZoom: true,
      }).setView([20, 10], 2);

      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      territoires.forEach((t, index) => {
        if (t.lat && t.lng) {
          const color = t.continent === "Europe" ? "#1e3a8a" : "#ef4444";
          
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color:${color}; color:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-weight:900; border:2px solid white; box-shadow:0 4px 8px rgba(0,0,0,0.3); font-size:10px; font-family:sans-serif;">${index + 1}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const marker = L.marker([t.lat, t.lng], { icon: customIcon }).addTo(map);

          marker.bindPopup(`
            <div style="font-family: sans-serif; min-width: 180px; padding: 5px;">
              <div style="font-size: 9px; font-weight: 900; color: ${color}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;">${t.continent}</div>
              <strong style="font-size: 15px; color: #0f172a; display: block; text-transform: uppercase; margin-bottom: 4px;">${t.nom}</strong>
              <div style="font-size: 11px; font-weight: 700; color: #2563eb; margin-bottom: 8px;">${t.statut}</div>
              
              <a href="#territoire-${slugify(t.nom)}" style="
                display: block;
                background: #1e293b;
                color: white;
                text-decoration: none;
                padding: 6px;
                border-radius: 6px;
                font-size: 9px;
                font-weight: 900;
                text-align: center;
                text-transform: uppercase;
              ">Détails du territoire ↓</a>
            </div>
          `);
        }
      });

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
  }, [territoires]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans text-slate-900">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-700 font-black uppercase text-[10px] tracking-widest group transition-colors">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour Accueil
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b-8 border-slate-900 pb-8 gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none flex items-center gap-4">
              <Compass size={48} className="text-blue-700" />
              République
            </h1>
            <p className="text-blue-700 font-black uppercase tracking-[0.2em] text-xs mt-3 italic">
              Inventaire Géographique des Territoires & Domaines
            </p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Sites Répertoriés</span>
            <span className="text-3xl font-black text-blue-900 italic">{territoires.length} Lieux</span>
          </div>
        </header>

        {/* CARTE */}
        <div className="relative w-full h-[450px] md:h-[650px] bg-slate-200 rounded-[2.5rem] mb-16 shadow-2xl border-4 md:border-[12px] border-white overflow-hidden z-0">
          <div ref={mapRef} className="h-full w-full" />
          {!isReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/90 backdrop-blur-sm z-10">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Ouverture des archives cartographiques...</p>
            </div>
          )}
        </div>

        {/* LISTING PAR CONTINENT */}
        <div className="space-y-16">
          {["Europe", "Afrique", "Amérique", "Asie", "Antarctique", "Océanie"].map((continent) => {
            const list = territoires.filter(t => t.continent === continent);
            if (list.length === 0) return null;

            return (
              <section key={continent} className="relative">
                <div className="flex items-center gap-6 mb-10">
                  <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-slate-900">
                    {continent}
                  </h2>
                  <div className="h-1 flex-1 bg-slate-200 rounded-full"></div>
                  <span className="bg-blue-900 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">
                    {list.length} {list.length > 1 ? 'Entités' : 'Entité'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {list.map((t) => {
                    const globalIndex = territoires.indexOf(t);
                    return (
                      <div 
                        key={t.nom} 
                        id={`territoire-${slugify(t.nom)}`}
                        className="group p-6 bg-white rounded-[2rem] hover:bg-blue-900 transition-all duration-500 border border-slate-100 hover:border-blue-700 hover:shadow-2xl hover:-translate-y-2 scroll-mt-10"
                      >
                        <div className="flex justify-between items-start mb-6">
                           <span className="text-3xl font-black text-slate-100 group-hover:text-blue-800 transition-colors italic">
                             #{(globalIndex + 1).toString().padStart(2, '0')}
                           </span>
                           <Anchor size={20} className="text-slate-200 group-hover:text-blue-400 transition-colors" />
                        </div>

                        <div>
                          <h3 className="text-xl font-black text-slate-900 group-hover:text-white transition-colors uppercase italic tracking-tight">
                            {t.nom}
                          </h3>
                          <div className="inline-block px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-[9px] font-black uppercase tracking-widest mt-2 group-hover:bg-blue-800 group-hover:text-blue-100 transition-colors">
                            {t.statut}
                          </div>
                          <p className="text-sm text-slate-500 group-hover:text-blue-100 mt-6 leading-relaxed line-clamp-4 transition-colors">
                            {t.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        .custom-marker { background: none !important; border: none !important; }
        .leaflet-popup-content-wrapper { border-radius: 1.2rem; border: 1px solid #e2e8f0; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
