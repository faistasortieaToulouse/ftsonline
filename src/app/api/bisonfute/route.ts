'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// 1. Import dynamique strict pour éviter l'erreur d'hydratation #418
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-200 animate-pulse flex items-center justify-center">Chargement de la carte...</div>
});
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

const getInfo = (sit: any) => {
  const record = sit.situationRecord;
  return {
    id: sit.id || 'N/A',
    type: record?.type || 'Inconnu',
    desc: record?.nonGeneralPublicComment?.comment?.value || "Pas de description détaillée disponible.",
    route: record?.groupOfLocations?.locationContainedInGroup?.locationByReference?.predefinedLocationReference || "Réseau National",
    gravite: record?.severity || 'normal',
    debut: record?.validity?.validityTimeSpecification?.overallStartTime,
    coords: record?.groupOfLocations?.locationContainedInGroup?.pointByCoordinates?.pointCoordinates 
         || record?.groupOfLocations?.locationByReference?.pointByCoordinates?.pointCoordinates
  };
};

export default function BisonFutePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false); // 🔥 Crucial pour l'hydratation
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true); // On signale que le client est prêt
    
    import("leaflet").then((leaflet) => {
      setL(leaflet);
    });

    async function fetchData() {
      try {
        const res = await fetch("/api/bisonfute");
        const data = await res.json();
        if (Array.isArray(data)) setEvents(data);
        else if (data && data.situation) setEvents([data.situation]);
        else if (data && data.situations) setEvents(data.situations); // Parfois le flux est dans .situations
      } catch (err) {
        console.error("Erreur Fetch BisonFute:", err);
      }
    }
    fetchData();
  }, []);

  const createCustomIcon = (type: string) => {
    if (!L) return null;
    const isAccident = type.toLowerCase().includes('accident');
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${isAccident ? "#ef4444" : "#f59e0b"}; width: 14px; height: 14px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 8px rgba(0,0,0,0.3);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
  };

  // Si on est encore côté serveur, on affiche un squelette vide pour éviter l'erreur #418
  if (!isMounted) {
    return <div className="p-4 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">Chargement...</div>;
  }

  return (
    <div className="p-4 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border-b-4 border-yellow-400 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">🚗 Info Trafic Haute-Garonne</h1>
          <p className="text-slate-500 text-sm font-medium">Temps réel — Bison Futé</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-red-700 text-xs font-bold uppercase tracking-wider">Accidents</span>
          </div>
          <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            <span className="text-orange-700 text-xs font-bold uppercase tracking-wider">Travaux</span>
          </div>
        </div>
      </header>

      {/* Carte avec protection Hydratation */}
      <div className="rounded-3xl shadow-xl border-4 border-white mb-10 overflow-hidden bg-slate-200 h-[50vh]">
        <MapContainer center={[43.6047, 1.4442]} zoom={10} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {events.map((sit, idx) => {
            const info = getInfo(sit);
            const icon = createCustomIcon(info.type);
            if (info.coords?.latitude && info.coords?.longitude && icon) {
              return (
                <Marker 
                  key={idx} 
                  position={[parseFloat(info.coords.latitude), parseFloat(info.coords.longitude)]}
                  icon={icon}
                >
                  <Popup>
                    <div className="text-slate-800 p-1">
                      <h3 className="font-bold uppercase text-[12px] mb-1">{info.type}</h3>
                      <p className="text-[11px] text-slate-500 mb-1">{info.route}</p>
                      <hr className="my-1 border-slate-100"/>
                      <p className="text-[11px]">{info.desc}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}
        </MapContainer>
      </div>

      {/* Tableau (Mise en page conservée) */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-10">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span>📋</span> Liste détaillée des alertes
            </h2>
            <span className="text-xs font-mono text-slate-400 bg-white px-2 py-1 rounded border">
                {events.length} incident(s) détecté(s)
            </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Route</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Début</th>
                <th className="px-6 py-4 text-center">Gravité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.length > 0 ? events.map((sit, idx) => {
                const info = getInfo(sit);
                const isAccident = info.type.toLowerCase().includes('accident');
                const isMaintenance = info.type.toLowerCase().includes('maintenance') || info.type.toLowerCase().includes('work');
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        isAccident ? 'bg-red-100 text-red-600' : 
                        isMaintenance ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {info.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{info.route}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">{info.desc}</td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                      {info.debut ? new Date(info.debut).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`w-2.5 h-2.5 rounded-full mx-auto ${
                        info.gravite === 'highest' ? 'bg-red-500 animate-pulse' : 
                        info.gravite === 'medium' ? 'bg-orange-400' : 'bg-green-400'
                      }`} />
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic font-medium">
                    Aucun incident majeur détecté.
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
