'use client';

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, Loader2, ExternalLink, MapPin, Building2 } from "lucide-react";

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
        const markerColor = isBanlieue ? '#3b82f6' : '#ef4444'; 

        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="
            background-color: ${markerColor};
            width: 26px; height: 26px;
            border-radius: 50%; border: 2px solid white;
            display: flex; align-items: center; justify-content: center;
            color: white; font-weight: 800; font-size: 10px;
            box-shadow: 0 3px 6px rgba(0,0,0,0.2);
          ">${place.id}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const popupContent = `
          <div style="font-family: sans-serif; padding: 4px; text-align: center;">
            <strong style="color: ${markerColor}; font-size: 13px;">${place.id}. ${place.nomLieu}</strong><br/>
            <span style="font-size: 11px; color: #64748b; display: block; margin: 4px 0;">${place.ville}</span>
            <a href="#place-${place.id}" style="display: inline-block; background: ${markerColor}; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 10px; font-weight: bold;">VOIR LA FICHE ↓</a>
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
    <div className="p-4 max-w-7xl mx-auto bg-slate-50 min-h-screen font-sans">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black mb-3 text-slate-900 leading-tight uppercase tracking-tighter italic">
          🏛️ Musées & Expos <span className="text-indigo-600">Toulouse Métropole</span>
        </h1>

        <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
           <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-sm font-bold text-slate-700">Toulouse : {places.filter(p => p.ville === 'Toulouse').length}</span>
           </div>
           <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-sm font-bold text-slate-700">Banlieue : {places.filter(p => p.ville !== 'Toulouse').length}</span>
           </div>
           <div className="ml-auto text-xs font-black text-slate-400 uppercase tracking-widest italic">
              {places.length} lieux au total
           </div>
        </div>
      </header>

      {/* CARTE */}
      <div
        ref={mapRef}
        className="mb-12 border-4 border-white rounded-[2.5rem] bg-slate-200 shadow-2xl overflow-hidden h-[45vh] md:h-[65vh] relative z-0"
      >
        {!isMapReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 z-10 backdrop-blur-sm">
            <Loader2 className="animate-spin h-10 w-10 text-indigo-600 mb-2" />
            <p className="text-indigo-600 font-black text-xs uppercase tracking-widest">Cartographie en cours...</p>
          </div>
        )}
      </div>

      <div className="space-y-16">
        {Object.entries(groupedPlaces).map(([category, items]) => (
          <section key={category} className="scroll-mt-10">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-4 text-slate-800">
              <span className="h-1.5 w-12 bg-indigo-600 rounded-full"></span>
              {category.toUpperCase()} <span className="text-indigo-300 ml-2 italic">({items.length})</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(place => {
                const isBanlieue = place.ville !== 'Toulouse';
                return (
                  <div
                    key={place.id}
                    id={`place-${place.id}`}
                    className={`group p-6 bg-white rounded-3xl shadow-sm border-t-8 transition-all hover:shadow-xl hover:-translate-y-1 scroll-mt-24 ${
                      isBanlieue ? 'border-blue-500' : 'border-red-500'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-3xl font-black opacity-20 group-hover:opacity-100 transition-opacity ${isBanlieue ? 'text-blue-500' : 'text-red-500'}`}>
                        {place.id}
                      </span>
                      <Building2 size={20} className="text-slate-300" />
                    </div>

                    <h3 className="font-black text-xl text-slate-900 leading-tight mb-2 min-h-[3.5rem]">
                      {place.nomLieu}
                    </h3>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-start gap-2 text-slate-500">
                        <MapPin size={16} className="mt-1 flex-shrink-0" />
                        <p className="text-sm font-medium leading-relaxed italic">
                          {place.num && place.num !== '0' ? place.num + ' ' : ''}
                          {place.typeRue} {place.nomRue}
                        </p>
                      </div>
                      <p className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit ${
                        isBanlieue ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {place.ville}
                      </p>
                    </div>
                    
                    {place.signification && (
                      <a
                        href={place.signification}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-between w-full p-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${
                          isBanlieue ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        Site Officiel
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <footer className="py-20 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em]">
            Ville Rose & Métropole • 2026 • Patrimoine Urbain
        </p>
      </footer>
    </div>
  );
}
