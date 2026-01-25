'use client';

import { useEffect, useState, useRef, CSSProperties } from 'react';
import { MuseeOccitanie as Musee } from '../api/museeoccitanie/route'; 
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// CENTRE DE L'OCCITANIE (Albi environ)
const OCCITANIE_CENTER: [number, number] = [43.8, 2.5];
const THEME_COLOR = '#e11d48'; // Rouge Occitanie

export default function MuseeOccitaniePage() {
  const [musees, setMusees] = useState<Musee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [sortKey, setSortKey] = useState<keyof Musee>('departement');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Refs pour Leaflet (Méthode OTAN)
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Récupération des données
  useEffect(() => {
    async function fetchMusees() {
      try {
        const response = await fetch('/api/museeoccitanie'); 
        if (!response.ok) throw new Error("Erreur lors de la récupération des données Occitanie.");
        const data: Musee[] = await response.json();
        setMusees(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inattendue");
      } finally {
        setIsLoading(false);
      }
    }
    fetchMusees();
  }, []);

  // 2. Initialisation Leaflet (Dynamique)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoading) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current).setView(OCCITANIE_CENTER, 8);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);

      markersLayer.current = L.layerGroup().addTo(mapInstance.current);
      setIsMapReady(true);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isLoading]);

  // 3. Mise à jour des marqueurs lors du tri
  useEffect(() => {
    if (!isMapReady || !mapInstance.current || musees.length === 0) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      markersLayer.current.clearLayers();

      musees.forEach((m, i) => {
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: ${THEME_COLOR};
              width: 24px; height: 24px;
              border-radius: 50%; border: 2px solid white;
              display: flex; align-items: center; justify-content: center;
              color: white; font-weight: bold; font-size: 10px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              ${i + 1}
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const popup = L.popup().setContent(`
          <div style="font-family: sans-serif; font-size: 13px;">
            <strong style="color:${THEME_COLOR}">${i + 1}. ${m.nom}</strong><br/>
            <b>${m.departement}</b> - ${m.commune}<br/>
            <a href="${m.url}" target="_blank" style="color:blue; font-weight:bold;">Site web</a>
          </div>
        `);

        L.marker([m.lat, m.lng], { icon: customIcon })
          .bindPopup(popup)
          .addTo(markersLayer.current);
      });
    };

    updateMarkers();
  }, [isMapReady, musees]);

  // Logique de tri
  const handleSort = (key: keyof Musee) => {
    const direction = key === sortKey && sortDirection === 'asc' ? 'desc' : 'asc';
    const sortedData = [...musees].sort((a, b) => {
      const aVal = (a[key] || '').toString().toLowerCase();
      const bVal = (b[key] || '').toString().toLowerCase();
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setMusees(sortedData);
    setSortKey(key);
    setSortDirection(direction);
  };

  const getSortIndicator = (key: keyof Musee) => {
    if (key !== sortKey) return ' ↕';
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  if (isLoading) return <div className="p-10 font-bold">Chargement de la Région Occitanie...</div>;
  if (error) return <div className="p-10 text-red-600 font-bold">Erreur : {error}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-rose-700 hover:text-rose-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">☀️ Musées et Patrimoine d'Occitanie</h1>
        <p className="font-bold text-rose-600 mt-2">
          Total : {musees.length} sites répertoriés sur 11 départements.
        </p>
      </header>

      {/* CARTE LEAFLET */}
      <div 
        ref={mapRef} 
        style={{ 
          height: '500px', 
          width: '100%', 
          borderRadius: '16px', 
          marginBottom: '40px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          zIndex: 0
        }} 
      />

      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="w-2 h-6 bg-rose-600 rounded"></span>
        Liste des sites (Triez en cliquant sur les titres)
      </h2>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f8fafc' }}>
            <tr>
              <th style={tableHeaderStyle}>#</th>
              <th style={tableHeaderStyle} onClick={() => handleSort('departement')}>
                Département {getSortIndicator('departement')}
              </th>
              <th style={tableHeaderStyle} onClick={() => handleSort('commune')}>
                Commune {getSortIndicator('commune')}
              </th>
              <th style={tableHeaderStyle} onClick={() => handleSort('nom')}>
                Nom du Site {getSortIndicator('nom')}
              </th>
              <th style={tableHeaderStyle} onClick={() => handleSort('categorie')}>
                Catégorie {getSortIndicator('categorie')}
              </th>
              <th style={{ ...tableHeaderStyle, cursor: 'default' }}>Adresse</th>
              <th style={{ ...tableHeaderStyle, cursor: 'default' }}>URL</th>
            </tr>
          </thead>
          <tbody>
            {musees.map((m, i) => (
              <tr key={i} className="hover:bg-rose-50/50 transition-colors border-b border-slate-100">
                <td style={{ ...tableCellStyle, fontWeight: 'bold', color: '#e11d48' }}>{i + 1}</td>
                <td style={tableCellStyle}>{m.departement}</td>
                <td style={tableCellStyle}>{m.commune}</td>
                <td style={{ ...tableCellStyle, fontWeight: 'bold' }}>{m.nom}</td>
                <td style={tableCellStyle}>
                  <span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-black uppercase text-slate-500">
                    {m.categorie}
                  </span>
                </td>
                <td style={{ ...tableCellStyle, fontSize: '13px', color: '#666' }}>{m.adresse}</td>
                <td style={tableCellStyle}>
                  <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-rose-600 font-bold underline text-sm">
                    Voir
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
  padding: '16px 12px', 
  borderBottom: '2px solid #e2e8f0', 
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: '800',
  textTransform: 'uppercase',
  letterSpacing: '0.025em',
  color: '#475569'
};

const tableCellStyle: CSSProperties = { 
  padding: '12px',
  fontSize: '14px'
};