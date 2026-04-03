"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface ToulousePlace {
  num: string;
  voie: string;
  adresse: string;
  bâtiment: string;
  quartier: string;
  ["équivalent à Paris"]?: string;
  ressemble?: string;
  localisation?: string;
  lat?: number;
  lng?: number;
}

const TOULOUSE_CENTER: [number, number] = [43.6045, 1.444];

export default function VisiteToulousePage() {
  // ----------------------------------------------------
  // 1. ÉTATS ET RÉFÉRENCES
  // ----------------------------------------------------
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [places, setPlaces] = useState<ToulousePlace[]>([]);
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
    fetch("/api/visitetoulouse")
      .then(async (res) => {
        const raw = await res.text();
        try {
          return JSON.parse(raw);
        } catch (e) {
          console.error("Erreur parsing JSON:", raw);
          return [];
        }
      })
      .then((data: ToulousePlace[]) => {
        setPlaces(data);
        setLoading(false);
      })
      .catch(console.error);
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

  // ----------------------------------------------------
  // 4. MARQUEURS
  // ----------------------------------------------------
  useEffect(() => {
    if (!L || !mapInstance.current || places.length === 0) return;

    places.forEach((place, i) => {
      if (place.lat === undefined || place.lng === undefined) return;

      const id = i + 1;
      const customIcon = L.divIcon({
        className: "custom-marker-toulouse",
        html: `
          <div style="
            background-color: #2563eb;
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

      const marker = L.marker([place.lat, place.lng], { icon: customIcon })
        .addTo(mapInstance.current!)
        .bindPopup(`
          <div style="text-align: center; font-family: sans-serif; min-width: 140px;">
            <strong style="color: #1e40af; font-size: 13px;">${id}. ${place.bâtiment}</strong><br/>
            <p style="font-size: 10px; margin: 4px 0; color: #64748b;">${place.quartier}</p>
            <a href="#place-item-${id}" style="display: inline-block; background-color: #2563eb; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 10px; font-weight: bold; margin-top: 4px;">Voir détails ↓</a>
          </div>
        `);

      marker.on("click", () => {
        toggleDetails(id);
        mapInstance.current.setView([place.lat, place.lng], 16, { animate: true });
      });
    });
  }, [L, places]);

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
        <h1 className="text-3xl font-black mb-2 text-slate-900 tracking-tight">
          🗺️ Toulouse : Analogies Parisiennes
        </h1>
        <p className="text-slate-500 font-medium">Parcours comparatif entre la Ville Rose et la Capitale — ({places.length} Lieux)</p>
      </header>

      {/* Conteneur Carte */}
      <div
        ref={mapRef}
        className="mb-10 h-[60vh] border-4 border-white rounded-[2.5rem] bg-slate-200 relative z-0 overflow-hidden shadow-2xl"
      >
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/60 backdrop-blur-sm">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-blue-600 font-bold text-xs uppercase tracking-widest">Génération du parcours...</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-black mb-6 text-slate-800 flex items-center gap-3">
        <span className="h-1.5 w-12 bg-blue-600 rounded-full"></span>
        EXPLORATION DES LIEUX
      </h2>

      {/* Liste en Grille / Accordéon */}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {places.map((place, i) => {
          const id = i + 1;
          const isDetailsOpen = openDetailsId === id;

          return (
            <li
              key={i}
              id={`place-item-${id}`}
              className={`p-6 border-2 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col scroll-mt-24 ${
                isDetailsOpen
                  ? "bg-white border-blue-400 shadow-xl scale-[1.01]"
                  : "bg-white border-white shadow-sm hover:border-blue-100 hover:shadow-md"
              }`}
              onClick={() => toggleDetails(id)}
            >
              <div className="flex justify-between items-start mb-2">
                <p className="text-lg font-bold text-slate-900 leading-tight flex-grow pr-4">
                  <span className={`mr-2 transition-colors ${isDetailsOpen ? 'text-blue-600' : 'text-slate-300'}`}>{id}.</span> 
                  {place.bâtiment}
                </p>
                <span
                  className={`text-slate-400 font-bold transition-transform duration-300 ${
                    isDetailsOpen ? "rotate-180 text-blue-600" : "rotate-0"
                  }`}
                >
                  ▼
                </span>
              </div>

              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-4">
                📍 {place.num} {place.voie} {place.adresse} • {place.quartier}
              </p>

              {isDetailsOpen && (
                <div className="mt-2 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {place["équivalent à Paris"] && (
                      <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                        <span className="font-black text-blue-400 uppercase text-[9px] block mb-1">Équivalent à Paris</span>
                        <p className="text-sm font-bold text-blue-900">{place["équivalent à Paris"]}</p>
                      </div>
                    )}
                    
                    {place.ressemble && (
                      <div className="bg-slate-50 p-3 rounded-xl">
                        <span className="font-black text-slate-400 uppercase text-[9px] block mb-1">Architecture / Style</span>
                        <p className="text-sm font-medium text-slate-700">{place.ressemble}</p>
                      </div>
                    )}

                    {place.localisation && (
                      <div className="bg-slate-50 p-3 rounded-xl">
                        <span className="font-black text-slate-400 uppercase text-[9px] block mb-1">Note de localisation</span>
                        <p className="text-sm text-slate-600 italic leading-relaxed">{place.localisation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <footer className="mt-20 py-10 border-t border-slate-200 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em]">
            Toulouse, architecture méridionale, puis copie de celle de Paris • Étude Comparative • 2026
        </p>
      </footer>
    </div>
  );
}
