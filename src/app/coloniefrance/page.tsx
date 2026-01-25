'use client';

import { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

interface Colonie {
  grande_entite: string;
  territoire: string;
  periode: string;
  lat: number;
  lng: number;
}

export default function ColonieFrancePage() {
  const [colonies, setColonies] = useState<Colonie[]>([]);
  const [loading, setLoading] = useState(true);

  // --- REFS pour la Méthode OTAN ---
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Récupération des données
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

  // 2. Initialisation MANUELLE de Leaflet
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      
      if (mapInstance.current) return;

      // Création de la carte (Centre monde par défaut)
      mapInstance.current = L.map(mapRef.current).setView([20, 0], 3);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      setIsMapReady(true);
    };

    initMap();

    // NETTOYAGE : Destruction de l'instance pour éviter le Runtime Error
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 3. Mise à jour des Marqueurs et du Centre
  useEffect(() => {
    if (!isMapReady || !mapInstance.current || colonies.length === 0) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;

      // Nettoyage des marqueurs existants
      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          mapInstance.current.removeLayer(layer);
        }
      });

      // Recalcul du centre et ajustement de la vue
      const avgLat = colonies.reduce((sum, c) => sum + c.lat, 0) / colonies.length;
      const avgLng = colonies.reduce((sum, c) => sum + c.lng, 0) / colonies.length;
      mapInstance.current.panTo([avgLat, avgLng]);

      // Ajout des nouveaux marqueurs
      colonies.forEach((c, index) => {
        const customIcon = L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color: #1e3a8a; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${index + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        L.marker([c.lat, c.lng], { icon: customIcon })
          .addTo(mapInstance.current)
          .bindPopup(`
            <div style="color: black; padding: 5px; min-width: 180px; font-family: sans-serif;">
              <strong style="font-size: 14px;">#${index + 1} - ${c.territoire}</strong><br />
              <span style="color: #b91c1c; font-size: 11px; font-weight: bold;">${c.periode}</span><br />
              <span style="color: #666; font-size: 10px; text-transform: uppercase;">${c.grande_entite}</span>
            </div>
          `);
      });
    };

    updateMarkers();
  }, [isMapReady, colonies]);

  const entites = Array.from(new Set(colonies.map(c => c.grande_entite)));

  return (
    <div className="p-4 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8 border-b pb-6">
        <h1 className="text-4xl font-black text-blue-900 flex items-center gap-3">
          ⚜️ Anciennes Colonies de la France
        </h1>
        <p className="text-gray-600 mt-2 italic">Chronologie et géographie du premier empire colonial</p>
      </header>

      {/* --- Zone de la Carte (Pilotée par Ref) --- */}
      <div className="mb-8 border-4 border-white shadow-xl rounded-3xl bg-slate-200 overflow-hidden h-[65vh] relative">
        <div ref={mapRef} className="h-full w-full z-0" />
        
        {(loading || !isMapReady) && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100/80 backdrop-blur-sm">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="font-bold text-blue-600 text-lg">Initialisation de la carte coloniale...</p>
          </div>
        )}
      </div>

      {/* --- Liste des Territoires --- */}
      <div className="space-y-12">
        {entites.map((entite) => (
          <section key={entite} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-black mb-6 text-blue-900 border-l-4 border-blue-600 pl-4">
              {entite}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {colonies
                .filter(c => c.grande_entite === entite)
                .map((c) => {
                  const globalIndex = colonies.indexOf(c);
                  return (
                    <div key={`${c.territoire}-${globalIndex}`} className="group p-4 bg-slate-50 rounded-xl hover:bg-blue-900 transition-all duration-300 flex gap-4">
                      <span className="text-3xl font-black text-slate-300 group-hover:text-blue-400/50 transition-colors">
                        {(globalIndex + 1).toString().padStart(2, '0')}
                      </span>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-white transition-colors">{c.territoire}</h3>
                        <div className="text-xs font-bold text-red-600 group-hover:text-red-300 mt-1">
                          {c.periode}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}