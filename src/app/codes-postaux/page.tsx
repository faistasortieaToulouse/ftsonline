"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Map as MapIcon, Hash, navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface GeoPoint { lat: number; lon: number }
interface GeoShape { geometry: { coordinates: any; type: string } }

interface CodePostal {
  id: string;
  code_postal: string;
  communes: string[];
  geo_point_2d: GeoPoint | null;
  geo_shape: GeoShape | null;
  numero?: number;
}

const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#7c3aed", "#ea580c", "#0891b2"];

export default function CodesPostauxPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [codes, setCodes] = useState<CodePostal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Fetch et Traitement des données
  useEffect(() => {
    fetch("/api/codes-postaux")
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const sorted = data.sort((a, b) => a.code_postal.localeCompare(b.code_postal, "fr", { numeric: true }));

        let num = 0;
        const processed: CodePostal[] = sorted.map(code => {
          if (code.code_postal === "31820") return { ...code, numero: 20 };
          num++;
          const numero = num < 20 ? num : num + 1;
          return { ...code, numero };
        });

        setCodes(processed);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // 2. Initialisation de Leaflet avec FIX de rendu
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || codes.length === 0) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      if (mapInstance.current) return;

      const map = L.map(mapRef.current!).setView([43.6045, 1.444], 11);
      mapInstance.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      // FIX : Forcer le calcul de la taille pour éviter les zones grises
      setTimeout(() => {
        map.invalidateSize();
        setIsMapReady(true);
      }, 500);

      // Ajout des données
      codes.forEach((code, index) => {
        const color = COLORS[index % COLORS.length];
        const numero = code.numero ?? index + 1;

        // A. Ajout du Marqueur Numéroté
        if (code.geo_point_2d) {
          const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 11px; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">${numero}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          });

          L.marker([code.geo_point_2d.lat, code.geo_point_2d.lon], { icon: customIcon })
            .addTo(map)
            .bindPopup(`
              <div style="font-family: sans-serif; text-align: center; padding: 5px;">
                <div style="color: ${color}; font-weight: 900; font-size: 14px;">#${numero} – ${code.code_postal}</div>
                <div style="font-size: 11px; color: #64748b; margin: 4px 0 8px;">${code.communes.join(", ")}</div>
                <a href="#postal-${code.code_postal}" style="display: inline-block; background: #1e293b; color: white; padding: 5px 10px; border-radius: 6px; text-decoration: none; font-size: 10px; font-weight: bold; text-transform: uppercase;">Voir la liste ↓</a>
              </div>
            `);
        }

        // B. Ajout du Polygone (GeoShape)
        if (code.geo_shape?.geometry?.coordinates) {
          const type = code.geo_shape.geometry.type;
          const coords = code.geo_shape.geometry.coordinates;
          const formatCoords = (c: any[]) => c.map(pt => [pt[1], pt[0]]);

          const polyOptions = {
            color: color,
            fillColor: color,
            fillOpacity: 0.15,
            weight: 3,
            dashArray: '5, 10'
          };

          if (type === "Polygon") {
            L.polygon(formatCoords(coords[0]), polyOptions).addTo(map);
          } else if (type === "MultiPolygon") {
            coords.forEach((poly: any) => {
              L.polygon(formatCoords(poly[0]), polyOptions).addTo(map);
            });
          }
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
  }, [codes]);

  const focusOnCode = (code: CodePostal) => {
    if (mapInstance.current && code.geo_point_2d) {
      mapInstance.current.flyTo([code.geo_point_2d.lat, code.geo_point_2d.lon], 13, { duration: 1.5 });
      if (window.innerWidth < 1024) {
        window.scrollTo({ top: 100, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="flex flex-col h-screen p-4 gap-4 bg-slate-50 font-sans text-slate-900">
      
      <nav className="flex justify-between items-center px-1">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-black uppercase text-xs tracking-widest transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          RETOUR ACCUEIL
        </Link>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
          <MapIcon size={12} /> Toulouse Métropole
        </div>
      </nav>

      <header className="flex items-center gap-4 bg-white p-5 rounded-[2rem] shadow-sm border border-slate-200">
        <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
          <Hash size={28} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
            Secteurs <span className="text-blue-600">Postaux</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Découpage géographique des communes</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden min-h-0">
        
        {/* LISTE DES CODES */}
        <div className="lg:col-span-4 bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 sticky top-0 z-20 text-white">
              <tr>
                <th className="p-4 text-[10px] uppercase font-black tracking-widest w-16 text-center">N°</th>
                <th className="p-4 text-[10px] uppercase font-black tracking-widest">Code</th>
                <th className="p-4 text-[10px] uppercase font-black tracking-widest">Communes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {codes.map((code, index) => (
                <tr
                  key={code.id}
                  id={`postal-${code.code_postal}`}
                  onClick={() => focusOnCode(code)}
                  className="hover:bg-blue-50/50 cursor-pointer transition-all group scroll-mt-24"
                >
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-400 font-black text-[10px] group-hover:bg-blue-600 group-hover:text-white transition-all border border-slate-200">
                      {code.numero}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-black text-blue-700 text-sm group-hover:scale-110 origin-left transition-transform">
                      {code.code_postal}
                    </div>
                  </td>
                  <td className="p-4 text-xs font-bold text-slate-500 italic leading-tight">
                    {code.communes.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CARTE */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white relative z-0">
          {loading && (
            <div className="absolute inset-0 z-50 bg-slate-50/90 backdrop-blur-sm flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-slate-900 font-black text-xs uppercase tracking-widest italic animate-pulse">Cartographie des secteurs...</p>
            </div>
          )}

          <div 
            ref={mapRef} 
            className="h-full w-full"
          />
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2563eb; }
        .leaflet-popup-content-wrapper { border-radius: 1.2rem; border: 3px solid #1e293b; overflow: hidden; }
        .leaflet-popup-tip { background: #1e293b; }
        .custom-div-icon { background: none !important; border: none !important; }
      `}</style>
    </div>
  );
}
