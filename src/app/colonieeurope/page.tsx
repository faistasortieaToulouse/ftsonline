'use client';

import { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

interface Territoire {
  nom: string;
  statut: string;
  continent: string;
  lat: number;
  lng: number;
  description: string;
  date_debut: number;
  date_fin: number;
}

export default function ColonieEuropePage() {
  const [territoires, setTerritoires] = useState<Territoire[]>([]);
  const [loading, setLoading] = useState(true);

  // --- REFS pour la Méthode OTAN ---
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Fetch des données
  useEffect(() => {
    fetch("/api/colonieeurope")
      .then(async (res) => {
        const data = await res.json();
        if (Array.isArray(data)) {
          const sorted = data.sort((a, b) => 
            a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' })
          );
          setTerritoires(sorted);
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
      
      // Empêche la double initialisation
      if (mapInstance.current) return;

      // On crée la carte sur la div via mapRef
      mapInstance.current = L.map(mapRef.current).setView([47.5, 7.5], 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      setIsMapReady(true);
    };

    initMap();

    // NETTOYAGE : C'est ici qu'on règle l'erreur Runtime
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 3. Mise à jour des Marqueurs
  useEffect(() => {
    if (!isMapReady || !mapInstance.current || territoires.length === 0) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;

      // On vide les anciens marqueurs
      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          mapInstance.current.removeLayer(layer);
        }
      });

      // On ajoute les nouveaux
      territoires.forEach((t, index) => {
        const customIcon = L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color: #1e3a8a; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${index + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        L.marker([t.lat, t.lng], { icon: customIcon })
          .addTo(mapInstance.current)
          .bindPopup(`
            <div style="color: black; font-family: sans-serif; min-width: 180px;">
              <strong style="font-size: 14px;">#${index + 1} - ${t.nom}</strong><br />
              <span style="color: #b91c1c; font-size: 10px; font-weight: bold;">${t.date_debut} — ${t.date_fin}</span><br />
              <span style="color: #666; font-size: 10px; text-transform: uppercase; font-weight: bold;">${t.statut}</span>
              <p style="margin-top: 8px; font-size: 12px; line-height: 1.4; margin-bottom: 0;">${t.description}</p>
            </div>
          `);
      });
    };

    updateMarkers();
  }, [isMapReady, territoires]);

  return (
    <div className="p-4 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold">
          <ArrowLeft size={20} /> Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8 border-b pb-6 text-center">
        <h1 className="text-4xl font-black text-blue-900 uppercase tracking-tighter">
          Empire Français : Territoires Annexés
        </h1>
        <p className="text-gray-600 mt-2 italic">L'Europe sous Napoléon Ier et la Révolution (1792 - 1815)</p>
      </header>

      {/* --- Zone de la Carte (Pilotée par Ref) --- */}
      <div className="mb-8 border-4 border-white shadow-2xl rounded-3xl bg-slate-200 overflow-hidden h-[60vh] relative">
        <div ref={mapRef} className="h-full w-full z-0" />
        
        {(loading || !isMapReady) && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100/80 backdrop-blur-sm">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
            <p className="font-bold text-blue-600">Chargement de la carte impériale...</p>
          </div>
        )}
      </div>

      {/* --- Grille des Territoires --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {territoires.map((t, index) => (
          <div key={t.nom} className="group p-5 bg-white rounded-2xl shadow-sm border border-slate-200 hover:bg-blue-900 transition-all duration-300 flex gap-4">
            <span className="text-3xl font-black text-slate-200 group-hover:text-blue-400/30 transition-colors">
              {(index + 1).toString().padStart(2, '0')}
            </span>
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-white transition-colors">{t.nom}</h3>
              <div className="text-xs font-bold text-red-600 group-hover:text-red-300 mt-1">{t.date_debut} — {t.date_fin}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 group-hover:text-blue-200 mt-1">{t.statut}</div>
              <p className="text-sm text-gray-600 group-hover:text-blue-50 mt-3 leading-snug">{t.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}