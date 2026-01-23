"use client";

import { useEffect, useRef, useState } from "react";
import { Library, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

interface CulturePoint {
  id: number;
  nom: string;
  adresse: string;
  telephone: string;
  gestionnaire: string;
  siteWeb: string;
  lat: number | null;
  lng: number | null;
  quartier: string;
}

export default function EcoleCulturePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null); // Instance Leaflet

  const [points, setPoints] = useState<CulturePoint[]>([]);

  // 1. Fetch des données
  useEffect(() => {
    fetch("/api/ecoleculture")
      .then((res) => res.json())
      .then(setPoints)
      .catch((err) => console.error("Erreur API:", err));
  }, []);

  // 2. Initialisation et mise à jour de la carte Leaflet
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || points.length === 0) return;

      // Import dynamique de Leaflet
      const L = (await import("leaflet")).default;

      // Éviter de réinitialiser si l'instance existe déjà
      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current).setView([43.6045, 1.4442], 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapInstance.current);
      }

      const map = mapInstance.current;

      // Nettoyage des marqueurs existants avant d'en ajouter de nouveaux
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) map.removeLayer(layer);
      });

      // Ajout des marqueurs numérotés
      points.forEach((point) => {
        if (point.lat === null || point.lng === null) return;

        const customIcon = L.divIcon({
          className: "custom-marker",
          html: `<div style="background-color: #4f46e5; width: 26px; height: 26px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${point.id}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([point.lat, point.lng], { icon: customIcon }).addTo(map);

        marker.bindPopup(`
          <div style="color:#1e293b;padding:4px;font-family:sans-serif;max-width:200px;">
            <div style="font-size:10px; font-weight:bold; color:#6366f1;">#${point.id} - ${point.quartier}</div>
            <strong style="font-size:14px;color:#1e293b;display:block;margin-bottom:4px;">${point.nom}</strong>
            <div style="color:#64748b; font-size:12px; margin-bottom:4px;">${point.adresse}</div>
            <div style="font-size:12px; font-weight:bold;">Tel: ${point.telephone}</div>
          </div>
        `);
      });
    };

    initMap();

    return () => {
      // Pas de suppression immédiate ici pour éviter les clignotements, 
      // Leaflet gère bien le remplacement via le code ci-dessus.
    };
  }, [points]);

  // Fonction de focus lors du clic sur le tableau
  const focusOnPoint = (point: CulturePoint) => {
    if (!mapInstance.current || point.lat === null || point.lng === null) return;
    mapInstance.current.setView([point.lat, point.lng], 17, { animate: true });
  };

  return (
    <div className="flex flex-col h-screen p-4 gap-4 bg-slate-50">
      
      <nav>
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border">
        <div className="bg-indigo-600 p-2 rounded-lg text-white">
          <Library size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 leading-none">Toulouse Culture</h1>
          <p className="text-xs text-slate-500 mt-1">Écoles et lieux d'enseignement</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden">
        {/* LISTE TRIÉE */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="p-4 border-b text-[10px] text-slate-400 uppercase font-black w-16 text-center">N°</th>
                <th className="p-4 border-b text-[10px] text-slate-400 uppercase font-black">Établissement / Quartier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {points.map((point) => (
                <tr
                  key={point.id}
                  onClick={() => focusOnPoint(point)}
                  className="hover:bg-indigo-50/50 cursor-pointer transition-colors group"
                >
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors border border-slate-200">
                      {point.id}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-800 text-sm">{point.nom}</div>
                    <div className="flex items-center gap-1 text-[11px] text-indigo-500 font-medium mt-0.5">
                      <MapPin size={10} /> {point.quartier}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CARTE LEAFLET */}
        <div className="lg:col-span-8 bg-white rounded-xl overflow-hidden shadow-sm border relative">
          <div ref={mapRef} className="h-full w-full z-0" />
        </div>
      </div>
    </div>
  );
}
