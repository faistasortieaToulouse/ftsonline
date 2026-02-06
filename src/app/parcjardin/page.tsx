'use client';

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ParcJardin {
  id: number;
  name: string;
  adresse: string;
  lat: number;
  lng: number;
  type: string;
  quartier: string | number;
  commune: string;
  territoire: string;
}

const API_BASE = "/api/parcjardin";

export default function ParcJardinPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);

  const [items, setItems] = useState<ParcJardin[]>([]);
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
      item.name.toLowerCase().includes(q) ||
      item.adresse.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q) ||
      item.quartier.toString().toLowerCase().includes(q) ||
      item.commune.toLowerCase().includes(q) ||
      item.territoire.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current!).setView([43.6045, 1.444], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance.current);
        markersGroupRef.current = L.layerGroup().addTo(mapInstance.current);
        setIsMapReady(true);
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

  useEffect(() => {
    if (!isMapReady || !markersGroupRef.current) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      markersGroupRef.current.clearLayers();

      filteredItems.forEach((item, i) => {
        const numero = i + 1;
        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: #15803d; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${numero}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const popupContent = `
          <div style="font-family: sans-serif; font-size: 13px;">
            <strong style="color: #15803d;">${numero}. ${item.name}</strong><br/>
            <b>Type :</b> ${item.type}<br/>
            <b>Adresse :</b> ${item.adresse}
          </div>
        `;

        L.marker([item.lat, item.lng], { icon: customIcon })
          .addTo(markersGroupRef.current)
          .bindPopup(popupContent);
      });
    };

    updateMarkers();
  }, [isMapReady, filteredItems]);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold mb-4">🌿 Espaces verts de Toulouse</h1>
      <p className="mb-4 font-semibold text-sm md:text-base">
        {filteredItems.length} lieux affichés sur {items.length}.
      </p>

      <input
        type="text"
        placeholder="Rechercher un parc ou jardin..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className="w-full mb-4 p-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none shadow-sm transition-all"
      />

      {error && (
        <div className="mb-6 p-4 border border-red-500 bg-red-50 text-red-700 rounded-lg">
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {/* CARTE LEAFLET - Hauteur réduite sur mobile */}
      <div
        ref={mapRef}
        className="mb-8 border rounded-2xl bg-gray-100 shadow-inner overflow-hidden h-[40vh] md:h-[60vh]"
        style={{ zIndex: 0 }}
      >
        {!isMapReady && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 animate-pulse">Chargement de la carte…</p>
          </div>
        )}
      </div>

      {/* TABLEAU RESPONSIVE */}
      <div className="overflow-hidden border rounded-2xl shadow-sm bg-white dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4 font-bold text-center w-12">#</th>
                <th className="p-4 font-bold">Nom / Adresse</th>
                <th className="p-4 font-bold hidden sm:table-cell">Type</th>
                <th className="p-4 font-bold hidden md:table-cell">Quartier</th>
                <th className="p-4 font-bold hidden lg:table-cell">Commune</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.map((item, i) => (
                <tr key={`${item.id}-${i}`} className="hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-colors">
                  <td className="p-4 text-center font-bold text-slate-400">{i + 1}</td>
                  <td className="p-4">
                    <div className="font-bold text-green-800 dark:text-green-400">{item.name}</div>
                    {/* Adresse affichée sous le nom sur MOBILE seulement */}
                    <div className="text-[11px] text-slate-500 md:text-sm md:text-slate-600 block">
                      {item.adresse}
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell text-slate-600 dark:text-slate-300">{item.type}</td>
                  <td className="p-4 hidden md:table-cell text-slate-500 italic">{item.quartier}</td>
                  <td className="p-4 hidden lg:table-cell text-slate-500">{item.commune}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredItems.length === 0 && !loading && (
        <p className="text-center py-10 text-gray-400 italic">Aucun résultat trouvé.</p>
      )}
    </div>
  );
}