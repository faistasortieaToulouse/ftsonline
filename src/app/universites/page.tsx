'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface Universite {
  name: string;
  address: string;
  url: string;
  type: string;
  lat?: number; 
  lng?: number;
}

export default function UniversitesToulousePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);

  const [places, setPlaces] = useState<Universite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/universites")
      .then(async (res) => {
        const data = await res.json();
        setPlaces(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current!).setView([43.6045, 1.444], 12);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance.current);
      }

      // Nettoyer les anciens marqueurs avant d'en ajouter de nouveaux
      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          mapInstance.current.removeLayer(layer);
        }
      });

      places.forEach((place, i) => {
        if (place.lat && place.lng) {
          // Création d'une icône HTML personnalisée avec le numéro
          const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `
              <div class="flex items-center justify-center w-8 h-8 bg-blue-900 border-2 border-white rounded-full shadow-lg">
                <span class="text-white text-xs font-bold">${i + 1}</span>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32], // Point bas du cercle sur la coordonnée
            popupAnchor: [0, -32]  // Popup juste au dessus du cercle
          });

          L.marker([place.lat, place.lng], { icon: customIcon })
            .addTo(mapInstance.current!)
            .bindPopup(`
              <div style="font-family:sans-serif; padding: 5px;">
                <strong style="color:#1e3a8a;">${i + 1}. ${place.name}</strong><br>
                <p style="font-size:12px; margin: 4px 0;">${place.address}</p>
                <a href="${place.url}" target="_blank" style="color:#2563eb; font-weight:bold; font-size:11px;">Actualités →</a>
              </div>
            `);
        }
      });
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [places]);

  return (
    <div className="p-4 max-w-7xl mx-auto font-sans">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-blue-900 uppercase tracking-tighter">🎓 Universités & Grandes Écoles — Toulouse</h1>
        <p className="text-slate-600">Carte interactive des campus toulousains.</p>
      </header>

      {/* --- Carte Leaflet --- */}
      <div
        ref={mapRef}
        style={{ height: "60vh", width: "100%" }}
        className="mb-8 border-4 border-white rounded-3xl shadow-2xl bg-slate-100 flex items-center justify-center overflow-hidden z-0"
      >
        {loading && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-blue-900">Chargement de la carte...</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <span className="bg-blue-900 text-white px-4 py-1 rounded-full text-sm shadow-md">
          {places.length}
        </span>
        Établissements répertoriés
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.map((place, i) => (
          <div key={i} className="group p-6 border border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-xl hover:border-blue-200 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="bg-slate-900 text-white w-10 h-10 rounded-full flex items-center justify-center font-black shadow-inner group-hover:bg-blue-900 transition-colors">
                  {i + 1}
                </span>
                <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest border border-blue-100">
                  {place.type}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{place.name}</h3>
              <p className="text-sm text-slate-500 italic mb-6 flex items-center gap-2">
                <span className="text-blue-400">📍</span> {place.address}
              </p>
            </div>
            
            <a 
              href={place.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full text-center bg-slate-900 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-all transform active:scale-95 shadow-md"
            >
              VOIR LES ACTUALITÉS
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}