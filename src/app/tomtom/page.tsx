"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, AlertCircle, CheckCircle2, Gauge } from "lucide-react";

// Import dynamique obligatoire pour Leaflet dans Next.js
const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });

interface TrafficData {
  flowSegmentData?: {
    currentSpeed: number;
    freeFlowSpeed: number;
    currentTravelTime: number;
    freeFlowTravelTime: number;
  };
  error?: string;
}

export default function TomTomTrafficPage() {
  const [traffic, setTraffic] = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // On récupère la clé publique
  const tomtomKey = process.env.NEXT_PUBLIC_TOMTOM_KEY;

  useEffect(() => {
    const fetchTraffic = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/tomtom");
        const data = await res.json();
        
        if (data.error) {
          setErrorMsg(data.error);
        } else {
          setTraffic(data);
          setErrorMsg(null);
        }
      } catch (err) {
        setErrorMsg("Impossible de joindre l'API de trafic.");
      } finally {
        setLoading(false);
      }
    };

    fetchTraffic();
    // Optionnel : rafraîchir toutes les 2 minutes
    const interval = setInterval(fetchTraffic, 120000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-800 font-bold transition-all">
          <ArrowLeft size={20} /> Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-black mb-6 italic text-sky-600 uppercase tracking-tighter">
        🚗 Trafic en temps réel <span className="text-slate-400">| Toulouse</span>
      </h1>

      {/* Carte */}
      <div className="h-[400px] md:h-[500px] w-full rounded-3xl mb-8 border-4 border-white overflow-hidden shadow-2xl z-0">
        {tomtomKey ? (
          <MapContainer center={[43.6045, 1.444]} zoom={13} style={{ height: "100%", width: "100%" }}>
            {/* Fond de carte TomTom */}
            <TileLayer
              url={`https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${tomtomKey}`}
              attribution="&copy; TomTom"
            />
            {/* Couche de flux (Flow) */}
            <TileLayer
              url={`https://api.tomtom.com/map/1/tile/flowTile/flow/{z}/{x}/{y}.png?key=${tomtomKey}`}
              opacity={0.8}
            />
          </MapContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-slate-200">
             <p className="text-red-500 font-bold">Clé API NEXT_PUBLIC_TOMTOM_KEY manquante</p>
          </div>
        )}
      </div>

      {/* Infos Trafic */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-2xl mx-auto">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Gauge size={20} className="text-sky-500" /> État du segment (Centre-Ville)
        </h2>

        {loading && (
          <div className="flex items-center gap-3 animate-pulse text-sky-600">
            <div className="w-4 h-4 bg-sky-600 rounded-full animate-bounce"></div>
            Chargement des données en direct...
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} /> {errorMsg}
          </div>
        )}

        {!loading && traffic?.flowSegmentData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 uppercase font-bold">Vitesse</p>
              <p className="text-2xl font-black text-sky-600">{traffic.flowSegmentData.currentSpeed} <span className="text-sm">km/h</span></p>
              <p className="text-xs text-slate-400">Vitesse libre : {traffic.flowSegmentData.freeFlowSpeed} km/h</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 uppercase font-bold">Temps de trajet</p>
              <p className="text-2xl font-black text-slate-700">{Math.round(traffic.flowSegmentData.currentTravelTime / 60)} <span className="text-sm">min</span></p>
              <p className="text-xs text-slate-400">Normal : {Math.round(traffic.flowSegmentData.freeFlowTravelTime / 60)} min</p>
            </div>

            <div className="md:col-span-2 mt-2">
              {traffic.flowSegmentData.currentSpeed < traffic.flowSegmentData.freeFlowSpeed - 10 ? (
                <div className="flex items-center gap-2 p-3 bg-red-100 text-red-700 rounded-lg font-bold">
                  <AlertCircle size={18} /> Ralentissement détecté
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-emerald-100 text-emerald-700 rounded-lg font-bold">
                  <CheckCircle2 size={18} /> Circulation fluide
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
