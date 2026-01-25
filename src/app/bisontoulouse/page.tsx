'use client';

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react"; 
import "leaflet/dist/leaflet.css";

// Utilitaires de nettoyage XML
const getVal = (v: any) => {
  if (!v) return null;
  if (Array.isArray(v)) return v[0];
  if (typeof v === 'object') return v._ || v.value || null;
  return v;
};

const getInfo = (sit: any) => {
  const record = sit.situationRecord;
  const point = record?.groupOfLocations?.locationContainedInGroup?.pointByCoordinates?.pointCoordinates
             || record?.pointByCoordinates?.pointCoordinates;

  return {
    type: record?.["$"]?.["xsi:type"]?.replace('SituationRecord', '') || 'Alerte',
    desc: getVal(record?.nonGeneralPublicComment?.comment) || 
          getVal(record?.generalPublicComment?.comment) || 
          "Information trafic en cours.",
    route: getVal(record?.groupOfLocations?.locationContainedInGroup?.locationByReference?.predefinedLocationReference) || "Secteur Toulouse",
    lat: point?.latitude ? parseFloat(getVal(point.latitude)) : null,
    lng: point?.longitude ? parseFloat(getVal(point.longitude)) : null
  };
};

export default function BisonToulousePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // REFS pour le contrôle manuel (Méthode OTAN)
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Fetch des données
  useEffect(() => {
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

  // 2. Initialisation manuelle de la carte
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      
      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current).setView([43.6047, 1.4442], 11);
      
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
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

  // 3. Mise à jour des marqueurs
  useEffect(() => {
    if (!isMapReady || !mapInstance.current || events.length === 0) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;

      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) mapInstance.current.removeLayer(layer);
      });

      events.forEach((sit) => {
        const info = getInfo(sit);
        if (info.lat && info.lng) {
          const isAccident = info.type.toLowerCase().includes('accident');
          const color = isAccident ? '#ef4444' : '#f59e0b';

          const markerIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.4);"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          });

          L.marker([info.lat, info.lng], { icon: markerIcon })
            .bindPopup(`
              <div style="font-family: sans-serif; min-width: 160px;">
                <h3 style="margin:0; font-weight: 900; text-transform: uppercase; font-size: 11px; color: ${color}">${info.type}</h3>
                <p style="margin:2px 0; color: #2563eb; font-weight: 700; font-size: 10px;">${info.route}</p>
                <p style="margin:5px 0 0; font-size: 12px; color: #475569; line-height: 1.3;">${info.desc}</p>
              </div>
            `)
            .addTo(mapInstance.current);
        }
      });
    };

    updateMarkers();
  }, [isMapReady, events]);

  return (
    <div className="p-4 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-colors">
          <ArrowLeft size={20} /> Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-6 bg-white p-6 rounded-2xl shadow-sm border-b-4 border-yellow-400 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">🚗 Trafic Toulouse</h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Bison Futé Live</p>
        </div>
        <div className="flex gap-3 text-xs font-bold uppercase">
           <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-full border border-red-100">
             <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Accidents
           </div>
           <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full border border-orange-100">
             <span className="w-2 h-2 bg-orange-500 rounded-full" /> Travaux
           </div>
        </div>
      </header>

      <div className="rounded-3xl shadow-xl border-4 border-white mb-10 overflow-hidden h-[55vh] bg-slate-200 relative">
        <div ref={mapRef} className="h-full w-full z-0" />
        {loading && (
          <div className="absolute inset-0 z-10 bg-slate-100/60 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        )}
      </div>

      {/* Reste du tableau... */}
    </div>
  );
}