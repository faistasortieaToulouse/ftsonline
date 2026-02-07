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
          html: `<div style="background-color: ${THEME_COLOR}; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${i + 1}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        L.marker([musee.lat, musee.lng], { icon: customIcon })
          .bindPopup(`<div style="font-family: Arial; font-size: 14px;"><strong>${i + 1}. ${musee.nom}</strong><br/><b>Commune :</b> ${musee.commune}</div>`)
          .addTo(mapInstance.current);
      });
    };
    addMarkers();
  }, [isReady, musees]);

  if (error) return <div className="p-10 text-red-500 text-center font-bold">Erreur : {error}</div>;

  return (
    <div className="p-2 md:p-4 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <nav className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour
        </Link>
      </nav>

      <header className="mb-6">
        <h1 className="text-xl md:text-3xl font-extrabold text-slate-900">⛰️ Musées de l'Ariège (09)</h1>
        <p className="text-slate-600 mt-1 text-sm font-medium">
          {isLoadingData ? 'Chargement...' : `${musees.length} sites répertoriés.`}
        </p>
      </header>

      <div className="mb-6 border rounded-xl bg-gray-100 relative z-0 overflow-hidden shadow-md h-[35vh] md:h-[60vh]"> 
        <div ref={mapRef} className="h-full w-full" />
      </div>

      <h2 className="text-lg md:text-2xl font-bold mb-4 text-slate-800">Liste Détaillée</h2>

      {/* CONTENEUR DU TABLEAU */}
      <div className="border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden">
        <div className="overflow-x-auto">
          {/* min-w-[600px] garantit que les colonnes gardent une taille décente sur mobile */}
          <table className="w-full text-left border-collapse text-xs md:text-sm min-w-[650px]">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3 w-10 text-center">N°</th> 
                <th className="p-3 w-28">Commune</th>
                <th className="p-3 w-40">Type du Site</th>
                <th className="p-3 w-32">Catégorie</th>
                <th className="p-3">Adresse</th>
                <th className="p-3 w-20 text-center">Lien</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {musees.map((m, i) => (
                <tr key={i} className="hover:bg-violet-50/50 transition-colors">
                  <td className="p-3 text-center font-bold text-violet-400">{i + 1}</td> 
                  <td className="p-3 font-semibold text-slate-700 break-words">{m.commune}</td>
                  <td className="p-3 font-bold text-slate-900 whitespace-normal leading-snug">{m.nom}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold text-[9px] uppercase">
                      {m.categorie}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 leading-tight whitespace-normal">{m.adresse}</td>
                  <td className="p-3 text-center">
                    <a 
                      href={m.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:text-blue-800 inline-flex items-center justify-center p-2 rounded-lg bg-blue-50"
                    >
                      Site web <ExternalLink size={16} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <p className="md:hidden text-center text-[10px] text-slate-400 mt-3 italic">
        Faites glisser le tableau vers la droite pour voir l'adresse et le lien.
      </p>
    </div>
  );
}