'use client';

import React, { useEffect, useState, useRef } from 'react';
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, Globe, Loader2, Info, Map as MapIcon } from "lucide-react";

// Interface pour les données
interface Nation {
  rang: number;
  pays: string;
  superficie: string;
  region: string;
  info?: string;
  // Ajout de coordonnées pour la carte (à adapter selon ton API)
  lat?: number;
  lng?: number;
}

const WORLD_CENTER: [number, number] = [20, 0];
const THEME_COLOR = '#2563eb'; // Bleu Royal

export default function MicroEtatPage() {
  const [nations, setNations] = useState<Nation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);

  // 1. Chargement des données
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/microetatnation');
        if (!res.ok) throw new Error("Erreur lors de la récupération des données");
        const data = await res.json();
        setNations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // 2. Initialisation de la carte
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoading) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      
      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current!).setView(WORLD_CENTER, 2);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      markersGroupRef.current = L.layerGroup().addTo(mapInstance.current);
      setIsMapReady(true);
    };

    initMap();
  }, [isLoading]);

  // 3. Mise à jour des marqueurs
  useEffect(() => {
    if (!isMapReady || !mapInstance.current || nations.length === 0) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      markersGroupRef.current.clearLayers();

      nations.forEach((nation) => {
        // Note: Si ton API n'a pas de lat/lng, les marqueurs ne s'afficheront pas
        if (nation.lat && nation.lng) {
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${THEME_COLOR}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; shadow: 0 2px 4px rgba(0,0,0,0.2);">#${nation.rang}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          L.marker([nation.lat, nation.lng], { icon: customIcon })
            .bindPopup(`
              <div style="text-align: center; font-family: sans-serif;">
                <strong style="color: ${THEME_COLOR}; font-size: 14px;">${nation.pays}</strong><br/>
                <span style="font-size: 11px; color: #64748b;">${nation.region}</span><br/>
                <span style="font-weight: bold; font-size: 12px;">${nation.superficie}</span>
              </div>
            `)
            .addTo(markersGroupRef.current);
        }
      });
    };

    updateMarkers();
  }, [isMapReady, nations]);

  if (error) return <div className="p-10 text-red-600 text-center font-bold">Erreur : {error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 bg-white min-h-screen">
      <nav className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline">
          <ArrowLeft size={18} /> Retour à l'Accueil
        </Link>
      </nav>

      <header className="mb-10 text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight uppercase italic flex items-center justify-center gap-3">
          <Globe className="text-blue-600" /> Micro-États & Nations
        </h1>
        <p className="text-slate-500 italic font-medium">
          Exploration cartographique des plus petits territoires du globe.
        </p>
      </header>

      {/* ZONE CARTE */}
      <div className="relative mb-12 shadow-2xl rounded-[2rem] overflow-hidden border-4 border-slate-50">
        <div 
          ref={mapRef} 
          className="h-[400px] md:h-[500px] w-full bg-slate-100 z-0"
        />
        {!isMapReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600 mb-2" />
            <p className="text-blue-600 font-bold text-xs uppercase tracking-widest">Initialisation du monde...</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mb-6">
        <MapIcon className="text-blue-600" />
        <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Données Statistiques</h2>
      </div>

      {/* TABLEAU */}
      <div className="overflow-hidden shadow-xl rounded-2xl border border-slate-100">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-slate-900 text-white text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 text-left font-black">Rang</th>
              <th className="px-6 py-4 text-left font-black">Pays</th>
              <th className="px-6 py-4 text-left font-black">Superficie</th>
              <th className="px-6 py-4 text-left font-black">Région</th>
              <th className="px-6 py-4 text-left font-black">Infos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
               <tr><td colSpan={5} className="p-10 text-center text-slate-400 italic">Chargement des données...</td></tr>
            ) : (
              nations.map((nation) => (
                <tr key={nation.rang} className="hover:bg-blue-50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-400 group-hover:text-blue-600">#{nation.rang}</td>
                  <td className="px-6 py-4 font-black text-slate-800">{nation.pays}</td>
                  <td className="px-6 py-4 text-blue-600 font-bold">{nation.superficie}</td>
                  <td className="px-6 py-4 text-slate-500 font-medium">{nation.region}</td>
                  <td className="px-6 py-4 text-slate-400 italic">
                    <div className="flex items-center gap-2">
                      <Info size={14} className="text-blue-300" />
                      {nation.info || "-"}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <footer className="mt-16 py-8 border-t border-slate-100 text-center">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">
          Données Géographiques • 2026
        </p>
      </footer>
    </div>
  );
}
