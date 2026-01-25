'use client';

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const STATIONS = [
  { id: "stop_point:SP_1", name: "Jean Jaurès", lat: 43.6061, lng: 1.4485, lines: ["A", "B"] },
  { id: "stop_point:SP_18", name: "Capitole", lat: 43.6044, lng: 1.4433, lines: ["A"] },
  { id: "stop_point:SP_221", name: "Marengo-SNCF", lat: 43.6111, lng: 1.4536, lines: ["A"] },
  { id: "stop_point:SP_2156", name: "Palais de Justice", lat: 43.5932, lng: 1.4441, lines: ["T1", "T2", "B"] }
];

export default function TisseoPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);
  
  const [selectedStation, setSelectedStation] = useState(STATIONS[0]);
  const [schedules, setSchedules] = useState<any[]>([]);

  // 1. Récupération des horaires (inchangé)
  useEffect(() => {
    fetch(`/api/tisseotoulouse?stopPointId=${selectedStation.id}`)
      .then(res => res.json())
      .then(data => setSchedules(Array.isArray(data) ? data : []))
      .catch(err => console.error("Erreur horaires:", err));
  }, [selectedStation]);

  // 2. Initialisation de Leaflet (Méthode OTAN)
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      // Création de l'icône personnalisée (Leaflet a besoin d'aide pour les icônes en Next.js)
      const DefaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      });

      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current!).setView(
          [selectedStation.lat, selectedStation.lng], 
          15
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© OpenStreetMap'
        }).addTo(mapInstance.current);

        markerInstance.current = L.marker(
          [selectedStation.lat, selectedStation.lng], 
          { icon: DefaultIcon }
        ).addTo(mapInstance.current);
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 3. Mise à jour de la position sans recharger toute la carte
  useEffect(() => {
    if (mapInstance.current && markerInstance.current) {
      const coords: [number, number] = [selectedStation.lat, selectedStation.lng];
      mapInstance.current.flyTo(coords, 15);
      markerInstance.current.setLatLng(coords);
    }
  }, [selectedStation]);

  return (
    <div className="p-4 max-w-6xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900">

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-6 bg-indigo-900 p-8 rounded-3xl shadow-2xl text-white">
        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
          <span>🚇</span> Tisséo Live
        </h1>
        <p className="text-indigo-200 font-medium">Temps réel - Métro, Tram et Bus Toulouse (via Leaflet)</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne Gauche : Sélecteur et Carte */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold mb-4 text-slate-400 uppercase text-xs tracking-widest">Choisir une station</h3>
            <div className="flex flex-col gap-2">
              {STATIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStation(s)}
                  className={`p-4 rounded-xl text-left transition-all font-bold ${
                    selectedStation.id === s.id 
                    ? "bg-indigo-600 text-white shadow-lg translate-x-2" 
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Div de la carte Leaflet */}
          <div 
            ref={mapRef} 
            style={{ height: "300px" }} 
            className="rounded-2xl shadow-md border-4 border-white overflow-hidden z-0" 
          />
        </div>

        {/* Colonne Droite : Horaires */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="text-xl font-bold">Prochains passages</h2>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold animate-pulse">LIVE</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase text-slate-400 bg-slate-50">
                    <th className="px-6 py-4">Ligne</th>
                    <th className="px-6 py-4">Destination</th>
                    <th className="px-6 py-4">Attente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schedules.length > 0 ? schedules.map((dep, idx) => {
                    const diffMins = Math.round((new Date(dep.dateTime).getTime() - Date.now()) / 60000);
                    return (
                      <tr key={idx} className="hover:bg-indigo-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black shadow-sm" style={{ backgroundColor: dep.line.color }}>
                            {dep.line.shortName}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700">
                          {dep.destination?.[0]?.name}
                        </td>
                        <td className="px-6 py-4 font-mono font-black text-indigo-600">
                          {diffMins <= 0 ? "À quai" : `${diffMins} min`}
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-20 text-center text-slate-400 italic">
                        Chargement des horaires...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}