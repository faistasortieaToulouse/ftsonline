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

  useEffect(() => {
    fetch("/api/lacbaignade")
      .then(async (res) => {
        const json = await res.json();
        setData(json);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || mapInstance.current) return;
      const L = (await import('leaflet')).default;

      mapInstance.current = L.map(mapRef.current, {
        scrollWheelZoom: true,
      }).setView([43.6047, 1.4442], 9);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
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

  // Ajout des marqueurs numérotés
  useEffect(() => {
    if (!isReady || !mapInstance.current || Object.keys(data).length === 0) return;

    const addMarkers = async () => {
      const L = (await import('leaflet')).default;
      const markersGroup = L.featureGroup();
      let globalCounter = 1; // Compteur pour la numérotation

      Object.entries(data).forEach(([dept, lacs]) => {
        lacs.forEach((lac) => {
          if (lac.lat && lac.lng) {
            // Création d'une icône personnalisée avec le numéro
            const numberIcon = L.divIcon({
              className: 'custom-number-marker',
              html: `<div style="
                background-color: #2563eb; 
                color: white; 
                border-radius: 50%; 
                width: 28px; 
                height: 28px; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                font-weight: bold; 
                border: 2px solid white; 
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                font-size: 12px;">${globalCounter}</div>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            });

            const marker = L.marker([lac.lat, lac.lng], { icon: numberIcon });
            
            marker.bindPopup(`
              <div style="font-family: sans-serif;">
                <strong style="color: #2563eb;">#${globalCounter} - ${lac.nom}</strong><br>
                <small>${lac.ville}</small>
              </div>
            `);
            marker.addTo(markersGroup);
            globalCounter++;
          }
        });
      });
      
      markersGroup.addTo(mapInstance.current);
      mapInstance.current.fitBounds(markersGroup.getBounds(), { padding: [50, 50] });
    };
    addMarkers();
  }, [isReady, data]);

  // Pour l'affichage de la liste, on utilise une variable externe pour suivre le numéro
  let displayCounter = 1;

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
        <p className="text-gray-600 mt-2 italic">Numérotés pour vous repérer sur la carte</p>
      </header>

      <div
        ref={mapRef}
        className="h-[45vh] md:h-[55vh] w-full mb-12 border-4 border-white shadow-xl rounded-3xl bg-slate-100 overflow-hidden z-0"
      />

      {Object.entries(data).map(([departement, lacs]) => (
        <section key={departement} className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">{departement}</h2>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lacs.map((lac, i) => {
              const currentNum = displayCounter++;
              return (
                <div key={i} className="group p-6 bg-white shadow-sm border border-slate-200 rounded-2xl hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                  {/* Badge de numéro */}
                  <div className="absolute top-0 right-0 bg-blue-600 text-white font-black px-4 py-2 rounded-bl-2xl">
                    #{currentNum}
                  </div>

                  <div className="pr-10">
                    <h3 className="text-lg font-bold text-blue-900 leading-snug mb-2">{lac.nom}</h3>
                    
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-4 uppercase font-bold tracking-widest">
                      <MapPin size={12} />
                      {lac.ville} • <span className="text-blue-600">{lac.distance_toulouse}</span>
                    </div>

                    <p className="text-sm text-gray-600 mb-6 line-clamp-3 italic">
                      "{lac.description}"
                    </p>

                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${lac.lat},${lac.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors"
                    >
                      <Navigation size={14} /> Itinéraire
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
