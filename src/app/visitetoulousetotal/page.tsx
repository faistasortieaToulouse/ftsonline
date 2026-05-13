"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface Lieu {
  id: number;
  name: string;
  address: string;
  description: string;
  lat: number;
  lng: number;
}

const TOULOUSE_CENTER: [number, number] = [43.6045, 1.444];

export default function VisiteToulouseTotalPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayerRef = useRef<any>(null); // Pour gérer les marqueurs proprement

  const [lieux, setLieux] = useState<Lieu[]>([]);
  const [loading, setLoading] = useState(true);
  const [L, setL] = useState<any>(null);
  const [openDetailsId, setOpenDetailsId] = useState<number | null>(null);

  // 1. Charger les données
  useEffect(() => {
    fetch("/api/visitetoulousetotal")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLieux(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur fetch:", err);
        setLoading(false);
      });
  }, []);

  // 2. Initialiser la carte (une seule fois, au centre de Toulouse par défaut)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const Leaflet = (await import("leaflet")).default;
      setL(Leaflet);

      if (!mapInstance.current) {
        mapInstance.current = Leaflet.map(mapRef.current!).setView(TOULOUSE_CENTER, 13);
        
        Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapInstance.current);

        // Créer un groupe de calques pour les marqueurs
        markersLayerRef.current = Leaflet.layerGroup().addTo(mapInstance.current);
      }
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 3. Ajouter les marqueurs quand les lieux ET Leaflet sont prêts
  useEffect(() => {
    if (!L || !mapInstance.current || !markersLayerRef.current || lieux.length === 0) return;

    // Nettoyer les anciens marqueurs si besoin
    markersLayerRef.current.clearLayers();

    lieux.forEach((lieu) => {
      // Vérification ultra-stricte des coordonnées
      if (lieu.lat === undefined || lieu.lat === null || lieu.lng === undefined || lieu.lng === null) return;

      const customIcon = L.divIcon({
        className: "custom-marker",
        html: `<div style="background:#ef4444;width:24px;height:24px;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:10px;box-shadow:0 2px 4px rgba(0,0,0,0.3);">${lieu.id}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([lieu.lat, lieu.lng], { icon: customIcon })
        .bindPopup(`<strong>${lieu.id}. ${lieu.name}</strong>`);

      marker.on("click", () => {
        setOpenDetailsId(lieu.id);
        mapInstance.current.setView([lieu.lat, lieu.lng], 16, { animate: true });
      });

      markersLayerRef.current.addLayer(marker);
    });

    // Ajuster la vue pour englober tous les marqueurs
    const bounds = L.latLngBounds(lieux.map(l => [l.lat, l.lng]));
    mapInstance.current.fitBounds(bounds, { padding: [50, 50] });

  }, [L, lieux]);

  return (
    <div className="p-4 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">🏛️ Visite Toulouse Total</h1>
        <p className="text-slate-500 font-medium">Exploration du patrimoine ({lieux.length} lieux enregistrés)</p>
      </header>

      <div
        ref={mapRef}
        className="mb-10 h-[50vh] border-4 border-white rounded-[2rem] bg-slate-200 relative z-0 overflow-hidden shadow-xl"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100/50 backdrop-blur-sm z-10">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lieux.map((l) => (
          <div
            key={l.id}
            id={`item-${l.id}`}
            onClick={() => {
              setOpenDetailsId(l.id === openDetailsId ? null : l.id);
              if (mapInstance.current) mapInstance.current.setView([l.lat, l.lng], 17, { animate: true });
            }}
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
              openDetailsId === l.id ? "bg-white border-red-400 shadow-lg scale-[1.01]" : "bg-white border-transparent shadow-sm hover:border-red-100"
            }`}
          >
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-slate-800"><span className="text-red-500 mr-2">{l.id}.</span>{l.name}</h3>
            </div>
            <p className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-1"><MapPin size={12}/> {l.address}</p>
            {openDetailsId === l.id && (
              <div className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-600 italic leading-relaxed animate-in fade-in slide-in-from-top-1">
                {l.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
