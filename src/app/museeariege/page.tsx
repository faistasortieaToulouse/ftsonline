'use client';

import { useEffect, useState, useRef } from 'react';
import { Musee } from '../api/museeariege/route';
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

const ARIEGE_CENTER: [number, number] = [42.96, 1.60];
const THEME_COLOR = '#8b5cf6';

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
        if (!response.ok) throw new Error("Erreur réseau");
        const data: Musee[] = await response.json();
        data.sort((a, b) => a.commune.localeCompare(b.commune));
        setMusees(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
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
      musees.forEach((m, i) => {
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${THEME_COLOR}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">${i + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        L.marker([m.lat, m.lng], { icon: customIcon }).bindPopup(`<strong>${m.nom}</strong>`).addTo(mapInstance.current);
      });
    };
    addMarkers();
  }, [isReady, musees]);

  if (error) return <div className="p-10 text-red-500 text-center font-bold italic">Erreur : {error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 bg-slate-50 min-h-screen">
      <nav className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-violet-700 font-bold hover:underline">
          <ArrowLeft size={18} /> Retour
        </Link>
      </nav>

      <header className="mb-6">
        <h1 className="text-xl md:text-3xl font-extrabold text-slate-900 leading-tight">⛰️ Musées et Patrimoine de l'Ariège (09)</h1>
      </header>

      <div className="mb-8 border rounded-2xl bg-gray-100 h-[35vh] md:h-[50vh] relative z-0 overflow-hidden shadow-sm">
        <div ref={mapRef} className="h-full w-full" />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] md:text-sm text-slate-500 uppercase font-bold">
            <tr>
              <th className="p-4 w-12 text-center">N°</th>
              <th className="p-4 hidden md:table-cell">Commune</th>
              <th className="p-4">Type du Site</th>
              <th className="p-4 hidden sm:table-cell">Catégorie</th>
              <th className="p-4 hidden lg:table-cell">Adresse</th>
              <th className="p-4 w-16 text-center">LIEN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs md:text-sm">
            {musees.map((m, i) => (
              <tr key={i} className="hover:bg-violet-50/30 transition-colors">
                <td className="p-4 text-center font-bold text-violet-400">{i + 1}</td>
                
                {/* 1. Colonne Commune : Visible uniquement sur Tablettes/PC */}
                <td className="p-4 hidden md:table-cell font-semibold text-slate-700">
                  {m.commune}
                </td>

                {/* 2. Colonne Type du Site : Toujours visible */}
                <td className="p-4">
                  <div className="font-bold text-slate-900 leading-tight">{m.nom}</div>
                  {/* Sur Mobile (md:hidden), on affiche la commune ici juste en dessous du nom */}
                  <div className="text-[10px] text-violet-600 font-bold md:hidden mt-1 uppercase italic leading-none">
                    {m.commune}
                  </div>
                </td>

                {/* 3. Catégorie : Masquée sur tout petit mobile */}
                <td className="p-4 hidden sm:table-cell text-slate-500 font-medium">
                  {m.categorie}
                </td>

                {/* 4. Adresse : Visible uniquement sur grands écrans */}
                <td className="p-4 hidden lg:table-cell text-slate-500 italic">
                  {m.adresse}
                </td>

                {/* 5. Action : Toujours visible */}
                <td className="p-4 text-center">
                  <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 inline-block">
                    Web <ExternalLink size={18} />
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