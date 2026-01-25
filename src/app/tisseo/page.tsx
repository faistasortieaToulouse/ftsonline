"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Bus, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

export default function TisseoPage() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]); // Initialisé comme tableau vide
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  // 1. Chargement des données avec vérification du type
  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/tisseo");
      const data = await res.json();
      
      // Sécurité : on vérifie si data est bien un tableau
      const dataArray = Array.isArray(data) ? data : [];
      setItems(dataArray);
      setFiltered(dataArray);
    } catch (err) {
      console.error("Erreur API:", err);
      setItems([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // 2. Logique de recherche (Indispensable pour que "filtered" reste un tableau)
  useEffect(() => {
    const q = search.toLowerCase();
    const result = items.filter((i: any) => 
      (i.title?.toLowerCase().includes(q)) || 
      (i.description?.toLowerCase().includes(q)) || 
      (i.lines?.toLowerCase().includes(q))
    );
    setFiltered(result);
  }, [search, items]);

  // 3. Carte Leaflet (Méthode OTAN)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current!).setView([43.6045, 1.444], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap'
      }).addTo(mapInstance.current);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="container mx-auto py-10 px-4">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 font-bold uppercase text-sm tracking-tight">
          <ArrowLeft size={18} /> Retour
        </Link>
      </nav>

      <div className="flex items-center gap-3 mb-6 text-slate-900">
        <Bus size={32} />
        <h1 className="text-3xl font-bold tracking-tighter">Info Trafic Tisséo</h1>
      </div>

      <div className="mb-8 border-2 border-slate-200 rounded-2xl overflow-hidden shadow-xl bg-slate-50 relative z-0" style={{ height: "400px" }}>
        <div ref={mapRef} className="h-full w-full" />
      </div>

      <div className="grid gap-4 mb-8">
        <input
          className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all shadow-sm"
          placeholder="Ligne, arrêt, mot-clé..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Button onClick={load} variant="outline" className="w-fit">
          {loading ? <Loader2 className="animate-spin mr-2" /> : "🔄"} Actualiser
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : Array.isArray(filtered) && filtered.length > 0 ? (
          filtered.map((msg: any) => (
            <div key={msg.id} className="p-5 bg-white border-2 border-slate-100 rounded-2xl shadow-sm border-l-8 border-l-orange-500 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <AlertTriangle className="text-orange-500 flex-shrink-0" size={24} />
                <div className="flex-1">
                  <h2 className="font-bold text-lg text-slate-800 mb-1">{msg.title}</h2>
                  {msg.lines && (
                    <div className="flex gap-2 mb-3">
                      {msg.lines.split(',').map((l: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded uppercase">
                          {l.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">{msg.description}</p>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400 border-t pt-3">
                    <span>Source: {msg.source}</span>
                    {msg.url && <a href={msg.url} target="_blank" className="text-blue-600 hover:text-blue-800">Détails →</a>}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-slate-50 rounded-xl border-2 border-dashed">
            <p className="text-slate-500">Aucune perturbation signalée ou trouvée.</p>
          </div>
        )}
      </div>
    </div>
  );
}