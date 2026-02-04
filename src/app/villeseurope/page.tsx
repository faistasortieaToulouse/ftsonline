"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, MapPin, Users, Calendar } from "lucide-react";
import "leaflet/dist/leaflet.css";

export default function VillesEuropePage() {
  const [data, setData] = useState<any[]>([]);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    fetch("/api/villeseurope")
      .then((res) => res.json())
      .then((villes) => setData(villes))
      .catch((err) => console.error("Erreur:", err));
  }, []);

  useEffect(() => {
    // Empêcher l'initialisation si Leaflet est déjà chargé ou si les données sont absentes
    if (typeof window === "undefined" || !mapRef.current || mapInstance.current || data.length === 0) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      // Création de la carte
      mapInstance.current = L.map(mapRef.current).setView([48.5, 10], 4);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapInstance.current);

      // Ajout des marqueurs numérotés
      data.forEach((ville) => {
        if (ville.lat && ville.lng) {
          const numberedIcon = L.divIcon({
            className: "custom-number-marker",
            html: `<div class="flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-[10px] font-bold rounded-full border-2 border-white shadow-lg hover:bg-slate-900 transition-colors">${ville.rank}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          L.marker([ville.lat, ville.lng], { icon: numberedIcon })
            .addTo(mapInstance.current)
            .bindPopup(`
              <div style="font-family: sans-serif;">
                <h4 style="margin: 0; font-weight: bold; color: #1e293b;">${ville.city}</h4>
                <p style="margin: 4px 0; font-size: 12px; color: #64748b;">${ville.population} habitants</p>
                <small style="color: #3b82f6;">Rang: #${ville.rank}</small>
              </div>
            `);
        }
      });
    };

    initMap();

    // Nettoyage au démontage
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [data]);

  return (
    <div className="p-6 max-w-6xl mx-auto bg-slate-50 min-h-screen">
      <nav className="mb-8">
        <Link href="/" className="text-blue-600 hover:underline flex items-center gap-2 font-medium">
          <ArrowLeft size={18} /> Retour à l'Accueil
        </Link>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-extrabold mb-4 flex items-center gap-3 text-slate-900">
          <Building2 className="text-blue-600" size={36} /> 
          Démographie des Villes d'Europe
        </h1>
        <p className="text-slate-600 italic">
          Classement interactif des plus grandes métropoles de l'UE.
        </p>
      </div>

      {/* Carte Leaflet */}
      <div className="mb-12 relative z-0">
        <div 
          ref={mapRef} 
          className="h-[500px] w-full rounded-3xl border-4 border-white shadow-xl overflow-hidden" 
        />
      </div>

      {/* Grille des Villes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-700">
        {data.map((ville: any, i: number) => (
          <div 
            key={i}
            className="flex flex-col p-5 border rounded-2xl bg-white shadow-sm hover:border-blue-500 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 bg-slate-900 text-white text-[10px] font-bold rounded-full group-hover:bg-blue-600 transition-colors">
                  {ville.rank}
                </span>
                <h3 className="font-bold text-slate-800 text-lg">{ville.city}</h3>
              </div>
              <MapPin size={16} className="text-blue-500" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                {ville.country}
              </p>
              
              <div className="flex items-center gap-2 text-blue-600 font-bold bg-blue-50 w-fit px-3 py-1 rounded-full text-sm">
                <Users size={14} />
                <span>{ville.population} hab.</span>
              </div>

              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-50 text-[10px] text-slate-400">
                <Calendar size={12} />
                Mise à jour : {ville.date}
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-20 p-8 text-center text-slate-400 text-sm">
        Source : Eurostat & Recensements Nationaux (2023-2025)
      </footer>
    </div>
  );
}
