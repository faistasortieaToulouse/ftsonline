'use client';

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

// --- Imports dynamiques pour éviter les erreurs SSR ---
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

interface Cinema {
  name: string;
  address: string;
  url: string;
  category: string;
  lat?: number;
  lng?: number;
}

export default function CinemasToulousePage() {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(true);
  const [L, setL] = useState<any>(null);

  // --- 1. Charger les données et l'objet Leaflet ---
  useEffect(() => {
    // Charger Leaflet pour les icônes personnalisées
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
    });

    fetch("/api/cinemastoulouse")
      .then(async (res) => {
        if (!res.ok) throw new Error("Erreur lors de la récupération");
        const data: Cinema[] = await res.json();
        const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
        
        // Géocodage des adresses (Nominatim)
        // Note: Dans un vrai projet, il vaut mieux stocker lat/lng en BDD
        const geocodeAll = async () => {
          const updated = await Promise.all(sortedData.map(async (cinema, i) => {
            try {
              // Petit délai pour respecter les limites de Nominatim
              await new Promise(resolve => setTimeout(resolve, i * 200)); 
              const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cinema.address + ", Toulouse")}`);
              const results = await response.json();
              if (results.length > 0) {
                return { ...cinema, lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
              }
            } catch (err) {
              console.error("Geocoding error", err);
            }
            return cinema;
          }));
          setCinemas(updated);
          setLoading(false);
        };

        geocodeAll();
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-4 max-w-7xl mx-auto min-h-screen bg-slate-50">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <header className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tight">
          🎬 Cinémas <span className="text-rose-600">Toulouse</span>
        </h1>
        <p className="text-slate-600 italic">Carte interactive des salles obscures de la ville rose.</p>
      </header>

      {/* --- Zone de la Carte Leaflet --- */}
      <div className="mb-10 border-4 border-white shadow-xl rounded-2xl bg-gray-200 overflow-hidden h-[60vh] relative">
        {loading && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-slate-100/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-rose-600" size={40} />
              <p className="font-bold text-slate-500">Géolocalisation des cinémas...</p>
            </div>
          </div>
        )}

        {L && (
          <MapContainer 
            center={[43.6045, 1.444]} 
            zoom={13} 
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {cinemas.map((cinema, i) => {
              if (!cinema.lat || !cinema.lng) return null;

              const customMarker = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: #e11d48; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${i + 1}</div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              });

              return (
                <Marker key={i} position={[cinema.lat, cinema.lng]} icon={customMarker}>
                  <Popup>
                    <div className="p-1">
                      <strong className="text-rose-600">{i + 1}. {cinema.name}</strong><br />
                      <p className="text-xs text-slate-600 my-1">{cinema.address}</p>
                      <span className="text-[10px] bg-slate-100 px-1 rounded font-bold uppercase">{cinema.category}</span>
                      <div className="mt-2">
                        <a href={cinema.url} target="_blank" className="text-xs font-bold text-blue-600 hover:underline">Voir le programme →</a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>

      {/* --- Liste des cinémas (Inchangée) --- */}
      <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
        <span className="bg-rose-600 text-white px-3 py-1 rounded-lg text-sm">{cinemas.length}</span>
        Salles répertoriées
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cinemas.map((cinema, i) => (
          <div 
            key={i} 
            className="group p-5 border border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-md hover:border-rose-200 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 text-white font-black">
                {i + 1}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-rose-50 text-rose-600 px-2 py-1 rounded">
                {cinema.category}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-rose-600 transition-colors">
              {cinema.name}
            </h3>
            <p className="text-sm text-slate-500 mb-6 italic flex items-center gap-1">
              📍 {cinema.address}
            </p>

            <a 
              href={cinema.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block w-full text-center py-2 rounded-xl bg-slate-100 text-slate-800 font-bold text-sm hover:bg-rose-600 hover:text-white transition-colors"
            >
              Programme officiel
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
