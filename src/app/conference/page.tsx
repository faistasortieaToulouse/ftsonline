"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Globe, Phone, MapPin, Building2, Loader2, ExternalLink } from "lucide-react";

// Importation du CSS obligatoire pour Leaflet
import "leaflet/dist/leaflet.css";

interface Conference {
  geo_point_2d: { lon: number; lat: number };
  nom_equipement: string;
  gestionnaire: string;
  telephone: string | null;
  site_web: string | null;
  numero: string;
  lib_off: string;
  ville: string;
}

export default function ConferencePage() {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);

  // 1. Fetch et tri alphabétique
  useEffect(() => {
    fetch("/api/conference")
      .then((res) => res.json())
      .then((data: Conference[]) => {
        if (!Array.isArray(data)) return;
        const sorted = [...data].sort((a, b) =>
          (a.nom_equipement ?? "").localeCompare(b.nom_equipement ?? "")
        );
        setConferences(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 2. Initialisation de la carte avec FIX d'affichage
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || conferences.length === 0 || mapInstance.current) return;

      const L = (await import("leaflet")).default;
      const map = L.map(mapRef.current).setView([43.6045, 1.444], 12);
      mapInstance.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      // FIX : On force le recalcul de la taille pour éviter les tuiles grises
      setTimeout(() => {
        map.invalidateSize();
        setIsMapReady(true);
      }, 400);

      conferences.forEach((c, i) => {
        if (c.geo_point_2d) {
          const customMarker = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #2563eb; width: 26px; height: 26px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 10px; box-shadow: 0 3px 6px rgba(0,0,0,0.3);">${i + 1}</div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13]
          });

          L.marker([c.geo_point_2d.lat, c.geo_point_2d.lon], { icon: customMarker })
            .addTo(map)
            .bindPopup(`
              <div style="font-family: sans-serif; text-align: center; min-width: 150px; padding: 5px;">
                <strong style="color: #1e293b; display: block; margin-bottom: 4px; text-transform: uppercase; font-size: 11px;">${c.nom_equipement}</strong>
                <p style="margin: 0 0 8px 0; font-size: 10px; color: #64748b;">${c.lib_off}</p>
                <a href="#conf-${i}" style="display: inline-block; background: #2563eb; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 10px; font-weight: bold;">VOIR DÉTAILS ↓</a>
              </div>
            `);
        }
      });
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [conferences]);

  const focusOnPoint = (lat: number, lon: number) => {
    if (mapInstance.current) {
      mapInstance.current.flyTo([lat, lon], 16);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="font-black text-xs uppercase tracking-widest text-slate-400 italic">Chargement du réseau culturel...</p>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto bg-slate-50 min-h-screen font-sans text-slate-900">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-black uppercase text-xs transition-all group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Portail Toulouse
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter italic text-center leading-none">
          🎭 Centres <span className="text-blue-600">Culturels</span>
        </h1>
        <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.3em] text-center mt-2">Conférences & Évènements • Toulouse Métropole</p>
      </header>

      {/* Carte Responsive */}
      <div className="relative group">
        <div
          ref={mapRef}
          className="h-[45vh] md:h-[55vh] w-full mb-8 border-4 border-white shadow-2xl rounded-[2.5rem] bg-slate-200 z-0 overflow-hidden transition-all" 
        />
        {!isMapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 rounded-[2.5rem] z-10 backdrop-blur-sm">
             <Loader2 className="animate-spin text-blue-600" size={30} />
          </div>
        )}
      </div>

      {/* --- VERSION DESKTOP : TABLEAU --- */}
      <div className="hidden md:block overflow-hidden rounded-[2rem] border border-slate-200 shadow-sm bg-white">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white text-left text-[10px] uppercase font-black tracking-widest">
              <th className="p-5">#</th>
              <th className="p-5">Nom de l'équipement</th>
              <th className="p-5">Adresse / Ville</th>
              <th className="p-5">Gestionnaire</th>
              <th className="p-5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {conferences.map((c, i) => (
              <tr key={i} id={`conf-${i}`} className="hover:bg-blue-50/50 transition-colors group scroll-mt-20">
                <td className="p-5 font-black text-slate-300 group-hover:text-blue-600 transition-colors">{i + 1}</td>
                <td className="p-5 font-black text-slate-800 uppercase tracking-tighter">{c.nom_equipement}</td>
                <td className="p-5 text-slate-500 italic text-xs">{c.lib_off}, {c.ville}</td>
                <td className="p-5 text-slate-500 font-medium">{c.gestionnaire}</td>
                <td className="p-5">
                  <div className="flex items-center justify-center gap-2">
                    {c.site_web && (
                      <a 
                        href={c.site_web.startsWith('http') ? c.site_web : `http://${c.site_web}`} 
                        target="_blank" 
                        className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      >
                        <Globe size={18} />
                      </a>
                    )}
                    <button 
                      onClick={() => focusOnPoint(c.geo_point_2d.lat, c.geo_point_2d.lon)}
                      className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                    >
                      <MapPin size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- VERSION MOBILE : CARTES --- */}
      <div className="md:hidden space-y-4 mb-10">
        {conferences.map((c, i) => (
          <div key={i} id={`conf-${i}`} className="bg-white rounded-[2rem] p-6 shadow-md border border-slate-100 relative overflow-hidden scroll-mt-24">
            <div className="absolute top-0 right-0 p-4 font-black text-slate-100 text-4xl -z-0">
               {i + 1}
            </div>
            
            <div className="relative z-10">
                <h3 className="text-lg font-black text-slate-900 leading-tight mb-4 uppercase tracking-tighter pr-8">
                  {c.nom_equipement}
                </h3>

                <div className="space-y-3 text-xs mb-6">
                  <div className="flex items-start gap-3 text-slate-600">
                    <MapPin size={16} className="text-blue-600 shrink-0 mt-0.5" />
                    <span className="font-medium italic">{c.lib_off}, {c.ville}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-slate-600">
                    <Building2 size={16} className="text-slate-300 shrink-0" />
                    <span className="truncate font-bold text-slate-400 uppercase tracking-widest text-[9px]">{c.gestionnaire}</span>
                  </div>

                  {c.telephone && (
                    <a href={`tel:${c.telephone}`} className="flex items-center gap-3 text-blue-600 bg-blue-50 w-fit px-3 py-1.5 rounded-lg font-black">
                      <Phone size={14} />
                      <span className="font-mono">{c.telephone}</span>
                    </a>
                  )}
                </div>

                <div className="flex gap-2">
                    {c.site_web && (
                    <a 
                        href={c.site_web.startsWith('http') ? c.site_web : `http://${c.site_web}`}
                        target="_blank"
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-100"
                    >
                        <Globe size={16} /> Site Web
                    </a>
                    )}
                    <button 
                        onClick={() => focusOnPoint(c.geo_point_2d.lat, c.geo_point_2d.lon)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-slate-100"
                    >
                        <MapPin size={16} /> Localiser
                    </button>
                </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        .custom-div-icon { background: none !important; border: none !important; }
        .leaflet-popup-content-wrapper { border-radius: 1.5rem; border: 3px solid #2563eb; padding: 5px; }
        .leaflet-popup-tip { background: #2563eb; }
      `}</style>
    </div>
  );
}
