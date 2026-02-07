'use client';

import { useEffect, useState, useRef } from 'react';
import { Musee } from '../api/museeariege/route';
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

const ARIEGE_CENTER: [number, number] = [42.96, 1.60];
const THEME_COLOR = '#8b5cf6'; // Violet

export default function MuseeAriegePage() {
  const [musees, setMusees] = useState<Musee[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function fetchMusees() {
      try {
        const response = await fetch('/api/museeariege'); 
        if (!response.ok) throw new Error("Erreur lors de la récupération des données.");
        const data: Musee[] = await response.json();
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

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoadingData) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (mapInstance.current) return;
      mapInstance.current = L.map(mapRef.current!).setView(ARIEGE_CENTER, 9);
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

  useEffect(() => {
    if (!isReady || !mapInstance.current || musees.length === 0) return;

    const addMarkers = async () => {
      const L = (await import('leaflet')).default;

      musees.forEach((musee, i) => {
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="background-color: ${THEME_COLOR}; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
              ${i + 1}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        L.marker([musee.lat, musee.lng], { icon: customIcon })
          .bindPopup(`
            <div style="font-family: Arial; font-size: 14px; color: black;"> 
              <strong style="color:${THEME_COLOR};">${i + 1}. ${musee.nom}</strong><br/> 
              <b>Commune :</b> ${musee.commune}<br/>
              <a href="${musee.url}" target="_blank" style="color:blue; text-decoration:underline;">Visiter le site</a>
            </div>
          `)
          .addTo(mapInstance.current);
      });
    };

    addMarkers();
  }, [isReady, musees]);

  if (error) return <div className="p-10 text-red-500 text-center font-bold">Erreur : {error}</div>;

  return (
    <div className="p-4 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">⛰️ Musées et Patrimoine de l'Ariège (09)</h1>
        <p className="text-slate-600 mt-2 font-medium text-sm md:text-base">
          {isLoadingData ? 'Chargement des sites...' : `${musees.length} sites culturels et historiques répertoriés.`}
        </p>
      </header>

      {/* ZONE CARTE - Adaptative height */}
      <div className="mb-8 border rounded-2xl bg-gray-100 relative z-0 overflow-hidden shadow-md border-violet-100 h-[40vh] md:h-[60vh]"> 
        <div ref={mapRef} className="h-full w-full" />
        {isLoadingData && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
            <p className="animate-pulse font-bold text-violet-600">Initialisation de la carte...</p>
          </div>
        )}
      </div>

      <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-800">Liste des Sites</h2>

      {/* TABLEAU RESPONSIVE */}
      <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-bold text-slate-500 w-12 text-center">N°</th> 
                <th className="p-4 font-bold text-slate-700">Site / Commune</th>
                <th className="p-4 font-bold text-slate-700 hidden sm:table-cell">Catégorie</th>
                <th className="p-4 font-bold text-slate-700 hidden lg:table-cell text-center">Adresse</th>
                <th className="p-4 font-bold text-slate-700 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {musees.map((m, i) => (
                <tr key={i} className="hover:bg-violet-50/50 transition-colors">
                  <td className="p-4 text-center font-bold text-violet-400">{i + 1}</td> 
                  <td className="p-4">
                    <div className="font-bold text-slate-900 leading-tight">{m.nom}</div>
                    <div className="text-[11px] md:text-xs font-semibold text-violet-600 uppercase tracking-wide mt-1">
                      {m.commune}
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-500 uppercase">
                      {m.categorie}
                    </span>
                  </td>
                  <td className="p-4 hidden lg:table-cell text-slate-500 italic text-center text-xs">{m.adresse}</td>
                  <td className="p-4 text-center">
                    <a 
                      href={m.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                      title="Visiter le site"
                    >
                      <ExternalLink size={18} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}