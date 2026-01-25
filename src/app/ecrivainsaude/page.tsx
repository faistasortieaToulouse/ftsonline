'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Import direct des données (contenant lat et lng)
import { ecrivainsData } from "@/app/api/ecrivainsaude/route";

export default function EcrivainsAudePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Initialisation de Leaflet (Méthode OTAN)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      
      if (mapInstance.current) return;

      // Création de la carte centrée sur l'Aude
      const map = L.map(mapRef.current).setView([43.15, 2.3], 9);
      mapInstance.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      // 2. Ajout des marqueurs à partir des coordonnées directes
      ecrivainsData.forEach((e, index) => {
        // Vérification si les coordonnées existent
        if (e.lat && e.lng) {
          const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #1d4ed8; width: 26px; height: 26px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px; shadow: 0 2px 4px rgba(0,0,0,0.3);">${index + 1}</div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13]
          });

          L.marker([e.lat, e.lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(`
              <div style="font-family: sans-serif; min-width: 160px;">
                <strong style="color: #1d4ed8; font-size: 14px;">${index + 1}. ${e.nom}</strong><br/>
                <p style="font-size: 12px; margin-top: 5px;">
                  <b>Commune :</b> ${e.commune}<br/>
                  <b>Dates :</b> ${e.dates || "N/A"}<br/>
                  <b>Bio :</b> ${e.description || "Écrivain"}
                </p>
              </div>
            `);
        }
      });

      setIsMapReady(true);
    };

    initMap();

    // Nettoyage pour éviter l'erreur "Map container already initialized"
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="p-4 max-w-7xl mx-auto min-h-screen bg-white">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 font-bold group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-4 text-slate-900">🖋️ Écrivains de l'Aude</h1>
      <p className="text-lg font-medium text-blue-800 mb-6 italic">
        {ecrivainsData.length} écrivains répertoriés sur la carte
      </p>

      {/* Zone de la Carte */}
      <div className="mb-10 border-4 border-slate-100 shadow-xl rounded-2xl overflow-hidden h-[70vh] relative bg-slate-100">
        <div ref={mapRef} className="h-full w-full z-0" />
        {!isMapReady && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50/50">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-6 text-slate-800">Liste complète des écrivains</h2>

      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 border-b font-bold w-12 text-center">#</th>
              <th className="p-4 border-b font-bold">Nom</th>
              <th className="p-4 border-b font-bold">Commune</th>
              <th className="p-4 border-b font-bold">Dates</th>
              <th className="p-4 border-b font-bold">Description</th>
            </tr>
          </thead>
          <tbody>
            {ecrivainsData.map((ev, i) => (
              <tr key={i} className="hover:bg-blue-50/50 transition-colors border-b border-slate-100">
                <td className="p-4 font-bold text-blue-600 text-center">{i + 1}</td>
                <td className="p-4 font-semibold text-slate-900">{ev.nom}</td>
                <td className="p-4 text-slate-600">{ev.commune}</td>
                <td className="p-4 text-slate-500">{ev.dates || "N/A"}</td>
                <td className="p-4 text-slate-700 italic">{ev.description || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}