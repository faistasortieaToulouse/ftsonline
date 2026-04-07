'use client';

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, MapPin, Landmark, History } from "lucide-react";

interface Departement {
  nom: string;
  pays: string;
  statut: string;
  lat: number;
  lng: number;
  description: string;
  date_debut: number;
  date_fin: number;
  id?: string | number;
}

export default function AnciensDepartementsPage() {
  const [departements, setDepartements] = useState<Departement[]>([]);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // Utilitaire pour transformer le nom en ID d'ancre (ex: "Lippe" -> "dept-lippe")
  const slugify = (text: string) => 
    text.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

  // 1. Charger les données
  useEffect(() => {
    fetch("/api/anciensdepartements")
      .then(async (res) => {
        const data = await res.json();
        if (Array.isArray(data)) {
          const sorted = data.sort((a, b) => 
            a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' })
          );
          setDepartements(sorted);
        }
      })
      .catch(console.error);
  }, []);

  // 2. Initialisation manuelle de Leaflet
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current!).setView([42.0, 12.0], 4);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
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
  }, []);

  // 3. Ajout des marqueurs avec ANCRES INTERNES
  useEffect(() => {
    if (!isReady || !mapInstance.current || departements.length === 0) return;

    const addMarkers = async () => {
      const L = (await import('leaflet')).default;

      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) mapInstance.current.removeLayer(layer);
      });

      departements.forEach((d, index) => {
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color:#002395;width:24px;height:24px;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:10px;box-shadow:0 2px 5px rgba(0,0,0,0.3);">${index + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const anchorId = `#dept-${slugify(d.nom)}`;

        L.marker([d.lat, d.lng], { icon: customIcon })
          .addTo(mapInstance.current)
          .bindPopup(`
            <div style="color: black; padding: 5px; font-family: sans-serif; min-width: 180px;">
              <strong style="font-size: 14px; display: block; margin-bottom: 2px;">${d.nom}</strong>
              <span style="color: #002395; font-size: 10px; font-weight: bold; text-transform: uppercase;">${d.pays}</span><br />
              <span style="color: #b91c1c; font-size: 10px; font-weight: bold; display: block; margin-bottom: 8px;">${d.date_debut} — ${d.date_fin}</span>
              <a href="${anchorId}" 
                 style="display: block; background-color: #002395; color: white; text-align: center; padding: 6px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 10px; text-transform: uppercase;"
              >
                Explorer la fiche ↓
              </a>
            </div>
          `);
      });
    };

    addMarkers();
  }, [isReady, departements]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900 scroll-smooth">
      <style jsx global>{`
        html { scroll-behavior: smooth; }
        .custom-marker { background: none !important; border: none !important; }
      `}</style>

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-800 hover:text-blue-900 font-black uppercase text-[10px] tracking-widest transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour Accueil
        </Link>
      </nav>

      <header className="mb-10 text-center md:text-left">
        <h1 className="text-4xl md:text-6xl font-black text-blue-950 uppercase tracking-tighter italic">
          Anciens <span className="text-blue-700">Départements</span>
        </h1>
        <p className="text-slate-500 mt-2 font-bold uppercase text-xs tracking-[0.3em] flex items-center justify-center md:justify-start gap-2">
          <Landmark size={14} className="text-blue-600" /> Archives de l'Empire et de l'Outre-mer
        </p>
      </header>

      {/* ZONE CARTE */}
      <div className="mb-12 border-4 border-white shadow-2xl rounded-[2.5rem] bg-slate-200 overflow-hidden relative z-0 h-[50vh] md:h-[60vh]">
        <div ref={mapRef} className="h-full w-full" />
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/90 backdrop-blur-md z-10">
            <Loader2 className="animate-spin text-blue-800 mb-4" size={40} />
            <p className="font-black text-blue-900 text-xs uppercase tracking-widest">
                Reconstitution du cadastre historique...
            </p>
          </div>
        )}
      </div>

      {/* GRILLE DES DEPARTEMENTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {departements.map((d, index) => (
          <div 
            key={`${d.nom}-${index}`} 
            id={`dept-${slugify(d.nom)}`} // ID POUR L'ANCRE
            className="group p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-600 transition-all duration-500 flex flex-col scroll-mt-10"
          >
            <div className="flex justify-between items-start mb-6">
              <span className="text-5xl font-black text-slate-50 group-hover:text-blue-50 transition-colors">
                {(index + 1).toString().padStart(2, '0')}
              </span>
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-2">
                    {d.pays}
                </span>
                <div className="flex items-center gap-1 text-red-600 font-black text-xs italic">
                    <History size={14} /> {d.date_debut} — {d.date_fin}
                </div>
              </div>
            </div>

            <h3 className="font-black text-2xl text-blue-950 group-hover:text-blue-700 transition-colors uppercase tracking-tight mb-4">
              {d.nom}
            </h3>

            <p className="text-sm text-slate-600 group-hover:text-slate-800 leading-relaxed font-medium mb-6">
              {d.description}
            </p>

            <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <span className="flex items-center gap-2">
                    <MapPin size={12} className="text-blue-600" /> Coordonnées Insee
                </span>
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                    →
                </div>
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-24 py-12 border-t border-slate-200 text-center">
        <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.5em]">
          FTS Online — Fonds Documentaire Historique 2026
        </p>
      </footer>
    </div>
  );
}
