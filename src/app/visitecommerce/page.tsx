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
  lat?: number; // Requis pour Leaflet sans géocodage
  lng?: number; // Requis pour Leaflet sans géocodage
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

  // --- 2. Initialisation Leaflet (Méthode OTAN) ---
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
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: #007bff;
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
              ${i + 1}
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        L.marker([place.lat, place.lng], { icon: customIcon })
          .addTo(mapInstance.current!)
          .bindPopup(`
            <div style="font-family: sans-serif;">
              <strong>${i + 1}. ${place.nomLieu}</strong><br>
              <small>${place.num} ${place.typeRue} ${place.nomRue}</small><br>
              <p style="margin-top:5px; font-size:12px;">${place.établissement}</p>
            </div>
          `);
      }
    });
  }, [L, places]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-6">
        🛍️ Visite des Commerces et Lieux Historiques
      </h1>

      {/* Conteneur de la carte */}
      <div
        ref={mapRef}
        style={{ height: "60vh", width: "100%" }}
        className="mb-8 border rounded-xl bg-gray-100 flex items-center justify-center relative z-0 overflow-hidden shadow-md"
      >
        {loading && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-blue-600 font-medium">Chargement de la carte...</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
          {places.length}
        </span>
        Commerces répertoriés
      </h2>

      {/* Liste des lieux (Mise en page originale conservée) */}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {places.map((place, i) => (
          <li key={i} className="p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow border-slate-200">
            <div className="flex justify-between items-start mb-2">
              <p className="text-lg font-bold text-slate-900">
                <span className="inline-flex items-center justify-center bg-slate-900 text-white w-7 h-7 rounded-full text-xs mr-2">
                  {i + 1}
                </span>
                {place.nomLieu}
              </p>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded uppercase">
                {place.établissement}
              </span>
            </div>
            <p className="italic text-slate-500 text-sm mb-2">
              📍 {place.num && place.num !== "0" ? `${place.num} ` : ""}{place.typeRue} {place.nomRue} — {place.quartier}
            </p>
            {place.commentaire && (
              <p className="text-sm text-slate-600 border-t pt-2 mt-2">
                <span className="font-semibold text-slate-800">Note :</span> {place.commentaire}
              </p>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-8 text-center text-sm font-medium text-slate-400 uppercase tracking-widest">
        Propulsé par Leaflet & OpenStreetMap
      </p>
    </div>
  );
}