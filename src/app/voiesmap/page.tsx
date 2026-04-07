'use client';

import { useEffect, useState, useMemo, useRef } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, MapPin, Search, Info } from "lucide-react";

interface Voie {
  id: number;
  libelle: string;
  libelle_occitan?: string | null;
  quartier: string;
  territoire: string;
  complement?: string | null;
  complement_occitan?: string | null;
  sti: number;
  wikipedia?: string | null;
  lat?: number; // Assurez-vous que votre API renvoie lat/lng
  lng?: number;
}

export default function VoiesPage() {
  const [voies, setVoies] = useState<Voie[]>([]);
  const [search, setSearch] = useState("");
  const [selectedVoie, setSelectedVoie] = useState<Voie | null>(null);
  
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // 1. Fetch Data
  useEffect(() => {
    fetch("/api/voiesmap")
      .then(res => res.json())
      .then(setVoies)
      .catch(console.error);
  }, []);

  // 2. Init Leaflet Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || mapInstance.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      
      mapInstance.current = L.map(mapRef.current!).setView([43.6045, 1.444], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 3. Focus sur une voie (Geocoding ou Coordonnées directes)
  useEffect(() => {
    if (!selectedVoie || !mapInstance.current) return;

    const updateMap = async () => {
      const L = (await import("leaflet")).default;
      
      // Si votre API ne donne pas lat/lng, on utilise un service gratuit de geocoding (Nominatim)
      const query = `${selectedVoie.libelle}, Toulouse, France`;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (data && data[0]) {
          const { lat, lon } = data[0];
          const coords: [number, number] = [parseFloat(lat), parseFloat(lon)];

          mapInstance.current.flyTo(coords, 16);

          if (markerRef.current) markerRef.current.remove();
          
          markerRef.current = L.marker(coords).addTo(mapInstance.current)
            .bindPopup(`<b>${selectedVoie.libelle}</b>`)
            .openPopup();
          
          mapRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      } catch (err) {
        console.error("Erreur Geocoding:", err);
      }
    };

    updateMap();
  }, [selectedVoie]);

  // Filtre et Stats
  const filteredVoies = useMemo(() =>
    voies.filter(v =>
      v.libelle.toLowerCase().includes(search.toLowerCase()) ||
      v.libelle_occitan?.toLowerCase().includes(search.toLowerCase()) ||
      v.quartier.toLowerCase().includes(search.toLowerCase())
    ), [search, voies]
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen font-sans text-slate-900">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour Accueil
        </Link>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">
          Nomenclature des <span className="text-blue-600">Voies</span>
        </h1>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Ville de Toulouse — Atlas Numérique</p>
      </header>

      {/* RECHERCHE */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher une rue, un quartier, un nom occitan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-xl focus:ring-2 focus:ring-blue-500 text-lg"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LISTE */}
        <div className="lg:col-span-1 h-[70vh] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
          {filteredVoies.map((v, i) => (
            <div
              key={v.id}
              onClick={() => setSelectedVoie(v)}
              className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${
                selectedVoie?.id === v.id ? "border-blue-600 bg-white shadow-lg" : "border-transparent bg-white shadow-sm hover:border-slate-200"
              }`}
            >
              <h3 className="font-black text-slate-800 leading-tight">
                <span className="text-blue-600 mr-2">{(i + 1).toString().padStart(2, '0')}</span>
                {v.libelle}
              </h3>
              {v.libelle_occitan && <p className="text-xs italic text-slate-500 mt-1">{v.libelle_occitan}</p>}
              <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <MapPin size={12} /> {v.quartier}
              </div>
            </div>
          ))}
        </div>

        {/* CARTE ET DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          <div ref={mapRef} className="h-[450px] w-full rounded-[2.5rem] shadow-2xl border-4 border-white bg-slate-200 overflow-hidden z-0" />
          
          {selectedVoie && (
            <div className="bg-blue-900 text-white p-8 rounded-[2.5rem] shadow-xl animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-black uppercase italic">{selectedVoie.libelle}</h2>
                <span className="text-blue-300 font-mono text-xs">STI: {selectedVoie.sti}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-800/50 p-4 rounded-xl">
                    <p className="text-[10px] uppercase font-bold text-blue-300 mb-1">Quartier</p>
                    <p className="text-sm font-bold">{selectedVoie.quartier}</p>
                </div>
                <div className="bg-blue-800/50 p-4 rounded-xl">
                    <p className="text-[10px] uppercase font-bold text-blue-300 mb-1">Territoire</p>
                    <p className="text-sm font-bold">{selectedVoie.territoire}</p>
                </div>
              </div>

              {selectedVoie.complement && (
                <div className="bg-white/10 p-6 rounded-xl">
                  <div className="flex items-center gap-2 mb-2 text-blue-200">
                    <Info size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">Origine du nom</span>
                  </div>
                  <p className="text-sm leading-relaxed">{selectedVoie.complement}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
