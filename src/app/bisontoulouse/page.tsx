'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Imports dynamiques pour éviter les erreurs "window is not defined" (SSR)
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

/**
 * Nettoie les valeurs extraites du XML (xml2js)
 * Parfois une valeur est "Texte", parfois c'est {_: "Texte"} ou ["Texte"]
 */
const getVal = (v: any) => {
  if (!v) return null;
  if (Array.isArray(v)) return v[0];
  if (typeof v === 'object') return v._ || v.value || null;
  return v;
};

const getInfo = (sit: any) => {
  const record = sit.situationRecord;
  
  // Chemins multiples pour les coordonnées dans le flux DATEX2
  const point = record?.groupOfLocations?.locationContainedInGroup?.pointByCoordinates?.pointCoordinates
             || record?.groupOfLocations?.pointByCoordinates?.pointCoordinates
             || record?.pointByCoordinates?.pointCoordinates;

  return {
    type: record?.["$"]?.["xsi:type"]?.replace('SituationRecord', '') || 'Alerte',
    desc: getVal(record?.nonGeneralPublicComment?.comment) || 
          getVal(record?.generalPublicComment?.comment) || 
          "Information trafic en cours.",
    route: getVal(record?.groupOfLocations?.locationContainedInGroup?.locationByReference?.predefinedLocationReference) || "Secteur Toulouse",
    gravite: record?.severity || 'normal',
    lat: point?.latitude ? parseFloat(getVal(point.latitude)) : null,
    lng: point?.longitude ? parseFloat(getVal(point.longitude)) : null
  };
};

export default function BisonToulousePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    
    // Importation de l'objet Leaflet pour les icônes personnalisées
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
    });

    // Récupération des données depuis notre API locale
    fetch("/api/bisontoulouse")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur fetch:", err);
        setLoading(false);
      });
  }, []);

  // Empêcher le rendu côté serveur pour Leaflet
  if (!isMounted) return null;

  return (
    <div className="p-4 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-colors">
          <ArrowLeft size={20} /> Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-6 bg-white p-6 rounded-2xl shadow-sm border-b-4 border-yellow-400 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">🚗 Trafic Toulouse</h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Données Bison Futé en temps réel</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-red-700 text-xs font-bold uppercase">Accidents</span>
          </div>
          <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            <span className="text-orange-700 text-xs font-bold uppercase">Travaux</span>
          </div>
        </div>
      </header>

      {/* Zone de la Carte */}
      <div className="rounded-3xl shadow-xl border-4 border-white mb-10 overflow-hidden h-[55vh] bg-slate-200 relative">
        {loading && (
          <div className="absolute inset-0 z-[1000] bg-slate-100/50 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        )}
        
        {L && (
          <MapContainer center={[43.6047, 1.4442]} zoom={11} style={{ height: "100%", width: "100%" }}>
            <TileLayer 
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            
            {events.map((sit, idx) => {
              const info = getInfo(sit);
              if (!info.lat || !info.lng) return null;

              const isAccident = info.type.toLowerCase().includes('accident');
              const color = isAccident ? '#ef4444' : '#f59e0b';

              const markerIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.4);"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
              });

              return (
                <Marker key={idx} position={[info.lat, info.lng]} icon={markerIcon}>
                  <Popup>
                    <div className="text-sm p-1">
                      <h3 className="font-black text-slate-800 uppercase text-xs mb-1">{info.type}</h3>
                      <p className="text-blue-600 font-bold text-[11px] mb-2">{info.route}</p>
                      <p className="text-slate-600 leading-snug">{info.desc}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>

      {/* Liste des événements */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>📋</span> Alertes détaillées
          </h2>
          <span className="text-xs font-mono bg-white px-3 py-1 rounded-full border shadow-sm">
            {events.length} incident(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="px-8 py-5">Nature</th>
                <th className="px-8 py-5">Localisation</th>
                <th className="px-8 py-5">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.length > 0 ? (
                events.map((sit, idx) => {
                  const info = getInfo(sit);
                  const isAccident = info.type.toLowerCase().includes('accident');
                  return (
                    <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-8 py-5">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase border ${
                          isAccident ? 'bg-red-50 text-red-600 border-red-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                        }`}>
                          {info.type}
                        </span>
                      </td>
                      <td className="px-8 py-5 font-bold text-slate-700 text-sm">{info.route}</td>
                      <td className="px-8 py-5 text-xs text-slate-500 leading-relaxed max-w-md">{info.desc}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <span className="text-4xl">🍃</span>
                      <p className="italic font-medium text-slate-500">Aucun incident signalé à Toulouse actuellement.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
