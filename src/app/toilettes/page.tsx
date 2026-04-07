"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Beer, MapPin, Info, Loader2, Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";

const TOULOUSE_CENTER: [number, number] = [43.6045, 1.444];

export default function ToilettesMapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  
  const [data, setData] = useState<{ bars: any[]; sanisettes: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [L, setL] = useState<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Chargement des données
  useEffect(() => {
    fetch("/api/toilettes")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  // 2. Initialisation de la carte avec FIX d'affichage
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || loading) return;

    const initMap = async () => {
      const Leaflet = (await import("leaflet")).default;
      setL(Leaflet);

      if (mapInstance.current) return;

      mapInstance.current = Leaflet.map(mapRef.current!).setView(TOULOUSE_CENTER, 14);

      Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapInstance.current);

      // Correction du bug de rendu (tuiles grises)
      setTimeout(() => {
        mapInstance.current?.invalidateSize();
        setIsMapReady(true);
      }, 300);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [loading]);

  // 3. Ajout des marqueurs avec ANCRES vers les listes
  useEffect(() => {
    if (!L || !mapInstance.current || !data || !isMapReady) return;

    if (markersLayerRef.current) {
      mapInstance.current.removeLayer(markersLayerRef.current);
    }

    const markersGroup = L.layerGroup();

    // Marqueurs des BARS (Rose)
    data.bars.forEach((bar, i) => {
      const barId = `bar-${i}`;
      L.marker([bar.lat, bar.lon], {
        icon: L.divIcon({
          className: "custom-marker",
          html: `<div style="background-color: #db2777; width: 26px; height: 26px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); font-size: 12px;">🍷</div>`,
          iconSize: [26, 26],
        })
      })
      .bindPopup(`
        <div style="text-align: center; font-family: sans-serif;">
            <strong style="color: #db2777;">${bar.nom}</strong><br/>
            <span style="font-size: 11px; color: #666;">Partenaire gratuit</span><br/>
            <a href="#${barId}" style="display: inline-block; margin-top: 8px; background: #db2777; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 10px; font-weight: bold;">VOIR INFOS ↓</a>
        </div>
      `)
      .addTo(markersGroup);
    });

    // Marqueurs des SANISETTES (Bleu)
    data.sanisettes.forEach((sani, i) => {
      const saniId = `sani-${i}`;
      const lat = sani.geo_point_2d.lat;
      const lon = sani.geo_point_2d.lon;
      L.marker([lat, lon], {
        icon: L.divIcon({
          className: "custom-marker",
          html: `<div style="background-color: #2563eb; width: 26px; height: 26px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); font-size: 12px;">🚻</div>`,
          iconSize: [26, 26],
        })
      })
      .bindPopup(`
        <div style="text-align: center; font-family: sans-serif;">
            <strong style="color: #2563eb;">Sanisette Publique</strong><br/>
            <span style="font-size: 11px; color: #666;">${sani.route}</span><br/>
            <a href="#${saniId}" style="display: inline-block; margin-top: 8px; background: #2563eb; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 10px; font-weight: bold;">DÉTAILS ↓</a>
        </div>
      `)
      .addTo(markersGroup);
    });

    markersGroup.addTo(mapInstance.current);
    markersLayerRef.current = markersGroup;

  }, [L, data, isMapReady]);

  const focusOn = (lat: number, lon: number) => {
    if (mapInstance.current) {
      mapInstance.current.setView([lat, lon], 17, { animate: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-pink-600 mb-4" size={40} />
      <p className="text-pink-600 font-black uppercase tracking-tighter italic">Localisation des urinoirs...</p>
    </div>
  );

  return (
    <div className="p-4 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      {/* NAV */}
      <nav className="mb-6 flex justify-between items-center">
        <Link href="/" className="inline-flex items-center gap-2 text-pink-700 hover:text-pink-900 font-black transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          RETOUR À L'ACCUEIL
        </Link>
        <span className="hidden md:block text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Source : ICI Toilettes / Open Data Toulouse</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
          🚽 Toilettes <span className="text-pink-600 tracking-tighter">& PARTENAIRES</span>
        </h1>
        <p className="text-slate-500 font-bold italic text-sm mt-2 uppercase tracking-widest">
            {data ? data.bars.length + data.sanisettes.length : 0} points de soulagement répertoriés
        </p>
      </header>

      {/* CARTE FIXÉE */}
      <div className="mb-12 border-4 border-white rounded-[2.5rem] bg-slate-200 shadow-2xl overflow-hidden h-[45vh] md:h-[55vh] relative z-0 shadow-pink-900/10">
        <div ref={mapRef} className="h-full w-full" />
        {!isMapReady && (
            <div className="absolute inset-0 bg-slate-100 flex items-center justify-center z-10">
                <Loader2 className="animate-spin text-pink-600" />
            </div>
        )}
      </div>

      {/* LISTES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        
        {/* BARS */}
        <section className="flex flex-col">
          <div className="flex items-center justify-between mb-4 bg-pink-900 text-white p-4 rounded-2xl shadow-lg">
            <h2 className="text-sm font-black flex items-center gap-2 uppercase tracking-widest">
              <Beer size={18} /> RÉSEAU ICI TOILETTES ({data?.bars.length})
            </h2>
            <span className="text-[9px] bg-pink-600 text-white px-2 py-1 rounded font-black uppercase italic">Accès Gratuit</span>
          </div>
          
          <div className="h-[500px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
            {data?.bars.map((bar, i) => (
              <div 
                id={`bar-${i}`}
                key={i} 
                onClick={() => focusOn(bar.lat, bar.lon)}
                className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-pink-200 transition-all cursor-pointer group scroll-mt-24"
              >
                <div className="flex justify-between items-start">
                    <h3 className="font-black text-slate-900 uppercase tracking-tighter group-hover:text-pink-600 transition-colors leading-tight">{bar.nom}</h3>
                    <Navigation size={14} className="text-slate-300 group-hover:text-pink-400" />
                </div>
                <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1 mt-1 uppercase italic tracking-tighter">
                  <MapPin size={10} /> {bar.adresse}
                </p>
                {bar.note && <div className="text-[10px] font-bold text-pink-500 mt-3 bg-pink-50 p-2 rounded-lg border border-pink-100 italic">"{bar.note}"</div>}
              </div>
            ))}
          </div>
        </section>

        {/* SANISETTES */}
        <section className="flex flex-col">
          <div className="flex items-center justify-between mb-4 bg-blue-900 text-white p-4 rounded-2xl shadow-lg">
            <h2 className="text-sm font-black flex items-center gap-2 uppercase tracking-widest">
              <Info size={18} /> SANISETTES PUBLIQUES ({data?.sanisettes.length})
            </h2>
            <span className="text-[9px] bg-blue-600 text-white px-2 py-1 rounded font-black uppercase italic">Ville de Toulouse</span>
          </div>

          <div className="h-[500px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
            {data?.sanisettes.map((sani: any, i: number) => (
              <div 
                id={`sani-${i}`}
                key={i} 
                onClick={() => focusOn(sani.geo_point_2d.lat, sani.geo_point_2d.lon)}
                className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group scroll-mt-24"
              >
                <p className="font-black text-slate-900 uppercase tracking-tighter group-hover:text-blue-700 leading-tight">{sani.route}</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-[9px] bg-slate-100 px-2 py-1 rounded font-black text-slate-500 uppercase italic">{sani.type}</span>
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full ${sani.pmr.includes("Non") ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-800"}`}>
                    {sani.pmr.includes("Non") ? "PMR ❌" : "PMR ACCESSIBLE ✅"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}
