"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Beer, MapPin, Info } from "lucide-react";
import "leaflet/dist/leaflet.css";

const TOULOUSE_CENTER: [number, number] = [43.6045, 1.444];

export default function ToilettesMapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayerRef = useRef<any>(null); // Pour nettoyer les marqueurs proprement
  
  const [data, setData] = useState<{ bars: any[]; sanisettes: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [L, setL] = useState<any>(null);

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

  // 2. Initialisation de la carte Leaflet
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
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [loading]);

  // 3. Ajout des marqueurs avec gestion du nettoyage
  useEffect(() => {
    if (!L || !mapInstance.current || !data) return;

    // Nettoyage des anciens marqueurs pour éviter les doublons
    if (markersLayerRef.current) {
      mapInstance.current.removeLayer(markersLayerRef.current);
    }

    const markersGroup = L.layerGroup();

    // Marqueurs des BARS (Rose)
    data.bars.forEach((bar) => {
      L.marker([bar.lat, bar.lon], {
        icon: L.divIcon({
          className: "custom-marker",
          html: `<div style="background-color: #db2777; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 12px;">🍷</div>`,
          iconSize: [24, 24],
        })
      })
      .bindPopup(`<strong>Bar : ${bar.nom}</strong><br/>${bar.adresse}`)
      .addTo(markersGroup);
    });

    // Marqueurs des SANISETTES (Bleu)
    data.sanisettes.forEach((sani) => {
      const lat = sani.geo_point_2d.lat;
      const lon = sani.geo_point_2d.lon;
      L.marker([lat, lon], {
        icon: L.divIcon({
          className: "custom-marker",
          html: `<div style="background-color: #2563eb; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 12px;">🚻</div>`,
          iconSize: [24, 24],
        })
      })
      .bindPopup(`<strong>Sanisette : ${sani.route}</strong><br/>${sani.type}`)
      .addTo(markersGroup);
    });

    markersGroup.addTo(mapInstance.current);
    markersLayerRef.current = markersGroup;

  }, [L, data]);

  // Fonction pour centrer la carte sur un lieu spécifique
  const focusOn = (lat: number, lon: number) => {
    if (mapInstance.current) {
      mapInstance.current.setView([lat, lon], 17, { animate: true });
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Remonte à la carte
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white text-pink-600 font-bold animate-pulse">
      Localisation des toilettes toulousaines...
    </div>
  );

  return (
    <div className="p-4 max-w-7xl mx-auto font-sans bg-gray-50/50 min-h-screen">
      {/* HEADER & NAV */}
      <nav className="mb-6 flex justify-between items-center">
        <Link href="/" className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-800 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Retour à l'accueil
        </Link>
        <a href="https://ici-toilettes.fr/toilettes-publiques-toulouse/" target="_blank" rel="noreferrer" className="text-[10px] md:text-xs bg-white px-3 py-1 rounded-full border shadow-sm hover:bg-gray-50 transition-colors">
          Source : ICI Toilettes
        </a>
      </nav>

      <h1 className="text-3xl font-black mb-6 text-slate-900 flex items-center gap-3">
        🚽 Toilettes Publiques <span className="text-pink-600 tracking-tighter">& Partenaires</span>
      </h1>

      {/* CARTE */}
      <div
        ref={mapRef}
        style={{ height: "50vh", width: "100%" }}
        className="mb-8 border-4 border-white rounded-3xl shadow-2xl relative z-0 overflow-hidden"
      />

      {/* LISTES DÉTAILLÉES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        
        {/* COLONNE BARS */}
        <section className="flex flex-col">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xl font-bold flex items-center gap-2 text-pink-700">
              <Beer size={22} /> Réseau Bars ({data?.bars.length})
            </h2>
            <span className="text-[10px] bg-pink-100 text-pink-700 px-2 py-1 rounded-md font-bold uppercase tracking-wider">Gratuit</span>
          </div>
          
          <div className="h-[500px] overflow-y-auto pr-2 custom-scrollbar border border-pink-100 rounded-2xl p-4 bg-white shadow-sm ring-1 ring-pink-50">
            <div className="space-y-3">
              {data?.bars.map((bar, i) => (
                <div 
                  key={i} 
                  onClick={() => focusOn(bar.lat, bar.lon)}
                  className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-pink-300 hover:shadow-md transition-all cursor-pointer group"
                >
                  <h3 className="font-bold text-slate-800 group-hover:text-pink-600 transition-colors">{bar.nom}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={12} /> {bar.adresse}
                  </p>
                  {bar.note && <p className="text-[11px] italic text-pink-500 mt-2 bg-pink-50/50 p-2 rounded-lg border border-pink-100/50">"{bar.note}"</p>}
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-3 text-center font-medium uppercase tracking-widest italic">↕ Faites défiler pour voir la suite</p>
        </section>

        {/* COLONNE SANISETTES */}
        <section className="flex flex-col">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xl font-bold flex items-center gap-2 text-blue-700">
              <Info size={22} /> Sanisettes Publiques ({data?.sanisettes.length})
            </h2>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-bold uppercase tracking-wider">Ville de Toulouse</span>
          </div>

          <div className="h-[500px] overflow-y-auto pr-2 custom-scrollbar border border-blue-100 rounded-2xl p-4 bg-white shadow-sm ring-1 ring-blue-50">
            <div className="space-y-2">
              {data?.sanisettes.map((sani: any, i: number) => (
                <div 
                  key={i} 
                  onClick={() => focusOn(sani.geo_point_2d.lat, sani.geo_point_2d.lon)}
                  className="p-3 bg-gray-50/50 border border-gray-100 rounded-xl text-sm hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer group"
                >
                  <p className="font-bold text-slate-700 group-hover:text-blue-700">{sani.route}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-[10px] bg-white px-2 py-1 rounded border text-gray-400 font-medium">{sani.type}</span>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${sani.pmr.includes("Non") ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-700"}`}>
                      {sani.pmr.includes("Non") ? "PMR ❌" : "PMR ✅"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-3 text-center font-medium uppercase tracking-widest italic">↕ Faites défiler pour voir la suite</p>
        </section>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
