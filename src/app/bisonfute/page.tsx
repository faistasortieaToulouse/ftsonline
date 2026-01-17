'use client';

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

// Helper pour extraire les données du flux complexe DATEX2
const getInfo = (sit: any) => {
  const record = sit.situationRecord;
  return {
    id: sit.id || 'N/A',
    type: record?.type || 'Inconnu',
    desc: record?.nonGeneralPublicComment?.comment?.value || "Pas de description détaillée disponible.",
    route: record?.groupOfLocations?.locationContainedInGroup?.locationByReference?.predefinedLocationReference || "Réseau National",
    gravite: record?.severity || 'normal',
    debut: record?.validity?.validityTimeSpecification?.overallStartTime,
    // Extraction des coordonnées
    coords: record?.groupOfLocations?.locationContainedInGroup?.pointByCoordinates?.pointCoordinates 
         || record?.groupOfLocations?.locationByReference?.pointByCoordinates?.pointCoordinates
  };
};

export default function BisonFutePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);

  // 1. Récupération des données
  useEffect(() => {
    fetch("/api/bisonfute")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEvents(data);
        else if (data && data.situation) setEvents([data.situation]);
      })
      .catch(console.error);
  }, []);

  // 2. Gestion de la Carte Google Maps
  useEffect(() => {
    if (!isReady || !mapRef.current || typeof window.google === 'undefined') return;

    // Initialisation de la carte si elle n'existe pas
    if (!mapInstance.current) {
      mapInstance.current = new google.maps.Map(mapRef.current, {
        zoom: 10,
        center: { lat: 43.6047, lng: 1.4442 }, // Toulouse
        mapId: 'DEMO_MAP_ID', // Requis pour certaines fonctionnalités avancées
      });
    }

    // Nettoyage des anciens marqueurs
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Ajout des marqueurs pour les événements
    events.forEach((sit) => {
      const info = getInfo(sit);
      
      if (info.coords?.latitude && info.coords?.longitude) {
        const isAccident = info.type.toLowerCase().includes('accident');
        
        const marker = new google.maps.Marker({
          position: { lat: parseFloat(info.coords.latitude), lng: parseFloat(info.coords.longitude) },
          map: mapInstance.current,
          title: info.type,
          icon: {
            path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 5,
            fillColor: isAccident ? "#ef4444" : "#f59e0b", // Rouge ou Orange
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff",
          }
        });

        // Fenêtre d'info au clic
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="color: #1e293b; padding: 8px; max-width: 200px;">
              <h3 style="font-weight: bold; text-transform: uppercase; font-size: 12px; margin-bottom: 4px;">${info.type}</h3>
              <p style="font-size: 11px; color: #64748b;">${info.route}</p>
              <hr style="margin: 8px 0; border: 0; border-top: 1px solid #e2e8f0;"/>
              <p style="font-size: 11px;">${info.desc}</p>
            </div>
          `
        });

        marker.addListener("click", () => {
          infoWindow.open(mapInstance.current, marker);
        });

        markersRef.current.push(marker);
      }
    });
  }, [isReady, events]);

  return (
    <div className="p-4 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border-b-4 border-yellow-400 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">🚗 Info Trafic Haute-Garonne</h1>
          <p className="text-slate-500 text-sm font-medium">Données Bison Futé en temps réel</p>
        </div>
        <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                <span className="text-red-700 text-xs font-bold uppercase tracking-wider">Accidents</span>
            </div>
            <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span className="text-orange-700 text-xs font-bold uppercase tracking-wider">Travaux / Maintenance</span>
            </div>
        </div>
      </header>

      {/* Carte */}
      <div 
        ref={mapRef} 
        style={{ height: "50vh" }} 
        className="rounded-3xl shadow-xl border-4 border-white mb-10 overflow-hidden bg-slate-200" 
      />

      {/* Tableau des événements */}
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
                  <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        isAccident ? 'bg-red-100 text-red-600' : 
                        isMaintenance ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {info.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">
                      {info.route}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate lg:max-w-md">
                      {info.desc}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                      {info.debut ? new Date(info.debut).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`w-2.5 h-2.5 rounded-full mx-auto ${
                        info.gravite === 'highest' ? 'bg-red-500 animate-pulse' : 
                        info.gravite === 'medium' ? 'bg-orange-400' : 'bg-green-400'
                      }`} title={`Gravité: ${info.gravite}`} />
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl">✅</span>
                        <p className="text-slate-400 italic font-medium">Aucun incident majeur sur le réseau national actuellement.</p>
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