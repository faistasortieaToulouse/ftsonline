'use client';

import { useEffect, useState, useRef } from 'react';
import { Musee } from '../api/museeariege/route';
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ChevronDown, ChevronUp, MapPin, Tag } from "lucide-react";

const ARIEGE_CENTER: [number, number] = [42.96, 1.60];
const THEME_COLOR = '#8b5cf6';

export default function MuseeAriegePage() {
  const [musees, setMusees] = useState<Musee[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

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

  const toggleRow = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
        <table className="w-full text-left border-separate border-spacing-0">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] md:text-sm text-slate-500 uppercase font-bold">
            <tr>
              <th className="p-4 w-12 text-center">N°</th>
              <th className="p-4 hidden md:table-cell">Commune</th>
              <th className="p-4">Type du Site</th>
              <th className="p-4 hidden md:table-cell">Catégorie</th>
              <th className="p-4 hidden lg:table-cell">Adresse</th>
              <th className="p-4 w-24 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs md:text-sm font-medium">
            {musees.map((m, i) => (
              <React.Fragment key={i}>
                <tr 
                  onClick={() => toggleRow(i)}
                  className={`cursor-pointer transition-colors ${expandedId === i ? 'bg-violet-50/50' : 'hover:bg-slate-50'}`}
                >
                  <td className="p-4 text-center font-bold text-violet-400">{i + 1}</td>
                  
                  <td className="p-4 hidden md:table-cell text-slate-700">
                    {m.commune}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-slate-900 leading-tight">{m.nom}</div>
                      <div className="md:hidden">
                        {expandedId === i ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                      </div>
                    </div>
                    <div className="text-[10px] text-violet-600 font-bold md:hidden mt-1 uppercase italic">
                      {m.commune}
                    </div>
                  </td>

                  <td className="p-4 hidden md:table-cell text-slate-500">
                    {m.categorie}
                  </td>

                  <td className="p-4 hidden lg:table-cell text-slate-500 italic">
                    {m.adresse}
                  </td>

                  <td className="p-4 text-center">
                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:scale-110 transition-transform inline-block p-1" onClick={(e) => e.stopPropagation()}>
                      <ExternalLink size={18} />
                    </a>
                  </td>
                </tr>

                {/* ZONE DÉPLIABLE (Visible uniquement sur mobile quand la ligne est cliquée) */}
                {expandedId === i && (
                  <tr className="bg-violet-50/30 md:hidden">
                    <td colSpan={3} className="p-4 pt-0">
                      <div className="flex flex-col gap-2 py-3 border-t border-violet-100">
                        <div className="flex items-start gap-2 text-slate-600">
                          <Tag size={14} className="mt-0.5 text-violet-400" />
                          <span><strong className="text-slate-700">Catégorie :</strong> {m.categorie}</span>
                        </div>
                        <div className="flex items-start gap-2 text-slate-600">
                          <MapPin size={14} className="mt-0.5 text-violet-400" />
                          <span><strong className="text-slate-700">Adresse :</strong> {m.adresse}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}