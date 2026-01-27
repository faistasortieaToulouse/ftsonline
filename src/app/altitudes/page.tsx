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

  // 1. Charger les données et les trier immédiatement par altitude (Décroissant)
  useEffect(() => {
    fetch("/api/altitudes")
      .then((res) => res.json())
      .then((data) => {
        const sortedData = [...data].sort((a, b) => b.altitude - a.altitude);
        setPoints(sortedData);
      })
      .catch((err) => console.error("Erreur API:", err));
  }, []);

  // 2. Initialisation de la carte
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const Leaflet = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      setL(Leaflet);

      if (mapInstance.current) return;

      mapInstance.current = Leaflet.map(mapRef.current).setView([43.6045, 1.4442], 12);

      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);

      markersLayerRef.current = Leaflet.layerGroup().addTo(mapInstance.current);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 3. Mise à jour des marqueurs avec Numérotation
  useEffect(() => {
    if (!L || !markersLayerRef.current || points.length === 0) return;

    markersLayerRef.current.clearLayers();

    points.forEach((point, index) => {
      const numero = index + 1;

      // Création d'un marqueur circulaire avec le numéro
      const customIcon = L.divIcon({
        className: "custom-div-icon",
        html: `
          <div style="
            background-color: #059669; 
            color: white; 
            width: 24px; 
            height: 24px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-weight: bold; 
            font-size: 12px; 
            border: 2px solid white; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">
            ${numero}
          </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
      });

      const marker = L.marker([point.lat, point.lng], { icon: customIcon });
      
      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 150px;">
          <div style="font-size: 10px; color: #059669; font-weight: bold; text-transform: uppercase;">Point n°${numero}</div>
          <strong style="font-size: 14px; display: block; margin-bottom: 2px;">${point.nom}</strong>
          <div style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-weight: bold; color: #334155; margin: 5px 0;">
            Altitude : ${point.altitude}m
          </div>
          <p style="font-size: 11px; color: #64748b; line-height: 1.4; margin: 0;">${point.description}</p>
        </div>
      `);

      marker.addTo(markersLayerRef.current);
    });
  }, [L, points]);

  const focusOnPoint = (point: AltitudePoint) => {
    if (mapInstance.current) {
      mapInstance.current.flyTo([point.lat, point.lng], 15);
    }
  };

  return (
    <div className="flex flex-col h-screen p-4 gap-4 bg-slate-50 text-slate-900">
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
          <h1 className="text-xl font-bold text-slate-800">Topographie de Toulouse</h1>
          <p className="text-xs text-slate-500">Classement des points hauts par quartier</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden">
        {/* TABLEAU NUMÉROTÉ */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="p-4 border-b text-[10px] text-slate-400 uppercase font-bold w-12 text-center">N°</th>
                <th className="p-4 border-b text-[10px] text-slate-400 uppercase font-bold">Quartier</th>
                <th className="p-4 border-b text-[10px] text-slate-400 uppercase font-bold text-right">Altitude</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {points.map((point, index) => (
                <tr
                  key={point.id}
                  onClick={() => focusOnPoint(point)}
                  className="hover:bg-emerald-50 cursor-pointer transition-colors group"
                >
                  <td className="p-4 text-center">
                    <span className="text-xs font-bold text-slate-400 group-hover:text-emerald-600">
                      {index + 1}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-700 group-hover:text-emerald-800 transition-colors">
                      {point.nom}
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{point.description}</div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="inline-block px-2 py-1 rounded bg-slate-100 text-slate-600 font-mono text-xs font-bold group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      {point.altitude}m
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CARTE */}
        <div className="lg:col-span-8 bg-white rounded-xl overflow-hidden shadow-sm border relative z-0">
          <div ref={mapRef} className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}
