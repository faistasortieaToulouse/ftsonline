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
  const [lieux, setLieux] = useState<Lieu[]>([]);
  const [loading, setLoading] = useState(true);
  const [L, setL] = useState<any>(null);
  const [openDetailsId, setOpenDetailsId] = useState<number | null>(null);

  const toggleDetails = (id: number) => {
    setOpenDetailsId((prevId) => (prevId === id ? null : id));
    const target = lieux.find(l => l.id === id);
    if (target && mapInstance.current) {
      mapInstance.current.setView([target.lat, target.lng], 17, { animate: true });
    }
  };

  // 1. Fetch Data
  useEffect(() => {
    fetch("/api/visitetoulousetotal")
      .then((res) => res.json())
      .then((data) => {
        setLieux(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // 2. Init Leaflet
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || loading) return;

    const initMap = async () => {
      const Leaflet = (await import("leaflet")).default;
      setL(Leaflet);
      if (mapInstance.current) return;

      mapInstance.current = Leaflet.map(mapRef.current!).setView(TOULOUSE_CENTER, 14);
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

  // 3. Markers
  useEffect(() => {
    if (!L || !mapInstance.current || lieux.length === 0) return;

    lieux.forEach((lieu) => {
      const customIcon = L.divIcon({
        className: "custom-marker",
        html: `<div style="background:#2563eb;width:24px;height:24px;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify:center;color:white;font-weight:bold;font-size:10px;box-shadow:0 2px 4px rgba(0,0,0,0.3);justify-content:center;">${lieu.id}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([lieu.lat, lieu.lng], { icon: customIcon })
        .addTo(mapInstance.current)
        .bindPopup(`<strong>${lieu.name}</strong>`);

      marker.on("click", () => toggleDetails(lieu.id));
    });
  }, [L, lieux]);

  return (
    <div className="p-4 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold transition-all">
          <ArrowLeft size={20} /> Retour
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 uppercase">🗺️ Visite Toulouse Total</h1>
        <p className="text-slate-500 italic">Exploration historique — {lieux.length} sites</p>
      </header>

      <div ref={mapRef} className="mb-10 h-[50vh] border-4 border-white rounded-[2rem] shadow-xl overflow-hidden relative z-0 bg-slate-200">
        {loading && <div className="absolute inset-0 flex items-center justify-center bg-white/50 animate-pulse">Chargement...</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lieux.map((l) => (
          <div 
            key={l.id} 
            onClick={() => toggleDetails(l.id)}
            className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${openDetailsId === l.id ? "bg-white border-blue-500 shadow-lg" : "bg-white border-transparent shadow-sm hover:border-blue-100"}`}
          >
            <h3 className="font-bold text-slate-800 text-lg"><span className="text-blue-500 mr-2">{l.id}.</span>{l.name}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase mt-1 flex items-center gap-1"><MapPin size={12}/> {l.address}</p>
            {openDetailsId === l.id && (
              <p className="mt-3 pt-3 border-t text-sm text-slate-600 italic animate-in fade-in slide-in-from-top-1">{l.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
