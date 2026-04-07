'use client';

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Navigation, Info, Search } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface Voie {
  id: number;
  libelle: string;
  libelle_occitan?: string | null;
  quartier: string;
  territoire: string;
  complement?: string | null;
  wikipedia?: string | null;
  sti: number;
  lat?: number;
  lng?: number;
}

const TOULOUSE_CENTER: [number, number] = [43.6045, 1.444];

export default function NomenclatureVoiesPage() {
  // ----------------------------------------------------
  // 1. ÉTATS ET RÉFÉRENCES
  // ----------------------------------------------------
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [voies, setVoies] = useState<Voie[]>([]);
  const [loading, setLoading] = useState(true);
  const [L, setL] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [openDetailsId, setOpenDetailsId] = useState<number | null>(null);

  const toggleDetails = (id: number) => {
    setOpenDetailsId((prevId) => (prevId === id ? null : id));
  };

  // ----------------------------------------------------
  // 2. RÉCUPÉRATION DES DONNÉES
  // ----------------------------------------------------
  useEffect(() => {
    fetch("/api/voiesmap")
      .then((res) => res.json())
      .then((data: Voie[]) => {
        setVoies(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
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

      mapInstance.current = Leaflet.map(mapRef.current!).setView(TOULOUSE_CENTER, 13);

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
  // 4. FILTRAGE ET MARQUEURS
  // ----------------------------------------------------
  const filteredVoies = useMemo(() =>
    voies.filter(v =>
      v.libelle.toLowerCase().includes(search.toLowerCase()) ||
      v.quartier.toLowerCase().includes(search.toLowerCase())
    ), [search, voies]
  );

  useEffect(() => {
    if (!L || !mapInstance.current) return;

    // Nettoyer les marqueurs existants pour éviter les doublons lors de la recherche
    mapInstance.current.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        mapInstance.current.removeLayer(layer);
      }
    });

    filteredVoies.forEach((v, i) => {
      if (v.lat === undefined || v.lng === undefined) return;

      const displayId = i + 1;
      const customIcon = L.divIcon({
        className: "custom-marker-toulouse",
        html: `
          <div style="
            background-color: #7c3aed;
            width: 28px; height: 28px;
            border-radius: 50%;
            border: 2px solid white;
            display: flex; align-items: center; justify-content: center;
            color: white; font-weight: bold; font-size: 11px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ">
            ${displayId}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([v.lat, v.lng], { icon: customIcon })
        .addTo(mapInstance.current!)
        .bindPopup(`
          <div style="text-align: center; font-family: sans-serif; min-width: 140px;">
            <strong style="color: #7c3aed; font-size: 13px;">${displayId}. ${v.libelle}</strong><br/>
            <a href="#voie-item-${v.id}" style="display: inline-block; background-color: #7c3aed; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 10px; font-weight: bold; margin-top: 6px;">Voir détails ↓</a>
          </div>
        `);

      marker.on("click", () => {
        toggleDetails(v.id);
        mapInstance.current.setView([v.lat, v.lng], 16, { animate: true });
      });
    });
  }, [L, filteredVoies]);

  // ----------------------------------------------------
  // 5. RENDU
  // ----------------------------------------------------
  return (
    <div className="p-4 max-w-7xl mx-auto bg-slate-50 min-h-screen font-sans">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-purple-700 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-black mb-2 text-slate-900 tracking-tight uppercase italic">
          🛣️ Nomenclature des Voies
        </h1>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-slate-500 font-medium italic">Exploration des rues et de l'histoire de Toulouse — ({filteredVoies.length} Voies)</p>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Rechercher une rue..."
              className="pl-10 pr-4 py-2 border-2 border-white shadow-sm rounded-xl focus:ring-2 focus:ring-purple-400 outline-none w-full md:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Conteneur de la Carte */}
      <div
        ref={mapRef}
        className="mb-10 h-[50vh] border-4 border-white rounded-[2.5rem] bg-slate-200 relative z-0 overflow-hidden shadow-2xl"
      >
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/60 backdrop-blur-sm">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-purple-600 font-bold text-xs uppercase tracking-widest">Chargement de la carte...</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-black mb-6 text-slate-800 flex items-center gap-3">
        <Navigation className="text-purple-600" size={24} />
        INDEX DES VOIES
      </h2>

      {/* Liste des voies avec Accordéon */}
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVoies.map((v, i) => {
          const displayId = i + 1;
          const isDetailsOpen = openDetailsId === v.id;

          return (
            <li
              key={v.id}
              id={`voie-item-${v.id}`}
              className={`p-6 border-2 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col scroll-mt-24 ${
                isDetailsOpen
                  ? "bg-white border-purple-400 shadow-xl scale-[1.01]"
                  : "bg-white border-white shadow-sm hover:border-purple-100 hover:shadow-md"
              }`}
              onClick={() => toggleDetails(v.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <p className="text-lg font-bold text-slate-900 leading-tight pr-4">
                  <span className={`mr-2 transition-colors ${isDetailsOpen ? 'text-purple-500' : 'text-slate-300'}`}>{displayId}.</span> 
                  {v.libelle}
                </p>
                <span className={`text-slate-400 font-bold transition-transform duration-300 ${isDetailsOpen ? "rotate-180 text-purple-500" : "rotate-0"}`}>
                  ▼
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase">
                  {v.quartier}
                </span>
                <span className="text-[10px] font-mono text-slate-400">STI: {v.sti}</span>
              </div>

              {isDetailsOpen && (
                <div className="mt-2 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black text-purple-700 uppercase mb-1">Secteur / Territoire :</p>
                      <p className="text-sm text-slate-700 font-medium">{v.territoire}</p>
                    </div>
                    
                    {(v.complement || v.wikipedia) && (
                      <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-50 text-sm text-slate-700 leading-relaxed italic">
                        <span className="font-black text-purple-800 uppercase text-[10px] not-italic block mb-1">Information historique :</span>
                        {v.complement || v.wikipedia}
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
            Base de données Urbaine • Toulouse • 2026
        </p>
      </footer>

      <style jsx global>{`
        .custom-marker-toulouse { background: none !important; border: none !important; }
        .leaflet-popup-content-wrapper { border-radius: 12px; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
