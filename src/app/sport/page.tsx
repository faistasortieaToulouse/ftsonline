'use client';

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, Loader2, Search } from "lucide-react";

interface Equipement {
  id: string | number;
  name: string;
  installation: string;
  famille: string;
  type: string;
  adresse: string;
  lat: number;
  lng: number;
}

const API_BASE = "/api/sport";

export default function SportPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);

  const [items, setItems] = useState<Equipement[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  async function fetchItems() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.installation?.toLowerCase().includes(q) ||
      item.famille?.toLowerCase().includes(q) ||
      item.type?.toLowerCase().includes(q) ||
      item.adresse?.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current!).setView([43.6045, 1.444], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance.current);
        markersGroupRef.current = L.layerGroup().addTo(mapInstance.current);
      }

      markersGroupRef.current.clearLayers();

      filteredItems.forEach((item, i) => {
        const count = i + 1;
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: #2563eb; color: white; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">${count}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const popupContent = `
          <div style="font-family: sans-serif; text-align: center; min-width: 150px; padding: 5px;">
            <strong style="color: #1e3a8a; display: block; margin-bottom: 2px;">${count}. ${item.name}</strong>
            <small style="color: #64748b; display: block; margin-bottom: 8px;">${item.adresse}</small>
            <a href="#row-${item.id}" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 4px 10px; border-radius: 5px; text-decoration: none; font-size: 10px; font-weight: bold; text-transform: uppercase;">
               Voir détails ↓
            </a>
          </div>
        `;

        L.marker([item.lat, item.lng], { icon: customIcon })
          .addTo(markersGroupRef.current)
          .bindPopup(popupContent);
      });

      setIsMapReady(true);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [filteredItems]);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-black mb-2 text-slate-900 tracking-tight uppercase">
          🏟️ Sport à Toulouse
        </h1>
        <p className="text-slate-500 font-medium italic">Explorez les {items.length} équipements sportifs de la ville</p>
      </header>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher un gymnase, stade, piscine, tennis..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full p-4 pl-12 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all bg-white"
        />
      </div>
            
      {error && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-700 rounded-2xl text-sm flex items-center gap-3">
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {/* ZONE CARTE */}
      <div className="mb-12 border-4 border-white rounded-[2.5rem] bg-slate-200 shadow-2xl relative overflow-hidden h-[50vh] md:h-[65vh] z-0">
        <div ref={mapRef} className="h-full w-full" />
        {(!isMapReady || loading) && (
          <div className="absolute inset-0 bg-slate-100/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
            <p className="text-blue-600 font-black text-xs uppercase tracking-widest">Localisation des sites...</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-black mb-6 text-slate-800 flex items-center gap-3">
        <span className="h-1.5 w-12 bg-blue-600 rounded-full"></span>
        LISTE DES RÉSULTATS ({filteredItems.length})
      </h2>

      {/* TABLEAU */}
      <div className="overflow-hidden border-none rounded-3xl shadow-xl bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-5 font-black uppercase text-[10px] tracking-widest w-16 text-center">#</th>
                <th className="p-5 font-black uppercase text-[10px] tracking-widest">Nom / Adresse</th>
                <th className="p-5 font-black uppercase text-[10px] tracking-widest hidden sm:table-cell">Installation</th>
                <th className="p-5 font-black uppercase text-[10px] tracking-widest hidden md:table-cell text-center">Famille</th>
                <th className="p-5 font-black uppercase text-[10px] tracking-widest hidden lg:table-cell">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item, i) => (
                <tr 
                  key={item.id} 
                  id={`row-${item.id}`} // ID POUR L'ANCRE
                  className="hover:bg-blue-50/50 transition-colors scroll-mt-24"
                >
                  <td className="p-5 text-center font-black text-slate-300">{i + 1}</td>
                  <td className="p-5">
                    <div className="font-bold text-slate-900 text-base">{item.name}</div>
                    <div className="text-xs text-slate-400 font-medium uppercase mt-1 tracking-tighter">
                      📍 {item.adresse}
                    </div>
                  </td>
                  <td className="p-5 hidden sm:table-cell text-slate-600 font-medium text-sm">
                    {item.installation}
                  </td>
                  <td className="p-5 hidden md:table-cell text-center">
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black uppercase text-slate-500 tracking-tighter">
                      {item.famille}
                    </span>
                  </td>
                  <td className="p-5 hidden lg:table-cell text-slate-500 text-sm italic">
                    {item.type}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredItems.length === 0 && !loading && (
        <div className="text-center py-20 bg-white rounded-3xl mt-6 shadow-inner">
           <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aucun équipement ne correspond à votre recherche.</p>
        </div>
      )}

      <footer className="mt-20 py-10 border-t border-slate-200 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em]">
            Sport Toulouse • 2026 • Ville Rose
        </p>
      </footer>
    </div>
  );
}
