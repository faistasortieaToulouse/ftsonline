'use client';

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface Cinema {
  name: string;
  address: string;
  url: string;
  category: string;
  lat: number;  // Maintenant obligatoires car présentes dans l'API
  lng: number;
}

export default function CinemasToulousePage() {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(true);
  
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Chargement Instantané (On ne géocode plus !)
  useEffect(() => {
    fetch("/api/cinemastoulouse")
      .then((res) => res.json())
      .then((data: Cinema[]) => {
        // On trie simplement par nom
        const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
        setCinemas(sortedData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur API:", err);
        setLoading(false);
      });
  }, []);

  // 2. Initialisation de la Carte (Méthode OTAN)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current).setView([43.6045, 1.444], 13);
      
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);

      setIsMapReady(true);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 3. Affichage des marqueurs
  useEffect(() => {
    if (!isMapReady || !mapInstance.current || cinemas.length === 0) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;

      // Nettoyage
      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) mapInstance.current.removeLayer(layer);
      });

      cinemas.forEach((cinema, i) => {
        // Utilisation directe des coordonnées de VOTRE API
        const markerIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: #e11d48; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${i + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        L.marker([cinema.lat, cinema.lng], { icon: markerIcon })
          .bindPopup(`
            <div style="font-family: sans-serif; min-width: 140px;">
              <strong style="color: #e11d48;">${cinema.name}</strong><br />
              <p style="font-size: 11px; margin: 5px 0;">${cinema.address}</p>
              <a href="${cinema.url}" target="_blank" style="color: #2563eb; font-size: 11px; font-weight: bold;">Programme →</a>
            </div>
          `)
          .addTo(mapInstance.current);
      });
    };

    updateMarkers();
  }, [isMapReady, cinemas]);

  return (
    <div className="p-4 max-w-7xl mx-auto min-h-screen bg-slate-50">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 font-bold">
          <ArrowLeft size={20} /> Retour
        </Link>
      </nav>
      
      <header className="mb-6">
        <h1 className="text-4xl font-black text-slate-900 uppercase">
          🎬 Cinémas <span className="text-rose-600">Toulouse</span>
        </h1>
      </header>

      {/* Carte */}
      <div className="mb-10 border-4 border-white shadow-xl rounded-2xl bg-gray-200 overflow-hidden h-[50vh] relative">
        <div ref={mapRef} className="h-full w-full" />
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
            <Loader2 className="animate-spin text-rose-600" size={40} />
          </div>
        )}
      </div>

      {/* Liste des cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cinemas.map((cinema, i) => (
          <div key={i} className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
               <span className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-900 text-white font-bold text-sm">{i + 1}</span>
               <span className="text-[10px] font-bold uppercase bg-rose-50 text-rose-600 px-2 py-1 rounded">{cinema.category}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{cinema.name}</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">📍 {cinema.address}</p>
            <a href={cinema.url} target="_blank" className="block text-center py-2 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs hover:bg-rose-600 hover:text-white transition-colors">Site du cinéma</a>
          </div>
        ))}
      </div>
    </div>
  );
}