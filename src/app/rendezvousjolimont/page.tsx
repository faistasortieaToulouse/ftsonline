'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Navigation } from "lucide-react";
import 'leaflet/dist/leaflet.css';

export default function RdvJolimontPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  const coords: [number, number] = [43.614966, 1.462906];
  const titre = "Point de RDV : Jolimont";

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || mapInstance.current) return;
      const L = (await import('leaflet')).default;

      // Correction icône Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      mapInstance.current = L.map(mapRef.current, {
        scrollWheelZoom: true
      }).setView(coords, 16);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);

      // Ajout du marqueur unique
      L.marker(coords)
        .addTo(mapInstance.current)
        .bindPopup(`<strong>${titre}</strong><br/>Sortie métro Jolimont`)
        .openPopup();

      setIsReady(true);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto font-sans bg-slate-50 min-h-screen">
      <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 font-medium">
        <ArrowLeft size={18} /> Retour
      </Link>

      <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-2">
            <MapPin className="text-red-500" fill="currentColor" /> {titre}
          </h1>
          <p className="text-slate-600 mt-1">Sortie de station de métro Jolimont, 31500 Toulouse</p>
        </header>

        {/* CARTE */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-slate-100 shadow-inner">
          <div ref={mapRef} className="h-[400px] w-full z-0" />
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
              <p className="animate-pulse font-bold text-indigo-600">Chargement du plan...</p>
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <a 
            href={`https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            <Navigation size={20} />
            Y aller avec Google Maps
          </a>
          
          <div className="flex-1 bg-slate-100 p-4 rounded-xl">
            <h3 className="font-bold text-slate-800 text-sm uppercase mb-1">Coordonnées GPS</h3>
            <p className="text-slate-600 font-mono text-xs">{coords[0]}, {coords[1]}</p>
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center text-slate-400 text-xs">
        Pensez à arriver 5 à 10 minutes avant l'heure de départ prévue.
      </footer>
    </div>
  );
}
