'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface CommercePlace {
  nomLieu: string;
  num: string;
  typeRue: string;
  nomRue: string;
  quartier: string;
  établissement: string;
  commentaire: string;
  lat?: number; 
  lng?: number; 
}

const TOULOUSE_CENTER: [number, number] = [43.6045, 1.444];

export default function CommercePlacesPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [places, setPlaces] = useState<CommercePlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [L, setL] = useState<any>(null);

  // --- 1. Récupération des données ---
  useEffect(() => {
    fetch("/api/visitecommerce")
      .then(async (res) => {
        const data = await res.json();
        setPlaces(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // --- 2. Initialisation Leaflet ---
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || loading) return;

    const initMap = async () => {
      const Leaflet = (await import('leaflet')).default;
      setL(Leaflet);

      if (mapInstance.current) return;

      mapInstance.current = Leaflet.map(mapRef.current!).setView(TOULOUSE_CENTER, 14);

      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [loading]);

  // --- 3. Ajout des marqueurs numérotés ---
  useEffect(() => {
    if (!L || !mapInstance.current || places.length === 0) return;

    places.forEach((place, i) => {
      if (place.lat && place.lng) {
        const currentNum = i + 1;
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: #2563eb;
              width: 26px;
              height: 26px;
              border-radius: 50%;
              border: 2px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 11px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              ${currentNum}
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        L.marker([place.lat, place.lng], { icon: customIcon })
          .addTo(mapInstance.current!)
          .bindPopup(`
            <div style="font-family: sans-serif; text-align: center; min-width: 150px;">
              <strong style="color: #1e40af;">${currentNum}. ${place.nomLieu}</strong><br>
              <small style="color: #64748b;">${place.num} ${place.typeRue} ${place.nomRue}</small><br>
              <p style="margin: 8px 0; font-size:12px; font-weight: 600;">${place.établissement}</p>
              <a href="#commerce-${currentNum}" style="display: inline-block; background-color: #2563eb; color: white; padding: 4px 10px; border-radius: 4px; text-decoration: none; font-size: 11px; font-weight: bold;">Voir détails ↓</a>
            </div>
          `);
      }
    });
  }, [L, places]);

  return (
    <div className="p-4 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-6 text-slate-900 leading-tight">
        🛍️ Visite des Commerces et Lieux Historiques
      </h1>

      {/* Conteneur de la carte */}
      <div
        ref={mapRef}
        style={{ height: "60vh", width: "100%" }}
        className="mb-8 border-2 border-white rounded-2xl bg-gray-100 flex items-center justify-center relative z-0 overflow-hidden shadow-xl"
      >
        {loading && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-blue-600 font-medium">Chargement de la carte...</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-slate-800">
        <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-sm">
          {places.length}
        </span>
        Commerces répertoriés
      </h2>

      {/* Liste des lieux */}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {places.map((place, i) => (
          <li 
            key={i} 
            id={`commerce-${i + 1}`}
            className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all scroll-mt-20 group"
          >
            <div className="flex justify-between items-start mb-3">
              <p className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                <span className="inline-flex items-center justify-center bg-slate-900 group-hover:bg-blue-600 text-white w-8 h-8 rounded-full text-xs mr-3 transition-colors">
                  {i + 1}
                </span>
                {place.nomLieu}
              </p>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full uppercase border border-blue-100">
                {place.établissement}
              </span>
            </div>
            
            <p className="flex items-center gap-2 italic text-slate-500 text-sm mb-3">
              <span className="text-slate-400">📍</span>
              {place.num && place.num !== "0" ? `${place.num} ` : ""}{place.typeRue} {place.nomRue} — <span className="font-semibold text-slate-600">{place.quartier}</span>
            </p>

            {place.commentaire && (
              <div className="text-sm text-slate-600 border-t border-slate-50 pt-3 mt-3">
                <p className="leading-relaxed">
                  <span className="font-bold text-slate-800 mr-1 underline decoration-blue-200 underline-offset-4">Note :</span> 
                  {place.commentaire}
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>

      <footer className="mt-12 py-8 border-t border-slate-200">
        <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
          Propulsé par Leaflet & OpenStreetMap
        </p>
      </footer>
    </div>
  );
}
