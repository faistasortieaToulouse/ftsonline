'use client';

import { useEffect, useState, useRef, CSSProperties } from 'react';
import { Musee as MuseeAveyron } from '../api/museeaveyron/route'; 
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// CENTRE DE L'AVEYRON (Rodez environ)
const AVEYRON_CENTER: [number, number] = [44.35, 2.57];
const THEME_COLOR = '#4f46e5'; // Indigo/Bleu pour l'Aveyron

export default function MuseeAveyronPage() {
  const [musees, setMusees] = useState<MuseeAveyron[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs pour Leaflet (Méthode OTAN)
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // 1. Récupération des données
  useEffect(() => {
    async function fetchMusees() {
      try {
        const response = await fetch('/api/museeaveyron');
        if (!response.ok) throw new Error("Erreur lors de la récupération des données de l'Aveyron.");
        const data: MuseeAveyron[] = await response.json();
        
        // Tri par commune dès la réception
        const sorted = data.sort((a, b) => a.commune.localeCompare(b.commune));
        setMusees(sorted);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inattendue");
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchMusees();
  }, []);

  // 2. Initialisation Leaflet
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current).setView(AVEYRON_CENTER, 9);

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
          <div style="font-family: sans-serif; font-size: 14px; color: #1e293b;">
            <strong style="color:${THEME_COLOR}">${i + 1}. ${m.nom}</strong><br/>
            <b>Ville :</b> ${m.commune}<br/>
            <b>Type :</b> ${m.categorie}<br/>
            ${m.url ? `<a href="${m.url}" target="_blank" style="color:#4f46e5; text-decoration:underline; font-weight:bold;">Voir le site</a>` : ''}
          </div>
        `;

        L.marker([m.lat, m.lng], { icon: customIcon })
          .bindPopup(popupContent)
          .addTo(mapInstance.current);
      });
    };

    addMarkers();
  }, [isReady, musees]);

  if (error) return <div className="p-10 text-red-500 font-bold">Erreur : {error}</div>;

  return (
    <div className="p-4 max-w-7xl mx-auto bg-slate-50 min-h-screen font-sans">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">🐑 Musées et Patrimoine de l'Aveyron (12)</h1>
        <div className="flex items-center gap-4 mt-2">
          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
            {isLoadingData ? 'Chargement...' : `${musees.length} lieux référencés`}
          </span>
          <p className="text-slate-500 italic text-sm">Carte interactive du patrimoine aveyronnais.</p>
        </div>
      </header>

      {/* ZONE CARTE */}
      <div style={{ height: "55vh", width: "100%" }} className="mb-10 border-4 border-white shadow-xl rounded-2xl bg-slate-200 relative z-0 overflow-hidden"> 
        <div ref={mapRef} className="h-full w-full" />
        {isLoadingData && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="font-bold text-slate-600">Chargement de la carte...</p>
            </div>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
        <span className="w-8 h-1 bg-indigo-600 rounded"></span>
        Liste Détaillée des Sites
      </h2>

      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th style={tableHeaderStyle}>N°</th>
              <th style={tableHeaderStyle}>Commune</th>
              <th style={tableHeaderStyle}>Nom du Site / Musée</th>
              <th style={tableHeaderStyle}>Catégorie</th>
              <th style={tableHeaderStyle}>Adresse</th>
              <th style={tableHeaderStyle}>Lien</th>
            </tr>
          </thead>
          <tbody>
            {musees.map((m, i) => (
              <tr key={i} className="border-b border-slate-100 hover:bg-indigo-50/50 transition-colors group">
                <td className="p-4 font-bold text-indigo-600">{i + 1}</td>
                <td className="p-4 font-semibold text-slate-700">{m.commune}</td>
                <td className="p-4 font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{m.nom}</td>
                <td className="p-4">
                  <span className="text-[10px] font-black px-2 py-1 rounded-md bg-slate-100 text-slate-600 uppercase tracking-wider">
                    {m.categorie}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-500">{m.adresse}</td>
                <td className="p-4">
                  {m.url ? (
                    <a 
                      href={m.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center px-3 py-1 rounded bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-shadow shadow-sm"
                    >
                      Voir le site
                    </a>
                  ) : (
                    <span className="text-slate-300 text-xs italic">Non disponible</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Styles pour les en-têtes du tableau
const tableHeaderStyle: CSSProperties = { 
  padding: '16px', 
  fontSize: '12px', 
  fontWeight: '800', 
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};