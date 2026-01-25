'use client';

import { useEffect, useState, useRef, CSSProperties } from 'react';
import { Musee } from '../api/museeariege/route';
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// COORDONNÉES CENTRALES DE L'ARIÈGE
const ARIEGE_CENTER: [number, number] = [42.96, 1.60];
const THEME_COLOR = '#8b5cf6'; // Violet pour la culture/musées

export default function MuseeAriegePage() {
  const [musees, setMusees] = useState<Musee[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs pour la gestion Leaflet (Méthode OTAN)
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // 1. Charger les données API
  useEffect(() => {
    async function fetchMusees() {
      try {
        const response = await fetch('/api/museeariege'); 
        if (!response.ok) throw new Error("Erreur lors de la récupération des données.");
        const data: Musee[] = await response.json();
        // Tri par commune
        data.sort((a, b) => a.commune.localeCompare(b.commune));
        setMusees(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchMusees();
  }, []);

  // 2. Initialisation de la carte
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current).setView(ARIEGE_CENTER, 9);

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

      musees.forEach((musee, i) => {
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: ${THEME_COLOR};
              width: 28px; height: 28px;
              border-radius: 50%; border: 2px solid white;
              display: flex; align-items: center; justify-content: center;
              color: white; font-weight: bold; font-size: 12px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              ${i + 1}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([musee.lat, musee.lng], { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: Arial; font-size: 14px; color: black;"> 
            <strong style="color:${THEME_COLOR};">${i + 1}. ${musee.nom}</strong><br/> 
            <b>Commune :</b> ${musee.commune}<br/>
            <b>Catégorie :</b> ${musee.categorie}<br/>
            <a href="${musee.url}" target="_blank" style="color:blue; text-decoration:underline;">Visiter le site</a>
          </div>
        `);
        marker.addTo(mapInstance.current);
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
        <h1 className="text-3xl font-extrabold text-slate-900">⛰️ Musées et Patrimoine de l'Ariège (09)</h1>
        <p className="text-slate-600 mt-2 font-medium">
          {isLoadingData ? 'Chargement...' : `${musees.length} sites culturels et historiques répertoriés.`}
        </p>
      </header>

      {/* ZONE CARTE */}
      <div style={{ height: "60vh", width: "100%" }} className="mb-8 border rounded-xl bg-gray-100 relative z-0 overflow-hidden shadow-md border-violet-100"> 
        <div ref={mapRef} className="h-full w-full" />
        {isLoadingData && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <p className="animate-pulse font-bold text-violet-600">Initialisation de la carte...</p>
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
              <th style={tableHeaderStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {musees.map((m, i) => (
              <tr key={i} className="border-t hover:bg-violet-50 transition-colors">
                <td className="p-4 font-bold text-violet-600">{i + 1}</td> 
                <td className="p-4 font-semibold text-slate-700">{m.commune}</td>
                <td className="p-4 font-bold text-slate-900">{m.nom}</td>
                <td className="p-4">
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-200 text-slate-700 uppercase">
                        {m.categorie}
                    </span>
                </td>
                <td className="p-4 text-sm text-slate-600">{m.adresse}</td>
                <td className="p-4">
                  <a 
                    href={m.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                  >
                    Site web
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
    padding: '12px 16px', 
    fontSize: '14px', 
    fontWeight: 'bold', 
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.025em'
};