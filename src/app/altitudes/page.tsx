"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Mountain, ArrowLeft } from "lucide-react";

interface AltitudePoint {
  id: number;
  nom: string;
  altitude: number;
  description: string;
  lat: number;
  lng: number;
}

export default function AltitudesPage() {
  const [points, setPoints] = useState<AltitudePoint[]>([]);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [L, setL] = useState<any>(null);

  // 1. Charger les données API
  useEffect(() => {
    fetch("/api/altitudes")
      .then((res) => res.json())
      .then(setPoints)
      .catch((err) => console.error("Erreur API:", err));
  }, []);

  // 2. Initialisation de la carte (une seule fois)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const Leaflet = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      setL(Leaflet);

      if (mapInstance.current) return; // Sécurité anti-double-initialisation

      // Création de l'instance
      mapInstance.current = Leaflet.map(mapRef.current).setView([43.6045, 1.4442], 12);

      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);

      // Création d'un calque pour les marqueurs afin de pouvoir les vider/remplir facilement
      markersLayerRef.current = Leaflet.layerGroup().addTo(mapInstance.current);
    };

    initMap();

    // NETTOYAGE CRUCIAL : Détruit la carte quand on quitte la page
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 3. Mise à jour des marqueurs quand les points ou Leaflet sont chargés
  useEffect(() => {
    if (!L || !markersLayerRef.current || points.length === 0) return;

    // Vider les anciens marqueurs s'ils existent
    markersLayerRef.current.clearLayers();

    points.forEach((point) => {
      const customIcon = L.divIcon({
        className: "custom-div-icon",
        html: `<div style="background-color:#059669; color:white; padding:2px 5px; border-radius:4px; font-weight:bold; font-size:10px; border:1px solid white; white-space:nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${point.altitude}m</div>`,
        iconSize: [30, 20],
        iconAnchor: [15, 10]
      });

      const marker = L.marker([point.lat, point.lng], { icon: customIcon });
      marker.bindPopup(`
        <div style="font-family: sans-serif;">
          <strong style="font-size:14px;">${point.nom}</strong><br/>
          <span style="color:#059669; font-weight:bold;">Altitude : ${point.altitude}m</span>
          <p style="font-size:11px; color:#666; margin-top:4px;">${point.description}</p>
        </div>
      `);
      marker.addTo(markersLayerRef.current);
    });
  }, [L, points]);

  // Fonction pour centrer la carte sur un point
  const focusOnPoint = (point: AltitudePoint) => {
    if (mapInstance.current) {
      mapInstance.current.flyTo([point.lat, point.lng], 15);
    }
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
        <div className="bg-emerald-600 p-2 rounded-lg text-white">
          <Mountain size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Altitudes de Toulouse</h1>
          <p className="text-xs text-slate-500">Relief et topographie par quartier (Pure Leaflet)</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden">
        {/* TABLEAU */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border overflow-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="p-4 border-b text-xs text-slate-400 uppercase font-bold">Quartier</th>
                <th className="p-4 border-b text-xs text-slate-400 uppercase font-bold text-right">Alt.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...points].sort((a, b) => b.altitude - a.altitude).map((point) => (
                <tr
                  key={point.id}
                  onClick={() => focusOnPoint(point)}
                  className="hover:bg-emerald-50 cursor-pointer transition-colors group"
                >
                  <td className="p-4">
                    <div className="font-semibold text-slate-700">{point.nom}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">{point.description}</div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 font-mono font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      {point.altitude}m
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CARTE (Utilisation d'une simple DIV avec ref) */}
        <div className="lg:col-span-8 bg-white rounded-xl overflow-hidden shadow-sm border relative z-0">
          <div ref={mapRef} className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}