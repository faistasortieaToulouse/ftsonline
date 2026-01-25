'use client';

import { useEffect, useState, useRef, CSSProperties } from 'react';
import { MuseeAude } from '../museeaude/museeaude';
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// CENTRE DE L'AUDE (Carcassonne environ)
const AUDE_CENTER: [number, number] = [43.15, 2.35];
const THEME_COLOR = '#e11d48'; // Rouge/Rose pour l'identité visuelle de l'Aude

export default function MuseeAudePage() {
  const [musees, setMusees] = useState<MuseeAude[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs Leaflet (Méthode OTAN)
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // 1. Fetch des données
  useEffect(() => {
    async function fetchMusees() {
      try {
        const response = await fetch('/api/museeaude');
        if (!response.ok) throw new Error("Erreur lors de la récupération des données de l'Aude.");
        const data: MuseeAude[] = await response.json();
        // Tri par commune
        data.sort((a, b) => a.commune.localeCompare(b.commune));
        setMusees(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchMusees();
  }, []);

  // 2. Initialisation Carte
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current).setView(AUDE_CENTER, 9);

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

  // 3. Marqueurs
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
          <div style="font-family: Arial; font-size: 14px;">
            <strong style="color:${THEME_COLOR}">${i + 1}. ${m.nom}</strong><br/>
            <b>Ville :</b> ${m.commune}<br/>
            <b>Catégorie :</b> ${m.categorie}<br/>
            ${m.url ? `<a href="${m.url}" target="_blank" style="color:blue; text-decoration:underline;">Site web</a>` : '<i>Pas de site web</i>'}
          </div>
        `;

        L.marker([m.lat, m.lng], { icon: customIcon })
          .bindPopup(popupContent)
          .addTo(mapInstance.current);
      });
    };

    addMarkers();
  }, [isReady, musees]);

  if (error) return <div className="p-10 text-red-500">Erreur : {error}</div>;

  return (
    <div className="p-4 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">🗺️ Musées et Patrimoine de l'Aude (11)</h1>
        <p className="text-slate-600 mt-2">
          {isLoadingData ? 'Chargement des sites...' : `Total de lieux culturels : ${musees.length}`}
        </p>
      </header>

      {/* ZONE CARTE */}
      <div style={{ height: "55vh", width: "100%" }} className="mb-8 border rounded-xl bg-gray-100 relative z-0 overflow-hidden shadow-md border-rose-100"> 
        <div ref={mapRef} className="h-full w-full" />
        {isLoadingData && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <p className="animate-pulse font-bold text-rose-600">Chargement de la carte audoise...</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-4 text-slate-800">Liste Détaillée des Sites</h2>

      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full border-collapse bg-white text-left">
          <thead className="bg-slate-100">
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
              <tr key={i} className="border-t hover:bg-rose-50 transition-colors">
                <td className="p-4 font-bold text-rose-600">{i + 1}</td>
                <td className="p-4 font-semibold text-slate-700">{m.commune}</td>
                <td className="p-4 font-bold text-slate-900">{m.nom}</td>
                <td className="p-4">
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-200 text-slate-700 uppercase">
                    {m.categorie}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-600">{m.adresse}</td>
                <td className="p-4">
                  {m.url ? (
                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">
                      Visiter
                    </a>
                  ) : (
                    <span className="text-slate-300">N/A</span>
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

const tableHeaderStyle: CSSProperties = { 
  padding: '12px 16px', 
  fontSize: '13px', 
  fontWeight: 'bold', 
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.025em'
};