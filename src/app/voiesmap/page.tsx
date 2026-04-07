'use client';

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Navigation, Info } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface Voie {
  id: number;
  libelle: string;
  libelle_occitan?: string | null;
  quartier: string;
  territoire: string;
  complement?: string | null;
  complement_occitan?: string | null;
  sti: number;
  wikipedia?: string | null;
  lat?: number;
  lng?: number;
}

const TOULOUSE_CENTER: [number, number] = [43.6045, 1.444];

export default function VoiesPage() {
  // ----------------------------------------------------
  // 1. ÉTATS ET RÉFÉRENCES
  // ----------------------------------------------------
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [voies, setVoies] = useState<Voie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [L, setL] = useState<any>(null);
  const [openDetailsId, setOpenDetailsId] = useState<number | null>(null);

  // ----------------------------------------------------
  // 2. RÉCUPÉRATION DES DONNÉES
  // ----------------------------------------------------
  useEffect(() => {
    fetch("/api/voiesmap")
      .then((res) => res.json())
      .then((data: Voie[]) => {
        // On s'assure d'avoir des coordonnées (simulées ici si absentes pour l'exemple)
        setVoies(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // ----------------------------------------------------
  // 3. FILTRAGE
  // ----------------------------------------------------
  const filteredVoies = useMemo(() =>
    voies.filter(v =>
      v.libelle.toLowerCase().includes(search.toLowerCase()) ||
      v.quartier.toLowerCase().includes(search.toLowerCase())
    ), [search, voies]
  );

  // ----------------------------------------------------
  // 4. INITIALISATION LEAFLET
  // ----------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || loading) return;

    const initMap = async () => {
      const Leaflet = (await import("leaflet")).default;
      setL(Leaflet);

      if (mapInstance.current) return;

      mapInstance.current = Leaflet.map(mapRef.current!).setView(TOULOUSE_CENTER, 13);

      Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
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
  // 5. MARQUEURS (Mise à jour selon le filtre)
  // ----------------------------------------------------
  useEffect(() => {
    if (!L || !mapInstance.current) return;

    // Nettoyage des anciens marqueurs
    mapInstance.current.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) mapInstance.current.removeLayer(layer);
    });

    filteredVoies.slice(0, 100).forEach((v, i) => { // Limite à 100 pour la performance
      // Note : Si votre API ne renvoie pas lat/lng, Leaflet ne pourra pas placer le point.
      // On suppose ici que lat/lng sont présents ou fournis par votre backend.
      if (!v.lat || !v.lng) return;

      const id = v.id;
      const customIcon = L.divIcon({
        className: "custom-marker-voie",
        html: `
          <div style="
            background-color: #6b21a8;
            width: 24px; height: 24px;
            border-radius: 6px;
            border: 2px solid white;
            display: flex; align-items: center; justify-content: center;
            color: white; font-weight: bold; font-size: 10px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            transform: rotate(45deg);
          ">
            <div style="transform: rotate(-45deg)">${i + 1}</div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker([v.lat, v.lng], { icon: customIcon })
        .addTo(mapInstance.current!)
        .bindPopup(`
          <div style="text-align: center; font-family: sans-serif;">
            <strong style="color: #6b21a8;">${v.libelle}</strong><br/>
            <span style="font-size: 10px; color: #667085;">${v.quartier}</span><br/>
            <a href="#voie-item-${id}" style="display: inline-block; background-color: #6b21a8; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 10px; font-weight: bold; margin-top: 6px;">Voir fiche ↓</a>
          </div>
        `)
        .on("click", () => setOpenDetailsId(id));
    });
  }, [L, filteredVoies]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen font-sans scroll-smooth">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-purple-700 font-bold transition-all group uppercase text-xs tracking-widest">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Retour
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
          Nomenclature des <span className="text-purple-700">Voies</span>
        </h1>
        <p className="text-slate-500 font-medium italic mt-1">Index géographique et historique des rues de Toulouse</p>
      </header>

      {/* RECHERCHE */}
      <div className="relative mb-8 max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher une rue, un quartier..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-xl focus:ring-2 focus:ring-purple-500 text-lg bg-white"
        />
      </div>

      {/* CARTE (Modèle Visite Rue) */}
      <div
        ref={mapRef}
        className="mb-12 h-[55vh] border-4 border-white rounded-[2.5rem] bg-slate-200 relative z-0 overflow-hidden shadow-2xl"
      >
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/60 backdrop-blur-sm">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mb-8">
        <Navigation className="text-purple-700" size={28} />
        <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Index des Voies</h2>
      </div>

      {/* LISTE AVEC ACCORDÉON (Modèle Visite Rue) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVoies.map((v, i) => {
          const isDetailsOpen = openDetailsId === v.id;

          return (
            <div
              key={v.id}
              id={`voie-item-${v.id}`}
              className={`p-6 border-2 rounded-[2rem] transition-all duration-300 cursor-pointer flex flex-col scroll-mt-24 ${
                isDetailsOpen
                  ? "bg-white border-purple-400 shadow-xl scale-[1.02] z-10"
                  : "bg-white border-white shadow-sm hover:border-purple-100 hover:shadow-md"
              }`}
              onClick={() => setOpenDetailsId(isDetailsOpen ? null : v.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  <span className={`mr-2 ${isDetailsOpen ? 'text-purple-600' : 'text-slate-300'}`}>
                    {(i + 1).toString().padStart(2, '0')}.
                  </span>
                  {v.libelle}
                </h3>
                <span className={`text-slate-300 transition-transform ${isDetailsOpen ? "rotate-180 text-purple-500" : ""}`}>▼</span>
              </div>

              {v.libelle_occitan && (
                <p className="text-sm italic text-purple-600 font-medium mb-3">{v.libelle_occitan}</p>
              )}

              <div className="flex flex-wrap gap-2 mt-auto">
                <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest">
                  {v.quartier}
                </span>
              </div>

              {isDetailsOpen && (
                <div className="mt-4 pt-4 border-t border-slate-50 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-4">
                    <div className="text-xs">
                       <p className="text-slate-400 font-bold uppercase tracking-tighter mb-1">Territoire</p>
                       <p className="font-bold text-slate-700">{v.territoire}</p>
                    </div>

                    {(v.complement || v.wikipedia) && (
                      <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                        <div className="flex items-center gap-2 mb-2 text-purple-700">
                          <Info size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Historique</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed italic">
                          {v.complement || v.wikipedia}
                        </p>
                      </div>
                    )}
                    
                    <p className="text-[9px] font-mono text-slate-300">Code STI : {v.sti}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <footer className="mt-20 py-10 text-center border-t border-slate-200">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em]">
          Données Ouvertes • Toulouse Métropole • 2026
        </p>
      </footer>

      <style jsx global>{`
        .custom-marker-voie { background: none !important; border: none !important; }
        .leaflet-popup-content-wrapper { border-radius: 1rem; border: none; shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
      `}</style>
    </div>
  );
}
