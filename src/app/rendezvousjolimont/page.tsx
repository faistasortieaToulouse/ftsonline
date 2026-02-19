'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Navigation, AlertCircle } from "lucide-react";
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

      // Correction icône Leaflet (obligatoire pour Next.js)
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      mapInstance.current = L.map(mapRef.current, {
        scrollWheelZoom: true
      }).setView(coords, 17); // Zoom un peu plus serré pour plus de précision

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(mapInstance.current);

      L.marker(coords)
        .addTo(mapInstance.current)
        .bindPopup(`<strong>${titre}</strong><br/>Sortie Haut (Sommet)`)
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
          <p className="text-slate-600 mt-1 italic font-medium">Sortie de station de métro Jolimont, 31500 Toulouse</p>
        </header>

        {/* BLOC ATTENTION - LES 4 SORTIES */}
        <div className="mb-8 bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-amber-900 text-lg">Attention !</h3>
              <p className="text-amber-800 leading-relaxed">
                Il y a 4 portes de sorties du métro à la station Jolimont (1 en bas, 1 en haut, 1 à gauche, 1 à droite). 
                <strong> Nous serons à celle en HAUT, au sommet du plateau (colline).</strong>
                <strong> Nous serons devant la porte de sortie de la station de métro Jolimont.</strong>
              </p>
              <p className="mt-3 text-amber-900 font-semibold underline">
                Repères : Il y a un parking et, juste en face, une agence France Travail.
              </p>
            </div>
          </div>
        </div>

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
          
          <div className="flex-1 bg-slate-100 p-4 rounded-xl flex flex-col justify-center">
            <h3 className="font-bold text-slate-800 text-sm uppercase mb-1 tracking-wider">Coordonnées GPS</h3>
            <p className="text-slate-600 font-mono text-xs">{coords[0]}, {coords[1]}</p>
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center text-slate-400 text-xs">
        Le rendez-vous est devant la porte de sortie du métro à la station Jolimont (Haut).
      </footer>
    </div>
  );
}
