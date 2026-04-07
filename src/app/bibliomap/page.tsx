"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface Establishment {
  name: string;
  address: string;
  type?: "library" | "centre_culturel" | "maison_quartier" | "mjc" | "conservatoire";
  lat?: number;
  lng?: number;
}

interface EnrichedEstablishment extends Establishment {
  coords?: [number, number];
  id: string; // Ajout d'un ID pour la gestion de l'accordéon
}

export default function BibliomapPage() {
  const [establishments, setEstablishments] = useState<EnrichedEstablishment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDetailsId, setOpenDetailsId] = useState<string | null>(null);
  
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const [filters, setFilters] = useState<Record<NonNullable<Establishment["type"]>, boolean>>({
    library: true,
    centre_culturel: true,
    maison_quartier: true,
    mjc: true,
    conservatoire: true,
  });

  const typeColors: Record<NonNullable<Establishment["type"]>, string> = {
    library: "#ef4444", 
    centre_culturel: "#3b82f6",
    maison_quartier: "#f97316",
    mjc: "#22c55e",
    conservatoire: "#a855f7",
  };

  const typeLabels: Record<NonNullable<Establishment["type"]>, string> = {
    library: "bibliothèque",
    centre_culturel: "centre culturel",
    maison_quartier: "maison de quartier",
    mjc: "MJC",
    conservatoire: "conservatoire",
  };

  const toggleDetails = (id: string) => {
    setOpenDetailsId((prev) => (prev === id ? null : id));
  };

  // 1. Chargement et Géocodage
  useEffect(() => {
    fetch("/api/bibliomap")
      .then((res) => res.json())
      .then(async (data: Establishment[]) => {
        const enriched = await Promise.all(
          data.map(async (est, idx) => {
            const id = `est-${idx}`;
            if (est.lat && est.lng) return { ...est, id, coords: [est.lat, est.lng] as [number, number] };
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(est.address + ", Toulouse")}`);
              const json = await res.json();
              if (json[0]) return { ...est, id, coords: [parseFloat(json[0].lat), parseFloat(json[0].lon)] as [number, number] };
            } catch (e) { console.error("Erreur géocodage", e); }
            return { ...est, id };
          })
        );
        setEstablishments(enriched as EnrichedEstablishment[]);
        setIsLoading(false);
      })
      .catch(console.error);
  }, []);

  // 2. Initialisation Carte
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current!).setView([43.6045, 1.444], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
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

  // 3. Mise à jour des marqueurs + Interaction
  useEffect(() => {
    if (!isMapReady || !mapInstance.current) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;
      
      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) mapInstance.current.removeLayer(layer);
      });

      const filtered = establishments.filter(est => filters[est.type ?? "library"]);

      filtered.forEach((est, i) => {
        if (!est.coords) return;
        const type = est.type ?? "library";
        const id = i + 1;
        
        const customIcon = L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color: ${typeColors[type]}; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">${id}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker(est.coords, { icon: customIcon })
          .bindPopup(`
            <div style="text-align: center; font-family: sans-serif;">
                <strong style="color: ${typeColors[type]}">${id}. ${est.name}</strong><br/>
                <a href="#est-item-${est.id}" style="display: inline-block; background-color: ${typeColors[type]}; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 10px; font-weight: bold; margin-top: 8px;">Voir infos ↓</a>
            </div>
          `)
          .addTo(mapInstance.current);

        marker.on('click', () => {
            toggleDetails(est.id);
            setTimeout(() => {
                document.getElementById(`est-item-${est.id}`)?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }, 100);
        });
      });
    };

    updateMarkers();
  }, [isMapReady, establishments, filters]);

  const toggleFilter = (type: NonNullable<Establishment["type"]>) => {
    setFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const filteredForList = establishments.filter(est => filters[est.type ?? "library"]);

  return (
    <div className="p-4 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-black mb-2 text-slate-900 tracking-tight leading-tight uppercase">
            📍 Culture & Loisirs à Toulouse
        </h1>
        <p className="text-slate-500 font-medium italic">Explorez les bibliothèques, MJC et centres culturels</p>
      </header>

      {/* FILTRES */}
      <div className="mb-8 flex flex-wrap gap-3 bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100">
        <span className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Filtrer par type :</span>
        {(Object.keys(filters) as Array<NonNullable<Establishment["type"]>>).map(type => (
          <button
            key={type}
            onClick={() => toggleFilter(type)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border-2 flex items-center gap-2 ${
                filters[type] 
                ? "bg-white shadow-md" 
                : "bg-slate-50 border-slate-100 text-slate-400 grayscale opacity-60"
            }`}
            style={{ 
                borderColor: filters[type] ? typeColors[type] : 'transparent',
                color: filters[type] ? typeColors[type] : ''
            }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: typeColors[type] }} />
            {typeLabels[type]}
          </button>
        ))}
      </div>

      {/* ZONE CARTE */}
      <div className="mb-12 h-[60vh] border-4 border-white rounded-[2.5rem] bg-slate-200 relative z-0 overflow-hidden shadow-2xl">
        <div ref={mapRef} className="h-full w-full" />
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/80 backdrop-blur-sm z-10">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
            <p className="text-blue-600 font-black text-xs uppercase tracking-widest">Cartographie en cours...</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-black mb-8 text-slate-800 flex items-center gap-3">
        <span className="h-1.5 w-12 bg-slate-900 rounded-full"></span>
        LISTE DES ÉTABLISSEMENTS ({filteredForList.length})
      </h2>

      {/* LISTE GRILLE */}
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredForList.map((est, i) => {
          const type = est.type ?? "library";
          const isOpen = openDetailsId === est.id;
          return (
            <li 
                key={est.id} 
                id={`est-item-${est.id}`}
                onClick={() => toggleDetails(est.id)}
                className={`p-6 border-2 rounded-3xl transition-all duration-300 cursor-pointer flex flex-col scroll-mt-24 ${
                    isOpen 
                    ? "bg-white shadow-xl scale-[1.02]" 
                    : "bg-white border-white shadow-sm hover:shadow-md"
                }`}
                style={{ borderColor: isOpen ? typeColors[type] : 'white' }}
            >
              <div className="flex justify-between items-start mb-3">
                <p className="text-lg font-bold text-slate-900 leading-tight pr-2">
                  <span className="text-slate-300 mr-1">{i + 1}.</span> {est.name}
                </p>
                <ChevronDown 
                    size={18} 
                    className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    style={{ color: isOpen ? typeColors[type] : '#cbd5e1' }}
                />
              </div>

              <div className="flex items-center gap-2">
                 <span className="text-[9px] px-2 py-1 rounded-lg font-black text-white uppercase tracking-tighter" style={{ backgroundColor: typeColors[type] }}>
                   {typeLabels[type]}
                 </span>
                 <p className="text-[11px] text-slate-400 font-bold uppercase truncate">📍 {est.address}</p>
              </div>

              {isOpen && (
                <div className="mt-4 pt-4 border-t border-slate-50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-4 rounded-2xl text-sm text-slate-600 leading-relaxed italic" style={{ backgroundColor: `${typeColors[type]}10` }}>
                        Cet établissement vous accueille pour vos activités culturelles et citoyennes dans le quartier de {est.address.split(',')[0]}.
                    </div>
                    <button className="mt-4 w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-opacity hover:opacity-90" style={{ backgroundColor: typeColors[type] }}>
                        Itinéraire
                    </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <footer className="mt-20 py-10 border-t border-slate-200 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em]">
            Culture Toulouse • 2026 • Services Publics
        </p>
      </footer>
    </div>
  );
}
