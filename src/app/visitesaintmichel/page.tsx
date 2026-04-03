"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface Establishment {
  name: string;
  address: string;
  lat?: number;
  lng?: number;
}

const ST_MICHEL_CENTER: [number, number] = [43.5925, 1.444];

export default function VisiteSaintMichelPage() {
  // ----------------------------------------------------
  // 1. ÉTATS ET RÉFÉRENCES
  // ----------------------------------------------------
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [L, setL] = useState<any>(null);
  const [openDetailsId, setOpenDetailsId] = useState<number | null>(null);

  const toggleDetails = (id: number) => {
    setOpenDetailsId((prevId) => (prevId === id ? null : id));
  };

  // ----------------------------------------------------
  // 2. RÉCUPÉRATION DES DONNÉES
  // ----------------------------------------------------
  useEffect(() => {
    fetch("/api/visitesaintmichel")
      .then((res) => res.json())
      .then((data: Establishment[]) => {
        setEstablishments(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur API:", err);
        setLoading(false);
      });
  }, []);

  // ----------------------------------------------------
  // 3. INITIALISATION LEAFLET
  // ----------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || loading) return;

    const initMap = async () => {
      const Leaflet = (await import("leaflet")).default;
      setL(Leaflet);

      if (mapInstance.current) return;

      mapInstance.current = Leaflet.map(mapRef.current!).setView(ST_MICHEL_CENTER, 15);

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

  // ----------------------------------------------------
  // 4. MARQUEURS
  // ----------------------------------------------------
  useEffect(() => {
    if (!L || !mapInstance.current || establishments.length === 0) return;

    establishments.forEach((est, i) => {
      if (est.lat === undefined || est.lng === undefined) return;

      const id = i + 1;
      const customIcon = L.divIcon({
        className: "custom-marker-stmichel",
        html: `
          <div style="
            background-color: #ef4444;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 2px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 11px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ">
            ${id}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([est.lat, est.lng], { icon: customIcon })
        .addTo(mapInstance.current!)
        .bindPopup(`
          <div style="text-align: center; font-family: sans-serif; min-width: 140px;">
            <strong style="color: #b91c1c; font-size: 13px;">${id}. ${est.name}</strong><br/>
            <a href="#est-item-${id}" style="display: inline-block; background-color: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 10px; font-weight: bold; margin-top: 6px;">Détails ↓</a>
          </div>
        `);

      marker.on("click", () => {
        toggleDetails(id);
        mapInstance.current.setView([est.lat, est.lng], 17, { animate: true });
      });
    });
  }, [L, establishments]);

  // ----------------------------------------------------
  // 5. RENDU
  // ----------------------------------------------------
  return (
    <div className="p-4 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <nav className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold transition-all group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-black mb-2 text-slate-900 tracking-tight leading-tight uppercase">
          🏛️ Quartier Saint-Michel
        </h1>
        <p className="text-slate-500 font-medium italic">Parcours historique et mémoriel — ({establishments.length} Lieux)</p>
      </header>

      {/* Conteneur Carte */}
      <div
        ref={mapRef}
        className="mb-10 h-[60vh] border-4 border-white rounded-[2.5rem] bg-slate-200 relative z-0 overflow-hidden shadow-2xl"
      >
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/60 backdrop-blur-sm">
            <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-red-600 font-black text-xs uppercase tracking-widest">Exploration de Saint-Michel...</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-black mb-6 text-slate-800 flex items-center gap-3">
        <span className="h-1.5 w-12 bg-red-600 rounded-full"></span>
        POINTS D'INTÉRÊT
      </h2>

      {/* Liste avec Accordéon */}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {establishments.map((est, i) => {
          const id = i + 1;
          const isDetailsOpen = openDetailsId === id;

          return (
            <li
              key={i}
              id={`est-item-${id}`}
              className={`p-6 border-2 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col scroll-mt-24 ${
                isDetailsOpen
                  ? "bg-white border-red-400 shadow-xl scale-[1.01]"
                  : "bg-white border-white shadow-sm hover:border-red-100 hover:shadow-md"
              }`}
              onClick={() => toggleDetails(id)}
            >
              <div className="flex justify-between items-start mb-2">
                <p className="text-lg font-bold text-slate-900 leading-tight flex-grow pr-4">
                  <span className={`mr-2 transition-colors ${isDetailsOpen ? 'text-red-500' : 'text-slate-300'}`}>{id}.</span> 
                  {est.name}
                </p>
                <span
                  className={`text-slate-400 font-bold transition-transform duration-300 ${
                    isDetailsOpen ? "rotate-180 text-red-500" : "rotate-0"
                  }`}
                >
                  ▼
                </span>
              </div>
              
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                📍 {est.address}
              </p>

              {isDetailsOpen && (
                <div className="mt-2 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="p-4 bg-red-50/50 rounded-2xl border border-red-50 text-sm text-slate-700 leading-relaxed italic">
                    <span className="font-black text-red-800 uppercase text-[10px] not-italic block mb-1">Informations :</span>
                    Ce site constitue un repère historique majeur du quartier Saint-Michel, témoignant du passé judiciaire, militaire ou civil de Toulouse.
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <footer className="mt-20 py-10 border-t border-slate-200 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em]">
            Patrimoine Saint-Michel • Toulouse • 2026
        </p>
      </footer>
    </div>
  );
}
