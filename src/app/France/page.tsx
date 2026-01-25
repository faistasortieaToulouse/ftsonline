'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
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

  // --- 2. Initialisation de Leaflet (Méthode OTAN) ---
  useEffect(() => {
    // Empêche l'exécution côté serveur ou si les données ne sont pas là
    if (typeof window === "undefined" || !mapRef.current || territoires.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Anti-doublon pour le mode strict de React
      if (mapInstance.current) return;

      // Configuration des icônes par défaut
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, {
        scrollWheelZoom: true,
      }).setView([20, 10], 2);

      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      // --- 3. Ajout des Marqueurs ---
      territoires.forEach((t, index) => {
        if (t.lat && t.lng) {
          const color = t.continent === "Europe" ? "#1e3a8a" : "#ef4444";
          
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color:${color}; color:white; border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; font-weight:bold; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3); font-size:9px;">${index + 1}</div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });

          const marker = L.marker([t.lat, t.lng], { icon: customIcon }).addTo(map);

          marker.bindTooltip(`<strong>${t.nom}</strong>`, {
            direction: 'top',
            offset: [0, -10],
            opacity: 0.9
          });
          
          marker.bindPopup(`
            <div style="color: black; font-family: sans-serif; min-width: 150px; padding: 5px;">
              <strong style="font-size: 14px;">#${index + 1} - ${t.nom}</strong><br>
              <small style="color: #2563eb; font-weight: bold; text-transform: uppercase;">${t.statut}</small>
              <hr style="margin: 8px 0; border: 0; border-top: 1px solid #eee;">
              <p style="font-size: 11px; margin: 0; line-height: 1.4; color: #444;">${t.description}</p>
            </div>
          `);
        }
      });

      // RÉGLAGE CRITIQUE : Force le calcul de la taille après l'affichage du conteneur
      setTimeout(() => {
        map.invalidateSize();
        setIsReady(true);
      }, 250);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [territoires]); // Dépend de territoires pour s'assurer que les données sont là

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8 border-b pb-6 text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-black text-blue-900 flex flex-wrap justify-center md:justify-start items-center gap-3 uppercase tracking-tighter">
          <span>🇫🇷</span> Territoires Français
        </h1>
        <p className="text-gray-500 mt-2 italic font-medium">
          Exploration géographique des domaines de la République ({territoires.length} sites)
        </p>
      </header>

      {/* CONTENEUR CARTE */}
      <div className="relative h-[50vh] md:h-[65vh] w-full mb-10 border-4 border-white shadow-2xl rounded-3xl bg-slate-200 overflow-hidden z-0">
        <div ref={mapRef} className="h-full w-full" />
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/80 z-10">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
            <p className="font-bold text-blue-900 uppercase tracking-widest text-xs">Déploiement du globe...</p>
          </div>
        )}
      </div>

      <div className="space-y-12">
        {["Europe", "Afrique", "Amérique", "Asie", "Antarctique", "Océanie"].map((continent) => {
          const list = territoires.filter(t => t.continent === continent);
          if (list.length === 0) return null;

          return (
            <section key={continent} className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl md:text-2xl font-black mb-8 text-blue-900 flex items-center justify-between border-l-4 border-blue-600 pl-4">
                <span className="uppercase tracking-tight">{continent}</span>
                <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">
                  {list.length} {list.length > 1 ? 'lieux' : 'lieu'}
                </span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {list.map((t) => {
                  const globalIndex = territoires.indexOf(t);
                  return (
                    <div key={t.nom} className="group p-5 bg-slate-50 rounded-2xl hover:bg-blue-900 transition-all duration-300 flex gap-4 border border-transparent hover:border-blue-700 hover:shadow-xl hover:-translate-y-1">
                      <span className="text-2xl font-black text-slate-300 group-hover:text-blue-400 transition-colors">
                        {(globalIndex + 1).toString().padStart(2, '0')}
                      </span>
                      <div className="overflow-hidden">
                        <h3 className="font-bold text-slate-900 group-hover:text-white transition-colors truncate text-lg">{t.nom}</h3>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-blue-600 group-hover:text-blue-300 mt-1">
                          {t.statut}
                        </div>
                        <p className="text-sm text-gray-600 group-hover:text-blue-100 mt-3 leading-relaxed line-clamp-3">
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