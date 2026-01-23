'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, Landmark, Search } from "lucide-react";

// 1. IMPORTATION DU CSS LEAFLET (Indispensable)
import "leaflet/dist/leaflet.css";

// 2. CHARGEMENT DYNAMIQUE (Pour éviter les erreurs Next.js/SSR)
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

interface Administration {
  nom: string;
  adresse?: string;
  commune?: string;
  telephone?: string;
  categorie:
    | "mairie"
    | "mairie_annexe"
    | "maison_justice"
    | "maison_toulouse_services"
    | "point_acces_droit";
  geo?: {
    lat: number;
    lon: number;
  };
}

export default function AdministrationPage() {
  const [data, setData] = useState<Administration[]>([]);
  const [L, setL] = useState<any>(null); // Instance Leaflet pour les icônes

  const [filters, setFilters] = useState<Record<Administration["categorie"], boolean>>({
    mairie: true,
    mairie_annexe: true,
    maison_justice: true,
    maison_toulouse_services: true,
    point_acces_droit: true,
  });

  const colors: Record<Administration["categorie"], string> = {
    mairie: "#ef4444",
    mairie_annexe: "#f97316",
    maison_justice: "#a855f7",
    maison_toulouse_services: "#22c55e",
    point_acces_droit: "#3b82f6",
  };

  const labels: Record<Administration["categorie"], string> = {
    mairie: "Mairie",
    mairie_annexe: "Mairie annexe",
    maison_justice: "Maison de Justice",
    maison_toulouse_services: "Maison Toulouse Services",
    point_acces_droit: "Point d’accès au droit",
  };

  useEffect(() => {
    fetch("/api/administration")
      .then(res => res.json())
      .then(setData)
      .catch(console.error);

    // Charger Leaflet uniquement côté client
    import("leaflet").then((leaflet) => {
      setL(leaflet);
    });
  }, []);

  const toggle = (cat: Administration["categorie"]) => {
    setFilters(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const filteredList = data.filter(d => filters[d.categorie]);

  // Création de l'icône personnalisée avec numéro
  const createIcon = (index: number, color: string) => {
    if (!L) return null;
    return L.divIcon({
      className: 'custom-icon',
      html: `<div style="background-color:${color}; width:24px; height:24px; border-radius:50%; border:2px solid white; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:11px; box-shadow:0 2px 4px rgba(0,0,0,0.3);">${index}</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-white min-h-screen text-slate-900">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour au portail
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3">
          <Landmark className="text-slate-800" size={32} />
          Administrations et services publics
        </h1>
        <p className="text-slate-500 text-xl mt-1">Toulouse Métropole</p>
      </header>

      {/* Filtres */}
      <div className="mb-8 flex flex-wrap gap-3">
        {(Object.keys(filters) as Array<Administration["categorie"]>).map(cat => (
          <button
            key={cat}
            onClick={() => toggle(cat)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all font-bold text-sm ${
              filters[cat] 
                ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                : 'bg-slate-100 border-transparent text-slate-400 opacity-60'
            }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[cat] }}></span>
            {labels[cat]}
          </button>
        ))}
      </div>

      {/* CARTE LEAFLET (Remplace Google Maps) */}
      <div className="h-[50vh] w-full mb-12 rounded-3xl bg-slate-100 overflow-hidden border shadow-inner z-0">
        <MapContainer 
          center={[43.6045, 1.444]} 
          zoom={12} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {L && filteredList.map((item, i) => (
            item.geo && (
              <Marker 
                key={`${item.nom}-${i}`}
                position={[item.geo.lat, item.geo.lon]}
                icon={createIcon(i + 1, colors[item.categorie])}
              >
                <Popup>
                  <div className="p-1">
                    <strong className="text-slate-900 block mb-1">{item.nom}</strong>
                    <span className="text-slate-600 text-xs">{item.adresse}</span>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>

      {/* Liste complète */}
      <div className="mb-8 border-b pb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
          <Search size={24} />
          Liste complète ({filteredList.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-8">
        {filteredList.map((item, i) => (
          <div key={i} className="text-[15px] leading-relaxed">
            <h3 className="font-bold text-base">
              {i + 1}. {item.categorie === 'mairie' ? item.nom.toUpperCase() : item.nom} 
              <span className="font-medium text-slate-500 ml-1">
                ({labels[item.categorie]})
              </span>
            </h3>

            {item.adresse && <p className="text-slate-700">{item.adresse}</p>}
            {item.commune && (
              <p className={`text-slate-700 ${item.categorie === 'mairie' ? 'uppercase' : ''}`}>
                {item.commune}
              </p>
            )}

            {item.telephone && (
              <p className="mt-1 flex items-center gap-1 font-medium">
                <span className="text-base">📞</span> {item.telephone}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
