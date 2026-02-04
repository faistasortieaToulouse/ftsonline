'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Waves, MapPin, Navigation } from "lucide-react";
import 'leaflet/dist/leaflet.css';

interface Lac {
  nom: string;
  ville: string;
  departement: string;
  distance_toulouse: string;
  lat: number;
  lng: number;
  description: string;
}

export default function LacBaignadePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [data, setData] = useState<Record<string, Lac[]>>({});
  const [isReady, setIsReady] = useState(false);

  // 1. Chargement des données
  useEffect(() => {
    fetch("/api/lacbaignade")
      .then(async (res) => {
        const json = await res.json();
        setData(json);
      })
      .catch(console.error);
  }, []);

  // 2. Initialisation de la carte
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || mapInstance.current) return;
      const L = (await import('leaflet')).default;

      // Correction icônes par défaut
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      mapInstance.current = L.map(mapRef.current, {
        scrollWheelZoom: true,
      }).setView([43.6047, 1.4442], 9); // Centré sur Toulouse

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);

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

  // 3. Ajout des marqueurs quand la carte ET les données sont prêtes
  useEffect(() => {
    if (!isReady || !mapInstance.current || Object.keys(data).length === 0) return;

    const addMarkers = async () => {
      const L = (await import('leaflet')).default;
      const markersGroup = L.featureGroup();

      Object.entries(data).forEach(([dept, lacs]) => {
        lacs.forEach((lac) => {
          if (lac.lat && lac.lng) {
            const marker = L.marker([lac.lat, lac.lng]);
            
            marker.bindPopup(`
              <div style="font-family: sans-serif; min-width: 150px;">
                <strong style="font-size: 14px; color: #2563eb;">${lac.nom}</strong><br>
                <small>${lac.ville} (${lac.distance_toulouse})</small>
                <p style="font-size: 12px; margin-top: 5px;">${lac.description}</p>
              </div>
            `);
            marker.addTo(markersGroup);
          }
        });
      });
      
      markersGroup.addTo(mapInstance.current);
      // Ajuste la vue pour voir tous les marqueurs
      mapInstance.current.fitBounds(markersGroup.getBounds(), { padding: [30, 30] });
    };
    addMarkers();
  }, [isReady, data]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      
      <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour à l'accueil
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 flex items-center gap-3">
          <Waves className="text-blue-500" size={36} /> Lacs & Baignades
        </h1>
        <p className="text-gray-600 mt-2 italic">Les spots de fraîcheur autour de Toulouse</p>
      </header>

      {/* Container de la Carte */}
      <div
        ref={mapRef}
        className="h-[40vh] md:h-[50vh] w-full mb-12 border-4 border-white shadow-xl rounded-3xl bg-slate-100 overflow-hidden z-0"
      >
        {!isReady && (
          <div className="flex items-center justify-center h-full">
             <p className="animate-pulse font-bold text-blue-600 italic">Chargement des spots...</p>
          </div>
        )}
      </div>

      {/* Liste des Lacs par département */}
      {Object.entries(data).map(([departement, lacs]) => (
        <section key={departement} className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">{departement}</h2>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lacs.map((lac, i) => (
              <div key={i} className="group p-6 bg-white shadow-sm border border-slate-200 rounded-2xl hover:shadow-lg transition-all duration-300">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-blue-900 leading-snug">{lac.nom}</h3>
                </div>
                
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-4 uppercase font-bold tracking-widest">
                  <MapPin size={12} />
                  {lac.ville} • <span className="text-blue-600">{lac.distance_toulouse}</span>
                </div>

                <p className="text-sm text-gray-600 mb-6 line-clamp-3 italic leading-relaxed">
                  "{lac.description}"
                </p>

                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${lac.lat},${lac.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors group/btn"
                >
                  <Navigation size={14} className="group-hover/btn:animate-pulse" />
                  Itinéraire
                </a>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
