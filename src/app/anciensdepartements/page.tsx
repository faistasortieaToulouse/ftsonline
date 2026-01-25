'use client';

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Departement {
  nom: string;
  pays: string;
  statut: string;
  lat: number;
  lng: number;
  description: string;
  date_debut: number;
  date_fin: number;
}

export default function AnciensDepartementsPage() {
  const [departements, setDepartements] = useState<Departement[]>([]);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // 1. Charger les données
  useEffect(() => {
    fetch("/api/anciensdepartements")
      .then(async (res) => {
        const data = await res.json();
        if (Array.isArray(data)) {
          const sorted = data.sort((a, b) => 
            a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' })
          );
          setDepartements(sorted);
        }
      })
      .catch(console.error);
  }, []);

  // 2. Initialisation manuelle de Leaflet (Comme pour l'OTAN)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      // Import dynamique de Leaflet
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (mapInstance.current) return; // Évite la double initialisation

      // Création de la map sur la div ref
      mapInstance.current = L.map(mapRef.current).setView([42.0, 12.0], 4);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      setIsReady(true);
    };

    initMap();

    // Nettoyage au démontage
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 3. Ajout des marqueurs quand la carte et les données sont prêtes
  useEffect(() => {
    if (!isReady || !mapInstance.current || departements.length === 0) return;

    const addMarkers = async () => {
      const L = (await import('leaflet')).default;

      departements.forEach((d, index) => {
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: #002395;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 2px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 10px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            ">
              ${index + 1}
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([d.lat, d.lng], { icon: customIcon });
        
        marker.bindPopup(`
          <div style="color: black; padding: 5px; font-family: sans-serif; max-width: 220px;">
            <strong style="font-size: 14px;">#${index + 1} - ${d.nom}</strong><br />
            <span style="color: #002395; font-size: 11px; font-weight: bold;">${d.pays.toUpperCase()}</span><br />
            <span style="color: #b91c1c; font-size: 10px; font-weight: bold;">${d.date_debut} — ${d.date_fin}</span><br />
            <p style="margin-top: 8px; font-size: 12px; line-height: 1.4; color: #333;">${d.description}</p>
          </div>
        `);

        marker.addTo(mapInstance.current);
      });
    };

    addMarkers();
  }, [isReady, departements]);

  return (
    <div className="p-4 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8 border-b pb-6 text-center">
        <h1 className="text-4xl font-black text-blue-900 uppercase tracking-tighter">
          Anciens Départements Français
        </h1>
        <p className="text-gray-600 mt-2 italic">Hors frontières actuelles : Europe Napoléonienne et Algérie Française</p>
      </header>

      {/* ZONE CARTE (DIV REF AU LIEU DE MAPCONTAINER) */}
      <div className="mb-8 border-4 border-white shadow-2xl rounded-3xl bg-slate-200 overflow-hidden relative" style={{ height: "60vh" }}>
        <div ref={mapRef} className="h-full w-full z-0" />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
            <p className="animate-pulse font-bold text-blue-900">Chargement de la carte historique...</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departements.map((d, index) => (
          <div key={`${d.nom}-${index}`} className="group p-5 bg-white rounded-2xl shadow-sm border border-slate-200 hover:bg-blue-900 transition-all duration-300 flex gap-4">
            <span className="text-3xl font-black text-slate-200 group-hover:text-blue-400/30 transition-colors">
              {(index + 1).toString().padStart(2, '0')}
            </span>
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-white transition-colors leading-tight">
                {d.nom}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 group-hover:bg-blue-800 group-hover:text-blue-100 transition-colors">
                  {d.pays}
                </span>
                <span className="text-xs font-bold text-red-600 group-hover:text-red-300">
                  {d.date_debut} — {d.date_fin}
                </span>
              </div>
              <p className="text-sm text-gray-600 group-hover:text-blue-50 mt-3 leading-snug">
                {d.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}