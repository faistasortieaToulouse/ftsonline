"use client";

import { useEffect, useRef, useState } from "react";
import { Library, MapPin, ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

interface CulturePoint {
  id: number;
  nom: string;
  adresse: string;
  telephone: string;
  gestionnaire: string;
  siteWeb: string;
  lat: number | null;
  lng: number | null;
  quartier: string;
}

export default function EcoleCulturePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);

  const [points, setPoints] = useState<CulturePoint[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // 1. Récupération des données
  useEffect(() => {
    fetch("/api/ecoleculture")
      .then((res) => res.json())
      .then((data) => {
        setPoints(data);
        setIsLoadingData(false);
      })
      .catch((err) => {
        console.error("Erreur API:", err);
        setIsLoadingData(false);
      });
  }, []);

  // 2. Initialisation de Leaflet
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      if (!mapInstance.current) {
        // Toulouse par défaut
        mapInstance.current = L.map(mapRef.current!).setView([43.6045, 1.4442], 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapInstance.current);

        markersLayer.current = L.layerGroup().addTo(mapInstance.current);
        setIsMapReady(true);
      }
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isLoadingData]);

  // 3. Mise à jour des marqueurs
  useEffect(() => {
    if (!isMapReady || !mapInstance.current) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;
      markersLayer.current.clearLayers();

      points.forEach((point) => {
        if (point.lat === null || point.lng === null) return;

        const customIcon = L.divIcon({
          className: "custom-marker",
          html: `<div style="background-color: #4f46e5; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${point.id}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const popupContent = `
          <div style="color:#1e293b;padding:4px;font-family:sans-serif;max-width:200px;">
            <div style="font-size:10px; font-weight:bold; color:#6366f1;">#${point.id} - ${point.quartier}</div>
            <strong style="font-size:14px;color:#1e293b;display:block;margin-bottom:4px;">${point.nom}</strong>
            <div style="color:#64748b; font-size:12px; margin-bottom:4px;">${point.adresse}</div>
            <div style="font-size:12px; font-weight:bold;">Tel: ${point.telephone}</div>
          </div>
        `;

        L.marker([point.lat, point.lng], { icon: customIcon })
          .bindPopup(popupContent)
          .addTo(markersLayer.current);
      });
    };

    updateMarkers();
  }, [isMapReady, points]);

  // 4. Fonction de focus
  const focusOnPoint = (point: CulturePoint) => {
    if (!mapInstance.current || point.lat === null || point.lng === null) return;
    mapInstance.current.setView([point.lat, point.lng], 16, { animate: true });
  };

  return (
    <div className="flex flex-col h-screen p-4 gap-4 bg-slate-50">
      
      <nav className="mb-2">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border">
        <div className="bg-indigo-600 p-2 rounded-lg text-white">
          <Library size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 leading-none">Toulouse Culture</h1>
          <p className="text-xs text-slate-500 mt-1">Écoles et lieux d'enseignement</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden">
        {/* LISTE */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="p-4 border-b text-[10px] text-slate-400 uppercase font-black w-16 text-center">N°</th>
                <th className="p-4 border-b text-[10px] text-slate-400 uppercase font-black">Établissement / Quartier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {points.map((point) => (
                <tr
                  key={point.id}
                  onClick={() => focusOnPoint(point)}
                  className="hover:bg-indigo-50/50 cursor-pointer transition-colors group"
                >
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors border border-slate-200">
                      {point.id}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-800 text-sm">{point.nom}</div>
                    <div className="flex items-center gap-1 text-[11px] text-indigo-500 font-medium mt-0.5">
                      <MapPin size={10} /> {point.quartier}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CARTE AVEC LOADER */}
        <div className="lg:col-span-8 bg-white rounded-xl overflow-hidden shadow-sm border relative">
          <div ref={mapRef} className="h-full w-full z-0" />
          
          {(!isMapReady || isLoadingData) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-50/90 z-10 border-2 border-dashed border-indigo-100 rounded-xl">
              <Loader2 className="animate-spin h-12 w-12 text-indigo-700 mb-4" />
              <p className="text-indigo-700 font-bold text-xl italic animate-pulse">
                🚀 En cours de chargement...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
