'use client';

import React, { useEffect, useState, useRef } from 'react';
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, Waves, Loader2, Anchor, Database } from "lucide-react";

interface EtendueEau {
  id: number;
  nom: string;
  superficie: string;
  type: string;
  lat?: number;
  lng?: number;
}

const THEME_COLOR = '#0d9488'; // Teal 600

export default function MerOceanPage() {
  const [data, setData] = useState<EtendueEau[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/merocean');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoading) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current!).setView([20, 0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);

      markersGroupRef.current = L.layerGroup().addTo(mapInstance.current);
      setIsMapReady(true);
    };
    initMap();
  }, [isLoading]);

  useEffect(() => {
    if (!isMapReady || !mapInstance.current || data.length === 0) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      markersGroupRef.current.clearLayers();

      data.forEach((item) => {
        if (item.lat && item.lng) {
          const icon = L.divIcon({
            className: 'marker-ocean',
            html: `<div style="background-color: ${THEME_COLOR}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
            iconSize: [20, 20],
          });

          L.marker([item.lat, item.lng], { icon })
            .bindPopup(`
              <div style="text-align: center; font-family: sans-serif;">
                <strong style="color: ${THEME_COLOR}; font-size: 14px;">${item.nom}</strong><br/>
                <span style="font-size: 12px; font-weight: bold;">${item.superficie}</span><br/>
                <a href="#item-${item.id}" style="color: ${THEME_COLOR}; font-size: 10px; font-weight: bold; text-decoration: none; display: block; margin-top: 5px;">Voir dans la liste ↓</a>
              </div>
            `)
            .addTo(markersGroupRef.current);
        }
      });
    };
    updateMarkers();
  }, [isMapReady, data]);

  const goToLocation = (lat?: number, lng?: number) => {
    if (lat && lng && mapInstance.current) {
      mapInstance.current.flyTo([lat, lng], 4, { duration: 1.5 });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 bg-slate-50 min-h-screen">
      <nav className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-teal-600 font-bold hover:underline">
          <ArrowLeft size={18} /> Retour à l'Accueil
        </Link>
      </nav>

      <header className="mb-10 text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase flex items-center justify-center gap-3">
          <Waves className="text-teal-500" size={40} /> Mers & Océans
        </h1>
        <p className="text-slate-500 font-medium">Inventaire des grandes étendues d'eau de la Planète Bleue.</p>
      </header>

      <div className="relative mb-12 shadow-2xl rounded-3xl overflow-hidden border-8 border-white">
        <div ref={mapRef} className="h-[450px] w-full bg-blue-50 z-0" />
        {!isMapReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-teal-50/80 backdrop-blur-md z-10">
            <Loader2 className="animate-spin text-teal-600 mb-2" size={32} />
            <span className="text-teal-800 font-bold text-xs uppercase tracking-widest">Sondage des fonds marins...</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Database className="text-teal-600" />
        <h2 className="text-2xl font-bold text-slate-800">Classement par superficie</h2>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        <table className="min-w-full text-left">
          <thead className="bg-slate-900 text-teal-400 text-xs uppercase">
            <tr>
              <th className="px-6 py-4 font-black">Nom</th>
              <th className="px-6 py-4 font-black">Superficie</th>
              <th className="px-6 py-4 font-black">Type</th>
              <th className="px-6 py-4 font-black">Localiser</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item) => (
              <tr 
                key={item.id} 
                id={`item-${item.id}`}
                className="hover:bg-teal-50 transition-colors group scroll-mt-10"
              >
                <td className="px-6 py-4 font-bold text-slate-800">{item.nom}</td>
                <td className="px-6 py-4 text-teal-600 font-black">{item.superficie}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-md text-xs font-bold uppercase">
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => goToLocation(item.lat, item.lng)}
                    className="p-2 hover:bg-teal-600 hover:text-white rounded-full transition-all text-teal-600"
                  >
                    <Anchor size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
