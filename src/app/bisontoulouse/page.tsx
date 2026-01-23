'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Imports dynamiques anti-erreur SSR
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

const getInfo = (sit: any) => {
  const record = sit.situationRecord;
  const point = record?.groupOfLocations?.locationContainedInGroup?.pointByCoordinates?.pointCoordinates
             || record?.groupOfLocations?.pointByCoordinates?.pointCoordinates;

  return {
    type: record?.["$"]?.["xsi:type"]?.replace('SituationRecord', '') || 'Incident',
    desc: record?.nonGeneralPublicComment?.comment?.value || record?.generalPublicComment?.comment?.value || "Détails non spécifiés.",
    route: record?.groupOfLocations?.locationContainedInGroup?.locationByReference?.predefinedLocationReference || "Axe Toulouse",
    gravite: record?.severity || 'normal',
    lat: point?.latitude,
    lng: point?.longitude
  };
};

export default function BisonToulousePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    import("leaflet").then(leaflet => setL(leaflet));

    // ✅ On appelle bien "bisontoulouse" ici
    fetch("/api/bisontoulouse")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEvents(data);
      })
      .catch(console.error);
  }, []);

  if (!isMounted || !L) return <div className="p-10 text-center">Chargement des données...</div>;

  return (
    <div className="p-4 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:underline font-bold">
          <ArrowLeft size={20} /> Retour
        </Link>
      </nav>

      <header className="mb-6 bg-white p-6 rounded-2xl shadow-sm border-b-4 border-yellow-400 flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900">🚗 Trafic & Travaux Toulouse</h1>
        <div className="flex gap-2 text-[10px] font-bold uppercase">
          <span className="bg-red-100 text-red-600 px-2 py-1 rounded">Accidents</span>
          <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded">Travaux</span>
        </div>
      </header>

      {/* CARTE */}
      <div className="rounded-3xl shadow-xl border-4 border-white mb-10 overflow-hidden h-[50vh]">
        <MapContainer center={[43.6047, 1.4442]} zoom={11} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {events.map((sit, idx) => {
            const info = getInfo(sit);
            if (!info.lat || !info.lng) return null;

            // Détection du type pour la couleur
            const isAccident = info.type.toLowerCase().includes('accident');
            const color = isAccident ? '#ef4444' : '#f59e0b';

            const markerIcon = L.divIcon({
                className: 'custom-icon',
                html: `<div style="background: ${color}; width:16px; height:16px; border-radius:50%; border:2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
                iconSize: [16, 16]
            });

            return (
              <Marker key={idx} position={[parseFloat(info.lat), parseFloat(info.lng)]} icon={markerIcon}>
                <Popup>
                  <div className="text-xs font-sans">
                    <strong className="text-slate-800 uppercase">{info.type}</strong><br/>
                    <span className="text-blue-600 font-bold">{info.route}</span>
                    <hr className="my-1"/>
                    <p className="text-slate-600">{info.desc}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* TABLEAU (Mise en page identique) */}
      <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
        <div className="p-4 bg-slate-50 border-b font-bold text-slate-700">
            {events.length} incidents et chantiers détectés
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400">
              <tr>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Axe</th>
                <th className="px-6 py-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.length > 0 ? events.map((sit, idx) => {
                const info = getInfo(sit);
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${info.type.toLowerCase().includes('accident') ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                            {info.type}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">{info.route}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{info.desc}</td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-slate-400 italic">
                    Aucun événement majeur à Toulouse pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
