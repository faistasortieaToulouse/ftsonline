'use client';

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

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
  const [markersCount, setMarkersCount] = useState(0);
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
    if (typeof window === "undefined" || !mapRef.current || filteredItems.length === 0) return;

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
          html: `<div style="background-color: #2563eb; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${count}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const popupContent = `
          <div style="font-family: Arial; font-size: 14px;">
            <strong style="color: #2563eb;">${count}. ${item.name}</strong><br/>
            <small>${item.adresse}</small>
          </div>
        `;

        L.marker([item.lat, item.lng], { icon: customIcon })
          .addTo(markersGroupRef.current)
          .bindPopup(popupContent);
      });

      setMarkersCount(filteredItems.length);
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
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-slate-800">🏟️ Équipements sportifs de Toulouse</h1>

      <p className="mb-4 font-semibold text-slate-600 text-sm md:text-base">
        {markersCount} lieux affichés sur {filteredItems.length} résultats.
      </p>

      <input
        type="text"
        placeholder="Rechercher un gymnase, stade, piscine..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className="w-full mb-6 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
      />
      
      {/* --- ETAT DE CHARGEMENT --- */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 bg-blue-50/50 rounded-2xl border-2 border-dashed border-blue-100">
          <Loader2 className="animate-spin h-12 w-12 text-blue-700 mb-4" />
          <p className="text-blue-700 font-bold text-xl italic animate-pulse">
            🚀 En cours de chargement...
          </p>
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 border border-red-500 bg-red-50 text-red-700 rounded-lg text-sm">
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {/* ZONE CARTE - Responsive Height */}
      <div
        className="mb-8 border rounded-2xl bg-gray-100 shadow-inner relative overflow-hidden h-[40vh] md:h-[60vh]"
        style={{ zIndex: 0 }}
      >
        <div ref={mapRef} className="h-full w-full" />
        {(!isMapReady || loading) && (
          <div className="absolute inset-0 bg-slate-50/80 flex items-center justify-center z-10">
            <p className="animate-pulse text-blue-600 font-medium">Chargement des données sportives…</p>
          </div>
        )}
      </div>

      {/* TABLEAU RESPONSIVE */}
      <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-bold text-slate-500 w-12 text-center">#</th>
                <th className="p-4 font-bold text-slate-700">Nom / Adresse</th>
                <th className="p-4 font-bold text-slate-700 hidden sm:table-cell">Installation</th>
                <th className="p-4 font-bold text-slate-700 hidden md:table-cell text-center">Famille</th>
                <th className="p-4 font-bold text-slate-700 hidden lg:table-cell">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item, i) => (
                <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="p-4 text-center font-bold text-slate-400">{i + 1}</td>
                  <td className="p-4">
                    <div className="font-bold text-blue-900">{item.name}</div>
                    {/* Adresse visible sur mobile sous le nom */}
                    <div className="text-[11px] text-slate-500 md:text-sm block">
                      {item.adresse}
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell text-slate-600">{item.installation}</td>
                  <td className="p-4 hidden md:table-cell text-center">
                    <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold uppercase text-slate-500">
                      {item.famille}
                    </span>
                  </td>
                  <td className="p-4 hidden lg:table-cell text-slate-500">{item.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredItems.length === 0 && !loading && (
        <p className="text-center py-10 text-slate-400 italic">Aucun équipement trouvé pour cette recherche.</p>
      )}
    </div>
  );
}
