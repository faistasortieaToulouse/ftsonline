'use client';

import { useEffect, useRef, useState } from "react";
import 'leaflet/dist/leaflet.css';

interface Territoire {
  nom: string;
  statut: string;
  continent: string;
  lat: number;
  lng: number;
  description: string;
}

export default function FranceTerritoiresPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [territoires, setTerritoires] = useState<Territoire[]>([]);
  const [isReady, setIsReady] = useState(false);

  // --- 1. Charger et Trier les données ---
  useEffect(() => {
    fetch("/api/France")
      .then(async (res) => {
        const data = await res.json();
        if (Array.isArray(data)) {
          const ordreContinents = ["Europe", "Afrique", "Amérique", "Asie", "Antarctique", "Océanie"];
          const sorted = data.sort((a, b) => {
            if (a.continent !== b.continent) {
              return ordreContinents.indexOf(a.continent) - ordreContinents.indexOf(b.continent);
            }
            return a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' });
          });
          setTerritoires(sorted);
        }
      })
      .catch(console.error);
  }, []);

  // --- 2. Initialisation de Leaflet ---
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || mapInstance.current) return;
      const L = (await import('leaflet')).default;

      // Correction des icônes par défaut de Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      mapInstance.current = L.map(mapRef.current, {
        scrollWheelZoom: true,
        tap: true
      }).setView([20, 10], 2); // Vue mondiale centrée

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
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

  // --- 3. Ajout des Marqueurs ---
  useEffect(() => {
    if (!isReady || !mapInstance.current || territoires.length === 0) return;

    const addMarkers = async () => {
      const L = (await import('leaflet')).default;
      
      // Nettoyage des anciens marqueurs si nécessaire
      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) mapInstance.current.removeLayer(layer);
      });

      territoires.forEach((t, index) => {
        if (t.lat && t.lng) {
          const color = t.continent === "Europe" ? "#1e3a8a" : "#ef4444";
          
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color:${color}; color:white; border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; font-weight:bold; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3); font-size:9px;">${index + 1}</div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });

          const marker = L.marker([t.lat, t.lng], { icon: customIcon });
          
          marker.bindPopup(`
            <div style="color: black; font-family: sans-serif; min-width: 150px;">
              <strong style="font-size: 14px;">#${index + 1} - ${t.nom}</strong><br>
              <small style="color: #2563eb; font-weight: bold; text-transform: uppercase;">${t.statut}</small>
              <p style="font-size: 12px; margin-top: 5px; line-height: 1.4;">${t.description}</p>
            </div>
          `);

          marker.addTo(mapInstance.current);
        }
      });
    };

    addMarkers();
  }, [isReady, territoires]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      <header className="mb-8 border-b pb-6 text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-black text-blue-900 flex flex-wrap justify-center md:justify-start items-center gap-3">
          <span>🇫🇷</span> Territoires Français
        </h1>
        <p className="text-gray-600 mt-2 italic text-sm md:text-base">
          Exploration géographique des domaines de la République
        </p>
      </header>

      {/* --- Carte Responsive --- */}
      <div
        ref={mapRef}
        className="h-[50vh] md:h-[65vh] w-full mb-10 border-4 border-white shadow-2xl rounded-3xl bg-slate-200 overflow-hidden z-0"
      >
        {!isReady && (
          <div className="flex items-center justify-center h-full bg-slate-100">
            <p className="animate-pulse font-bold text-blue-600">Initialisation de la carte...</p>
          </div>
        )}
      </div>

      {/* --- Liste organisée par Continents --- */}
      <div className="space-y-12">
        {["Europe", "Afrique", "Amérique", "Asie", "Antarctique", "Océanie"].map((continent) => {
          const list = territoires.filter(t => t.continent === continent);
          if (list.length === 0) return null;

          return (
            <section key={continent} className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl md:text-2xl font-black mb-6 text-blue-900 flex items-center justify-between">
                <span>{continent}</span>
                <span className="text-xs font-normal bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                  {list.length} lieux
                </span>
              </h2>
              
              {/* Grille responsive : 1 col sur mobile, 2 sur tablette, 3 sur desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {list.map((t) => {
                  const globalIndex = territoires.indexOf(t);
                  return (
                    <div key={t.nom} className="group p-4 bg-slate-50 rounded-xl hover:bg-blue-900 transition-all duration-300 flex gap-4 border border-transparent hover:border-blue-700">
                      <span className="text-2xl font-black text-slate-300 group-hover:text-blue-400/50 transition-colors">
                        {(globalIndex + 1).toString().padStart(2, '0')}
                      </span>
                      <div className="overflow-hidden">
                        <h3 className="font-bold text-slate-900 group-hover:text-white transition-colors truncate">{t.nom}</h3>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 group-hover:text-blue-300 mt-1">
                          {t.statut}
                        </div>
                        <p className="text-sm text-gray-600 group-hover:text-blue-100 mt-2 leading-snug line-clamp-3">
                          {t.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
