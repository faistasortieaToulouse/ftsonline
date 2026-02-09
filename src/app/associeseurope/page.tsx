'use client';

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

interface Territoire {
  nom: string;
  statut: string;
  continent: string;
  lat: number;
  lng: number;
  description: string;
}

export default function AssociesEuropePage() {
  const [territoires, setTerritoires] = useState<Territoire[]>([]);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // 1. Charger les données
  useEffect(() => {
    fetch("/api/associeseurope")
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

  // 2. Initialisation de la carte (Méthode OTAN robuste)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (mapInstance.current) return; // Sécurité anti-double-initialisation

      // Création de l'instance sur la div ref
      mapInstance.current = L.map(mapRef.current).setView([25, 10], 3);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      setIsReady(true);
    };

    initMap();

    // NETTOYAGE CRUCIAL au démontage
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 3. Ajout des marqueurs une fois la map et les données prêtes
  useEffect(() => {
    if (!isReady || !mapInstance.current || territoires.length === 0) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;

      territoires.forEach((t, index) => {
        const customIcon = L.divIcon({
          className: 'custom-icon',
          html: `
            <div style="
              background-color: #1e3a8a;
              color: white;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 2px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              font-weight: bold;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              ${index + 1}
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([t.lat, t.lng], { icon: customIcon });
        marker.bindPopup(`
          <div style="color: black; padding: 5px; font-family: sans-serif; max-width: 200px;">
            <strong style="font-size: 14px;">#${index + 1} - ${t.nom}</strong><br />
            <span style="color: #1e3a8a; fontSize: 10px; text-transform: uppercase; font-weight: bold;">${t.statut}</span>
            <p style="margin-top: 8px; font-size: 12px; line-height: 1.4;">${t.description}</p>
          </div>
        `);
        marker.addTo(mapInstance.current);
      });
    };

    updateMarkers();
  }, [isReady, territoires]);

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
          🇪🇺 États et Territoires Associés à l'UE
        </h1>
        <p className="text-gray-600 mt-2 italic">Analyse des statuts fiscaux et douaniers des dépendances européennes</p>
      </header>

      {/* ZONE CARTE (DIV REF) */}
      <div className="mb-8 border-4 border-white shadow-2xl rounded-3xl bg-slate-200 overflow-hidden relative" style={{ height: "60vh", width: "100%" }}>
        <div ref={mapRef} className="h-full w-full z-0" />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
             <p className="animate-pulse text-blue-900 font-bold">Initialisation de la carte...</p>
          </div>
        )}
      </div>

      <div className="space-y-12">
        {["Europe", "Afrique", "Amérique", "Asie", "Antarctique", "Océanie"].map((continent) => {
          const list = territoires.filter(t => t.continent === continent);
          if (list.length === 0) return null;

          return (
            <section key={continent} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black mb-6 text-blue-900 flex items-center justify-between border-l-4 border-blue-600 pl-4">
                <span>{continent}</span>
                <span className="text-sm font-normal bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{list.length} territoires</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {list.map((t) => {
                  const globalIndex = territoires.indexOf(t);
                  return (
                    <div key={t.nom} className="group p-4 bg-slate-50 rounded-xl hover:bg-blue-900 transition-all duration-300 flex gap-4 border border-slate-100 hover:border-blue-700">
                      <span className="text-3xl font-black text-slate-300 group-hover:text-blue-400/50 transition-colors">
                        {(globalIndex + 1).toString().padStart(2, '0')}
                      </span>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-white transition-colors">{t.nom}</h3>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 group-hover:text-blue-200 mt-1">
                          {t.statut}
                        </div>
                        <p className="text-sm text-gray-600 group-hover:text-blue-100 mt-2 leading-snug">
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
