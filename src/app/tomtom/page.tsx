"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const Map = dynamic(() => import("./TomTomMap"), {
  ssr: false,
});

export default function TomTomPage() {
  const [trafficData, setTrafficData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/tomtom")
      .then(res => res.json())
      .then(data => setTrafficData(data))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Retour à l'accueil
        </Link>
      </nav>
      
      <h1 className="text-3xl font-bold mb-6">
        🚗 Trafic en temps réel - Toulouse
      </h1>

      <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
        {trafficData?.flowSegmentData ? (
          <div>
            <p>
              <strong>Vitesse actuelle :</strong>{" "}
              {trafficData.flowSegmentData.currentSpeed} km/h
            </p>
            <p>
              <strong>Vitesse libre :</strong>{" "}
              {trafficData.flowSegmentData.freeFlowSpeed} km/h
            </p>
            <p>
              <strong>Indice congestion :</strong>{" "}
              {trafficData.flowSegmentData.currentSpeed <
              trafficData.flowSegmentData.freeFlowSpeed
                ? "Ralentissement"
                : "Fluide"}
            </p>
          </div>
        ) : (
          <p>Chargement des données trafic...</p>
        )}
      </div>

      <div className="h-[600px] rounded-2xl overflow-hidden shadow-xl">
        <Map />
      </div>
    </div>
  );
}
