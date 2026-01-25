'use client';

import { useEffect, useState, useRef, CSSProperties } from 'react';
import { Musee } from '../api/museegers/route'; 
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// CENTRE DU GERS (Auch environ)
const GERS_CENTER: [number, number] = [43.64, 0.58];
const THEME_COLOR = '#b91c1c'; // Rouge Bordeaux/Vin pour le Gers

export default function MuseeGersPage() {
  const [musees, setMusees] = useState<Musee[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs pour Leaflet (Méthode OTAN)
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // 1. Fetch des données
  useEffect(() => {
    async function fetchMusees() {
      try {
        const response = await fetch('/api/museegers'); 
        if (!response.ok) throw new Error("Erreur lors de la récupération des données du Gers.");
        const data: Musee[] = await response.json();
        
        // Tri alphabétique par commune
        const sorted = data.sort((a, b) => a.commune.localeCompare(b.commune));
        setMusees(sorted);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchMusees();
  }, []);

  // 2. Initialisation de la carte Leaflet
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      
      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current).setView(GERS_CENTER, 9);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
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
  }, [isLoadingData]);

  // 3. Ajout des marqueurs numérotés
  useEffect(() => {
    if (!isReady || !mapInstance.current || musees.length === 0) return;

    const addMarkers = async () => {
      const L = (await import('leaflet')).default;

      musees.forEach((m, i) => {
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: ${THEME_COLOR};
              width: 28px; height: 28px;
              border-radius: 50%; border: 2px solid white;
              display: flex; align-items: center; justify-content: center;
              color: white; font-weight: bold; font-size: 11px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              ${i + 1}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const popupContent = `
          <div style="font-family: sans-serif; font-size: 14px;">
            <strong style="color:${THEME_COLOR}">${i + 1}. ${m.nom}</strong><br/>
            <b>Ville :</b> ${m.commune}<br/>
            <b>Type :</b> ${m.categorie}<br/>
            <a href="${m.url}" target="_blank" style="color:blue; text-decoration:underline; font-weight:bold;">Site officiel</a>
          </div>
        `;

        L.marker([m.lat, m.lng], { icon: customIcon })
          .bindPopup(popupContent)
          .addTo(mapInstance.current);
      });
    };

    addMarkers();
  }, [isReady, musees]);

  if (error) return <div className="p-10 text-red-600 font-bold text-center">Erreur : {error}</div>;

  return (
    <div className="p-4 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-red-700 hover:text-red-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 italic">🍷 Musées et Patrimoine du Gers (32)</h1>
        <div className="flex items-center gap-4 mt-2">
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
            {isLoadingData ? 'Chargement...' : `${musees.length} sites touristiques`}
          </span>
          <p className="text-slate-500 text-sm">Découvrez l'histoire et la culture de la Gascogne.</p>
        </div>
      </header>

      {/* ZONE CARTE */}
      <div style={{ height: "55vh", width: "100%" }} className="mb-10 border-4 border-white shadow-lg rounded-2xl bg-slate-200 relative z-0 overflow-hidden"> 
        <div ref={mapRef} className="h-full w-full" />
        {isLoadingData && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
            <p className="animate-bounce font-bold text-red-700">Chargement de la carte du Gers...</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b-2 border-red-700 inline-block pb-1">
        Liste Détaillée des Sites
      </h2>

      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
        <table className="w-full border-collapse text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th style={tableHeaderStyle}>N°</th>
              <th style={tableHeaderStyle}>Commune</th>
              <th style={tableHeaderStyle}>Nom du Site</th>
              <th style={tableHeaderStyle}>Catégorie</th>
              <th style={tableHeaderStyle}>Adresse</th>
              <th style={tableHeaderStyle}>Lien</th>
            </tr>
          </thead>
          <tbody>
            {musees.map((m, i) => (
              <tr key={i} className="border-b border-slate-100 hover:bg-red-50/50 transition-colors group">
                <td className="p-4 font-bold text-red-700">{i + 1}</td>
                <td className="p-4 font-semibold text-slate-700">{m.commune}</td>
                <td className="p-4 font-bold text-slate-900 group-hover:text-red-700 transition-colors">{m.nom}</td>
                <td className="p-4">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-600 uppercase">
                    {m.categorie}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-500 italic">{m.adresse}</td>
                <td className="p-4">
                  <a 
                    href={m.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-red-700 text-white text-xs font-bold hover:bg-red-800 transition-all shadow-sm"
                  >
                    Voir le site
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const tableHeaderStyle: CSSProperties = { 
  padding: '16px', 
  fontSize: '12px', 
  fontWeight: '800', 
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};