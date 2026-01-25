'use client';

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "leaflet/dist/leaflet.css";

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
  const [isLoading, setIsLoading] = useState(true);
  
  // Refs pour le contrôle manuel de Leaflet
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Charger les données Bison Futé
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/bisonfute");
        const data = await res.json();
        let fetchedEvents = [];
        if (Array.isArray(data)) fetchedEvents = data;
        else if (data?.situation) fetchedEvents = [data.situation];
        else if (data?.situations) fetchedEvents = data.situations;
        
        setEvents(fetchedEvents);
      } catch (err) {
        console.error("Erreur Fetch BisonFute:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // 2. Initialisation de la carte avec nettoyage
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current).setView([43.6047, 1.4442], 10);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
      }).addTo(mapInstance.current);

      setIsMapReady(true);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 3. Mise à jour des marqueurs quand les données arrivent ou que la carte est prête
  useEffect(() => {
    if (!isMapReady || !mapInstance.current || events.length === 0) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;

      // Nettoyage des anciens marqueurs
      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) mapInstance.current.removeLayer(layer);
      });

      events.forEach((sit) => {
        const info = getInfo(sit);
        if (info.coords?.latitude && info.coords?.longitude) {
          const isAccident = info.type.toLowerCase().includes('accident');
          
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${isAccident ? "#ef4444" : "#f59e0b"}; width: 14px; height: 14px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 8px rgba(0,0,0,0.3);"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          });

          L.marker([parseFloat(info.coords.latitude), parseFloat(info.coords.longitude)], { icon: customIcon })
            .bindPopup(`
              <div style="color: #1e293b; font-family: sans-serif; min-width: 150px;">
                <h3 style="margin: 0; font-weight: 800; text-transform: uppercase; font-size: 12px; color: ${isAccident ? '#ef4444' : '#f59e0b'}">${info.type}</h3>
                <p style="margin: 4px 0; font-size: 11px; font-weight: 600; color: #64748b;">${info.route}</p>
                <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 6px 0;" />
                <p style="margin: 0; font-size: 11px; line-height: 1.4;">${info.desc}</p>
              </div>
            `)
            .addTo(mapInstance.current);
        }
      });
    };

    updateMarkers();
  }, [isMapReady, events]);

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

      {/* ZONE CARTE (DIV REF) */}
      <div className="rounded-3xl shadow-xl border-4 border-white mb-10 overflow-hidden bg-slate-200 h-[50vh] relative">
        <div ref={mapRef} className="h-full w-full z-0" />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 z-10">
            <p className="animate-pulse font-bold text-slate-600">Chargement du trafic en direct...</p>
          </div>
        )}
      </div>

      {/* Tableau détaillé */}
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