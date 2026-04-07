'use client';

import { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, Loader2, MapPin } from "lucide-react";

interface Colonie {
  grande_entite: string;
  territoire: string;
  periode: string;
  lat: number;
  lng: number;
  id?: string | number;
}

export default function ColonieFrancePage() {
  const [colonies, setColonies] = useState<Colonie[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Utilitaire pour créer des IDs d'ancres valides
  const slugify = (text: string) => 
    text.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

  // 1. Récupération et tri des données
  useEffect(() => {
    fetch("/api/coloniefrance")
      .then(async (res) => {
        const data = await res.json();
        if (Array.isArray(data)) {
          const sorted = data.sort((a, b) => {
            if (a.grande_entite !== b.grande_entite) {
              return a.grande_entite.localeCompare(b.grande_entite);
            }
            return a.territoire.localeCompare(b.territoire, 'fr');
          });
          setColonies(sorted);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // 2. Initialisation de Leaflet
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current!).setView([20, 0], 2);
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

  // 3. Mise à jour des Marqueurs avec ANCRES
  useEffect(() => {
    if (!isMapReady || !mapInstance.current || colonies.length === 0) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;

      // Nettoyage
      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) mapInstance.current.removeLayer(layer);
      });

      colonies.forEach((c, index) => {
        const customIcon = L.divIcon({
          className: "custom-marker",
          html: `<div style="background-color: #1e3a8a; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${index + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        // LIEN D'ANCRE VERS LE BAS DE LA PAGE
        const anchorId = `#territoire-${slugify(c.territoire)}`;

        L.marker([c.lat, c.lng], { icon: customIcon })
          .addTo(mapInstance.current)
          .bindPopup(`
            <div style="color: black; padding: 5px; min-width: 160px; font-family: sans-serif;">
              <strong style="font-size: 13px; display: block; margin-bottom: 2px;">${c.territoire}</strong>
              <span style="color: #b91c1c; font-size: 11px; font-weight: bold;">${c.periode}</span>
              <span style="color: #64748b; font-size: 9px; text-transform: uppercase; display: block; margin-bottom: 8px;">${c.grande_entite}</span>
              <a href="${anchorId}" 
                 style="display: block; background-color: #1e3a8a; color: white; text-align: center; padding: 6px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 10px; text-transform: uppercase;"
              >
                Détails historiques ↓
              </a>
            </div>
          `);
      });
    };
    updateMarkers();
  }, [isMapReady, colonies]);

  const entites = Array.from(new Set(colonies.map(c => c.grande_entite)));

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900 scroll-smooth">
      <style jsx global>{`
        html { scroll-behavior: smooth; }
        .custom-marker { background: none !important; border: none !important; }
      `}</style>

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group uppercase text-xs tracking-widest">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour
        </Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8">
        <h1 className="text-4xl md:text-6xl font-black text-blue-950 tracking-tighter uppercase italic">
          L'Empire <span className="text-blue-600">Colonial</span> Français
        </h1>
        <p className="text-slate-500 mt-2 font-bold uppercase text-xs tracking-[0.3em]">
          Cartographie historique et chronologie des territoires (1534 - 1980)
        </p>
      </header>

      {/* --- CARTE --- */}
      <div className="mb-12 border-4 border-white shadow-2xl rounded-[2.5rem] bg-slate-200 overflow-hidden h-[50vh] md:h-[65vh] relative z-0">
        <div ref={mapRef} className="h-full w-full" />
        
        {(loading || !isMapReady) && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100/90 backdrop-blur-md">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="font-black text-blue-900 text-xs uppercase tracking-widest animate-pulse">
              Déploiement des archives géographiques...
            </p>
          </div>
        )}
      </div>

      {/* --- LISTE DES TERRITOIRES --- */}
      <div className="space-y-16">
        {entites.map((entite) => (
          <section key={entite} className="relative">
            <h2 className="text-3xl font-black mb-8 text-blue-950 flex items-center gap-4 uppercase tracking-tighter italic">
              <span className="h-8 w-2 bg-blue-600 rounded-full"></span>
              {entite}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {colonies
                .filter(c => c.grande_entite === entite)
                .map((c) => {
                  const globalIndex = colonies.indexOf(c);
                  return (
                    <div 
                      key={`${c.territoire}-${globalIndex}`} 
                      id={`territoire-${slugify(c.territoire)}`} // ID POUR L'ANCRE
                      className="group p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-600 transition-all duration-300 flex flex-col scroll-mt-10"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-4xl font-black text-slate-100 group-hover:text-blue-50 transition-colors">
                          {(globalIndex + 1).toString().padStart(2, '0')}
                        </span>
                        <MapPin size={20} className="text-slate-200 group-hover:text-blue-600 transition-colors" />
                      </div>

                      <div>
                        <h3 className="font-black text-xl text-slate-900 group-hover:text-blue-700 transition-colors uppercase tracking-tight">
                          {c.territoire}
                        </h3>
                        <div className="inline-block px-3 py-1 bg-red-50 text-red-700 rounded-full text-[10px] font-black mt-2 uppercase tracking-wider">
                          {c.periode}
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Fiche archive</span>
                        <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                          →
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-24 py-12 border-t border-slate-200 text-center">
        <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.5em]">
          FTS Online Archive — Données Historiques 2026
        </p>
      </footer>
    </div>
  );
}
