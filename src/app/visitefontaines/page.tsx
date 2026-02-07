'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface Establishment {
  id: number;
  name: string;
  address: string;
  description: string;
  details: string;
  latitude?: number;   // facultatif pour éviter les erreurs
  longitude?: number;  // facultatif pour éviter les erreurs
}

const TOULOUSE_CENTER: [number, number] = [43.6047, 1.4442];

export default function VisiteFontainesPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [L, setL] = useState<any>(null);
  const [openDetailsId, setOpenDetailsId] = useState<number | null>(null);

  const toggleDetails = (id: number) => {
    setOpenDetailsId(prev => (prev === id ? null : id));
  };

  /* =======================
     1. FETCH API
  ======================= */
  useEffect(() => {
    fetch("/api/visitefontaines")
      .then(res => res.json())
      .then(data => {
        setEstablishments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur API:", err);
        setLoading(false);
      });
  }, []);

  /* =======================
     2. INITIALISATION CARTE
  ======================= */
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || loading) return;

    const initMap = async () => {
      const LeafletModule = await import("leaflet");
      const Leaflet = LeafletModule.default || LeafletModule;
      setL(Leaflet);

      if (mapInstance.current) return;

      mapInstance.current = Leaflet.map(mapRef.current).setView(TOULOUSE_CENTER, 13);

      Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
      }).addTo(mapInstance.current);

      markersLayerRef.current = Leaflet.layerGroup().addTo(mapInstance.current);

      setTimeout(() => mapInstance.current?.invalidateSize(), 500);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [loading]);

  /* =======================
     3. MARQUEURS NUMÉROTÉS
  ======================= */
  useEffect(() => {
    if (!L || !mapInstance.current || !markersLayerRef.current || establishments.length === 0) return;

    markersLayerRef.current.clearLayers();

    establishments.forEach((est, index) => {
      const fontaineNumber = index + 1;

      // Vérification des coordonnées
      if (est.latitude == null || est.longitude == null) return;

      const customIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            background-color: #FF6600;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 2px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 900;
            font-size: 14px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          ">
            ${fontaineNumber}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([est.latitude, est.longitude], { icon: customIcon })
        .addTo(markersLayerRef.current)
        .bindPopup(`<b>Fontaine n°${fontaineNumber}</b><br>${est.name}`);

      marker.on("click", () => {
        toggleDetails(est.id);
        mapInstance.current.setView([est.latitude!, est.longitude!], 15, { animate: true });
      });
    });
  }, [L, establishments]);

  /* =======================
     4. RENDER
  ======================= */
  return (
    <div className="p-4 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <nav className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-800 font-bold hover:text-blue-900 transition-all"
        >
          <ArrowLeft size={20} /> Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-10 text-center">
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
          ⛲ Parcours des Fontaines
        </h1>
        <p className="text-slate-500 font-bold mt-2 uppercase text-xs tracking-widest">
          Toulouse • {establishments.length} lieux
        </p>
      </header>

      {/* CARTE */}
      <div
        ref={mapRef}
        className="mb-12 h-[500px] border-4 border-white shadow-xl rounded-[2.5rem] bg-slate-200 relative z-0 overflow-hidden"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full"></span>
          </div>
        )}
      </div>

      {/* LISTE */}
      <h2 className="text-2xl font-black mb-8 text-slate-800 flex items-center gap-3">
        <span className="h-1 w-12 bg-orange-500 rounded-full"></span>
        LISTE DES LIEUX
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {establishments.map((est, index) => {
          const fontaineNumber = index + 1;
          const isOpen = openDetailsId === est.id;

          return (
            <div
              key={est.id}
              id={`fontaine-item-${est.id}`}
              onClick={() => toggleDetails(est.id)}
              className={`p-6 rounded-3xl border-2 cursor-pointer flex gap-6 items-start transition-all ${
                isOpen
                  ? "border-orange-500 bg-orange-50 shadow-lg"
                  : "border-white bg-white shadow-sm hover:border-orange-100"
              }`}
            >
              {/* NUMÉRO */}
              <div className="flex-shrink-0">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl ${
                    isOpen ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {fontaineNumber}
                </div>
              </div>

              {/* CONTENU */}
              <div className="flex-1">
                <h3 className={`font-black uppercase text-base mb-1 ${isOpen ? 'text-orange-700' : 'text-slate-800'}`}>
                  {est.name}
                </h3>
                <p className="text-[11px] text-slate-400 mb-3 font-bold uppercase tracking-wider">
                  📍 {est.address}
                </p>
                <p className={`text-sm leading-relaxed ${isOpen ? 'text-slate-700' : 'text-slate-600 line-clamp-2 italic'}`}>
                  {est.description}
                </p>

                {isOpen && (
                  <div className="mt-6 pt-6 border-t border-orange-200">
                    <div className="text-sm text-slate-700 leading-relaxed bg-white/60 p-4 rounded-xl border border-orange-100">
                      {est.details}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
