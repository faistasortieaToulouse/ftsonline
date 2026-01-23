"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mountain, ArrowLeft } from "lucide-react";
// Import dynamique de Leaflet pour éviter les erreurs SSR de Next.js
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Import dynamique de la carte
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const MapController = dynamic(() => Promise.resolve(({ center }: { center: [number, number] }) => {
  const { useMap } = require("react-leaflet");
  const map = useMap();
  useEffect(() => { map.flyTo(center, 15); }, [center, map]);
  return null;
}), { ssr: false });

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
  const [mapCenter, setMapCenter] = useState<[number, number]>([43.6045, 1.4442]);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    // Charger Leaflet côté client pour les icônes
    import("leaflet").then((leaflet) => {
      setL(leaflet);
    });

    fetch("/api/altitudes")
      .then((res) => res.json())
      .then(setPoints)
      .catch((err) => console.error("Erreur API:", err));
  }, []);

  const focusOnPoint = (point: AltitudePoint) => {
    setMapCenter([point.lat, point.lng]);
  };

  // Correction de l'icône par défaut de Leaflet
  const getIcon = (alt: number) => {
    if (!L) return null;
    return L.divIcon({
      className: "custom-div-icon",
      html: `<div style="background-color:#059669; color:white; padding:2px 5px; border-radius:4px; font-weight:bold; font-size:10px; border:1px solid white; white-space:nowrap;">${alt}m</div>`,
      iconSize: [30, 20],
      iconAnchor: [15, 10]
    });
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
          <p className="text-xs text-slate-500">Relief et topographie par quartier (Leaflet)</p>
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

        {/* CARTE LEAFLET */}
        <div className="lg:col-span-8 bg-white rounded-xl overflow-hidden shadow-sm border relative z-0">
          <MapContainer center={[43.6045, 1.4442]} zoom={12} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {points.map((point) => (
              L && (
                <Marker key={point.id} position={[point.lat, point.lng]} icon={getIcon(point.altitude)}>
                  <Popup>
                    <div className="p-1">
                      <strong className="text-sm">{point.nom}</strong><br/>
                      <span className="text-blue-600 font-bold">Altitude : {point.altitude}m</span>
                      <p className="text-xs text-gray-500 mt-1">{point.description}</p>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
            <MapController center={mapCenter} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
