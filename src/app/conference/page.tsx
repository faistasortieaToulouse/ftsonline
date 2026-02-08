"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Globe, Phone, MapPin, Building2, Loader2 } from "lucide-react";

// On importe Leaflet uniquement côté client
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

  // 2. Initialisation de la carte
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || conferences.length === 0 || mapInstance.current) return;

      const L = (await import("leaflet")).default;
      const map = L.map(mapRef.current).setView([43.6045, 1.444], 12);
      mapInstance.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      conferences.forEach((c, i) => {
        if (c.geo_point_2d) {
          const customMarker = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #2563eb; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${i + 1}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          L.marker([c.geo_point_2d.lat, c.geo_point_2d.lon], { icon: customMarker })
            .addTo(map)
            .bindPopup(`
              <div style="font-family: sans-serif; min-width: 150px;">
                <strong style="color: #2563eb;">${i + 1}. ${c.nom_equipement}</strong><br/>
                <p style="margin: 4px 0; font-size: 12px;">${c.lib_off}</p>
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="italic text-gray-500">Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour
        </Link>
      </nav>

      <h1 className="text-xl md:text-3xl font-black mb-6 text-center text-slate-900 uppercase tracking-tighter">
        🎭 Centres culturels & Conférences
      </h1>

      {/* Carte Responsive */}
      <div
        ref={mapRef}
        className="h-[40vh] md:h-[60vh] w-full mb-8 border-2 md:border-4 border-white shadow-xl rounded-2xl bg-gray-100 z-0 overflow-hidden" 
      />

      {/* --- VERSION DESKTOP : TABLEAU (Masqué sur mobile) --- */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white text-left text-xs uppercase tracking-widest">
              <th className="p-4">#</th>
              <th className="p-4">Nom</th>
              <th className="p-4">Adresse</th>
              <th className="p-4">Gestionnaire</th>
              <th className="p-4">Téléphone</th>
              <th className="p-4 text-center text-blue-400">Site</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {conferences.map((c, i) => (
              <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                <td className="p-4 font-bold text-slate-400">{i + 1}</td>
                <td className="p-4 font-bold text-slate-800">{c.nom_equipement}</td>
                <td className="p-4 text-slate-600">{c.lib_off}</td>
                <td className="p-4 text-slate-500">{c.gestionnaire}</td>
                <td className="p-4 font-mono text-slate-600">{c.telephone ?? "-"}</td>
                <td className="p-4 text-center">
                  {c.site_web && (
                    <a 
                      href={c.site_web.startsWith('http') ? c.site_web : `http://${c.site_web}`} 
                      target="_blank" 
                      className="inline-flex p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <Globe size={16} />
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- VERSION MOBILE : CARTES (Masqué sur Desktop) --- */}
      <div className="md:hidden space-y-4">
        {conferences.map((c, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-md border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
            
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase">
                Équipement #{i+1}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 leading-tight mb-3">
              {c.nom_equipement}
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 text-slate-600">
                <MapPin size={18} className="text-blue-500 shrink-0" />
                <span>{c.lib_off}, {c.ville}</span>
              </div>
              
              <div className="flex items-center gap-3 text-slate-600">
                <Building2 size={18} className="text-slate-400 shrink-0" />
                <span className="truncate">{c.gestionnaire}</span>
              </div>

              {c.telephone && (
                <div className="flex items-center gap-3 text-slate-600">
                  <Phone size={18} className="text-green-500 shrink-0" />
                  <a href={`tel:${c.telephone}`} className="font-mono">{c.telephone}</a>
                </div>
              )}
            </div>

            {c.site_web && (
              <div className="mt-5 flex justify-end"> {/* Conteneur pour aligner à droite ou à gauche */}
                <a 
                  href={c.site_web.startsWith('http') ? c.site_web : `http://${c.site_web}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-0 hover:gap-3 px-3 py-3 bg-blue-600 text-white rounded-full font-bold shadow-lg transition-all duration-300 ease-in-out max-w-[48px] hover:max-w-[200px] overflow-hidden whitespace-nowrap"
                >
                  {/* L'icône (toujours visible) */}
                  <Globe size={22} className="shrink-0" />
      
                  {/* Le texte (masqué par défaut, apparaît au hover) */}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm">
                    Voir le site web
                  </span>
                </a>
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}