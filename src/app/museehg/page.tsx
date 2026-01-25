'use client';

import { useEffect, useState, useRef, CSSProperties } from 'react';
import { MuseeHG as Musee } from '../api/museehg/route'; 
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// CENTRE DE LA HAUTE-GARONNE (Toulouse environ)
const HG_CENTER: [number, number] = [43.60, 1.44];
const THEME_COLOR = '#1d4ed8'; // Bleu pour la Haute-Garonne

export default function MuseeHGPage() {
  const [musees, setMusees] = useState<Musee[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs pour Leaflet (Méthode OTAN : On Traite Au Niveau client)
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // 1. Récupération des données
  useEffect(() => {
    async function fetchMusees() {
      try {
        const response = await fetch('/api/museehg'); 
        if (!response.ok) throw new Error("Erreur lors de la récupération des données HG.");
        const data: Musee[] = await response.json();
        
        // Tri par commune par défaut
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

  // 2. Initialisation Leaflet (Dynamique)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      
      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current).setView(HG_CENTER, 9);

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

  // 3. Marqueurs numérotés
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

  if (error) return <div className="p-10 text-red-600 font-bold">Erreur : {error}</div>;

  return (
    <div className="p-4 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">🏰 Musées de la Haute-Garonne (31)</h1>
        <div className="flex items-center gap-4 mt-2">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
            {isLoadingData ? 'Chargement...' : `${musees.length} lieux culturels`}
          </span>
          <p className="text-slate-500 text-sm">Explorez le patrimoine de la Ville Rose et du département.</p>
        </div>
      </header>

      {/* ZONE CARTE */}
      <div style={{ height: "55vh", width: "100%" }} className="mb-10 border-4 border-white shadow-xl rounded-2xl bg-slate-200 relative z-0 overflow-hidden shadow-blue-100"> 
        <div ref={mapRef} className="h-full w-full" />
        {isLoadingData && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
            <p className="animate-pulse font-bold text-blue-600 tracking-widest uppercase text-xs">Chargement Carte...</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
        <span className="w-8 h-1 bg-blue-600 rounded"></span>
        Liste Détaillée des Musées
      </h2>

      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
        <table className="w-full border-collapse text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th style={tableHeaderStyle}>N°</th>
              <th style={tableHeaderStyle}>Commune</th>
              <th style={tableHeaderStyle}>Nom du Musée</th>
              <th style={tableHeaderStyle}>Catégorie</th>
              <th style={tableHeaderStyle}>Adresse</th>
              <th style={tableHeaderStyle}>Lien</th>
            </tr>
          </thead>
          <tbody>
            {musees.map((m, i) => (
              <tr key={i} className="border-b border-slate-100 hover:bg-blue-50/50 transition-colors group">
                <td className="p-4 font-bold text-blue-600">{i + 1}</td>
                <td className="p-4 font-semibold text-slate-700">{m.commune}</td>
                <td className="p-4 font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{m.nom}</td>
                <td className="p-4">
                  <span className="text-[10px] font-black px-2 py-1 rounded-md bg-slate-100 text-slate-600 uppercase tracking-wider">
                    {m.categorie}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-500">{m.adresse}</td>
                <td className="p-4">
                  <a 
                    href={m.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-sm"
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