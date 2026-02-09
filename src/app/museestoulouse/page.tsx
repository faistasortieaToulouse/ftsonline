'use client';

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

interface MuseePlace {
  id: number;
  nomLieu: string;
  catégorie: string;
  num: string;
  typeRue: string;
  nomRue: string;
  signification: string; 
  ville: string; 
  lat: number; 
  lng: number; 
}

type GroupedPlaces = Record<string, MuseePlace[]>;

export default function MuseesToulousePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);

  const [places, setPlaces] = useState<MuseePlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    fetch('/api/museestoulouse')
      .then(res => res.json())
      .then((data: MuseePlace[]) => {
        data.sort((a, b) => a.catégorie.localeCompare(b.catégorie));
        setPlaces(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoading || places.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current!).setView([43.6045, 1.444], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance.current);
        setIsMapReady(true);
      }

      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) mapInstance.current.removeLayer(layer);
      });

      places.forEach((place) => {
        if (!place.lat || !place.lng) return;

        const isBanlieue = place.ville !== 'Toulouse';
        // ✅ CHANGEMENT : Bleu (#3b82f6) pour la banlieue, Rouge pour Toulouse
        const markerColor = isBanlieue ? '#3b82f6' : '#ef4444'; 

        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="
            background-color: ${markerColor};
            width: 24px; height: 24px;
            border-radius: 50%; border: 2px solid white;
            display: flex; align-items: center; justify-content: center;
            color: white; font-weight: bold; font-size: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">${place.id}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const popupContent = `
          <div style="font-family: sans-serif;">
            <strong style="color: ${markerColor}">${place.id}. ${place.nomLieu}</strong><br/>
            ${place.num || ''} ${place.typeRue} ${place.nomRue}<br/>
            <em>${place.ville}</em><br/>
            <a href="${place.signification}" target="_blank" style="color:blue; font-weight:bold;">Site officiel</a>
          </div>
        `;

        L.marker([place.lat, place.lng], { icon: customIcon })
          .addTo(mapInstance.current)
          .bindPopup(popupContent);
      });
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isLoading, places]);

  const groupedPlaces: GroupedPlaces = places.reduce((acc, place) => {
    acc[place.catégorie] = acc[place.catégorie] || [];
    acc[place.catégorie].push(place);
    return acc;
  }, {} as GroupedPlaces);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-2 text-indigo-700">
        🏛️ Musées & sites d'exposition de Toulouse et sa banlieue ({places.length})
      </h1>

      <p className="mb-4 text-gray-600 font-semibold">
        <span className="text-red-600">🔴 Toulouse : {places.filter(p => p.ville === 'Toulouse').length}</span>
        <span className="mx-2">—</span>
        {/* ✅ CHANGEMENT : Indicateur Bleu pour la banlieue */}
        <span className="text-blue-600">🔵 Banlieue : {places.filter(p => p.ville !== 'Toulouse').length}</span>
      </p>

<div
  ref={mapRef}
  className="mb-8 border rounded-2xl bg-gray-100 shadow-inner overflow-hidden h-[40vh] md:h-[60vh] relative"
  style={{ zIndex: 0 }}
>
  {!isMapReady && (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 z-10">
      <Loader2 className="animate-spin h-8 w-8 text-indigo-600 mb-2" />
      <p className="text-slate-500 animate-pulse text-sm font-medium">Chargement de la carte…</p>
    </div>
  )}
</div>

      <div className="space-y-12">
        {Object.entries(groupedPlaces).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-indigo-400 text-slate-800">
              {category} ({items.length})
            </h2>

            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(place => (
                <li
                  key={place.id}
                  className={`p-4 bg-white rounded-lg shadow-sm border-2 transition-transform hover:scale-[1.02] ${
                    /* ✅ CHANGEMENT : Bordure Bleue pour la banlieue */
                    place.ville !== 'Toulouse' ? 'border-blue-500' : 'border-red-500'
                  }`}
                >
                  <p className="font-bold text-lg text-gray-900 leading-tight">
                    <span className={`mr-2 ${place.ville !== 'Toulouse' ? 'text-blue-600' : 'text-red-600'}`}>
                      {place.id}.
                    </span>
                    {place.nomLieu}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {place.num && place.num !== '0' ? place.num + ' ' : ''}
                    {place.typeRue} {place.nomRue}
                  </p>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-1">{place.ville}</p>
                  
                  {place.signification && (
                    <div className="mt-3">
                      <a
                        href={place.signification}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm font-bold hover:underline"
                      >
                        Voir le site officiel →
                      </a>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
