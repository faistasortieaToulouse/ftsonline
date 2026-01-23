'use client';

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { ArrowLeft, Landmark, Phone, MapPin, Search } from "lucide-react";

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
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const [data, setData] = useState<Administration[]>([]);
  const [isReady, setIsReady] = useState(false);

  // État des filtres basé sur votre second code
  const [filters, setFilters] = useState<Record<Administration["categorie"], boolean>>({
    mairie: true,
    mairie_annexe: true,
    maison_justice: true,
    maison_toulouse_services: true,
    point_acces_droit: true,
  });

  // Couleurs de votre second code (format Hex pour Tailwind/Style)
  const colors: Record<Administration["categorie"], string> = {
    mairie: "#ef4444",              // Red
    mairie_annexe: "#f97316",       // Orange
    maison_justice: "#a855f7",      // Purple
    maison_toulouse_services: "#22c55e", // Green
    point_acces_droit: "#3b82f6",   // Blue
  };

  // Libellés exacts de votre second code
  const labels: Record<Administration["categorie"], string> = {
    mairie: "Mairie",
    mairie_annexe: "Mairie annexe",
    maison_justice: "Maison de Justice",
    maison_toulouse_services: "Maison Toulouse Services",
    point_acces_droit: "Point d’accès au droit",
  };

  // 1. Chargement des données
  useEffect(() => {
    fetch("/api/administration")
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  // 2. Gestion de la Carte Google Maps
  useEffect(() => {
    if (!isReady || !mapRef.current || data.length === 0) return;

    if (!mapInstance.current) {
      mapInstance.current = new google.maps.Map(mapRef.current, {
        zoom: 11,
        center: { lat: 43.6045, lng: 1.444 },
        styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }],
        gestureHandling: "greedy",
      });
    }

    // Nettoyage des marqueurs précédents
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // Filtrage des données pour la carte
    const filtered = data.filter(d => filters[d.categorie] && d.geo);

    filtered.forEach((item, i) => {
      if (!item.geo) return;

      const marker = new google.maps.Marker({
        map: mapInstance.current,
        position: { lat: item.geo.lat, lng: item.geo.lon },
        label: {
          text: `${i + 1}`,
          color: "white",
          fontSize: "12px",
          fontWeight: "bold"
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 11,
          fillColor: colors[item.categorie],
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      const infowindow = new google.maps.InfoWindow({
        content: `
          <div style="padding:8px; font-family: sans-serif; min-width:150px;">
            <strong style="display:block; margin-bottom:4px; color:#1e293b;">${item.nom}</strong>
            <span style="font-size:11px; color:#64748b;">${item.adresse ?? ""}</span><br/>
            <span style="display:inline-block; margin-top:6px; font-size:10px; font-weight:bold; color:${colors[item.categorie]}; text-transform:uppercase;">
              ${labels[item.categorie]}
            </span>
          </div>
        `,
      });

      marker.addListener("click", () => infowindow.open(mapInstance.current, marker));
      markersRef.current.push(marker);
    });

  }, [isReady, data, filters]);

  const toggle = (cat: Administration["categorie"]) => {
    setFilters(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const filteredList = data.filter(d => filters[d.categorie]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      {/* Barre de retour */}
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour au portail
        </Link>
      </nav>

      {/* Titre dynamique */}
      <header className="mb-8 border-l-4 border-slate-900 pl-6">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
          🏛️ Administrations et services publics <br/>
          <span className="text-slate-500 font-medium text-2xl tracking-tight">de Toulouse Métropole</span>
        </h1>
      </header>

      {/* Filtres Interactifs */}
      <div className="mb-8 flex flex-wrap gap-3">
        {(Object.keys(filters) as Array<Administration["categorie"]>).map(cat => (
          <button
            key={cat}
            onClick={() => toggle(cat)}
            className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border-2 transition-all font-bold text-sm shadow-sm ${
              filters[cat] 
                ? 'bg-white border-slate-800 text-slate-800' 
                : 'bg-slate-100 border-transparent text-slate-400 opacity-50'
            }`}
          >
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[cat] }}></span>
            {labels[cat]}
          </button>
        ))}
      </div>

      {/* Conteneur de Carte */}
      <div className="relative h-[55vh] w-full mb-12 border-4 border-white shadow-xl rounded-[2.5rem] bg-slate-200 overflow-hidden z-0">
        <div ref={mapRef} className="h-full w-full" />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10 font-bold text-slate-400">
            Chargement de la carte...
          </div>
        )}
      </div>

      {/* Liste des résultats avec numérotation correspondante */}
      <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
          <Search size={22} className="text-slate-400" />
          Liste complète ({filteredList.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredList.map((item, i) => (
          <div 
            key={i} 
            className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all"
          >
            <div className="flex items-start justify-between mb-5">
              <span 
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg"
                style={{ backgroundColor: colors[item.categorie] }}
              >
                {i + 1}
              </span>
              <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
                {labels[item.categorie]}
              </span>
            </div>

            <h3 className="font-extrabold text-slate-900 text-lg mb-4 min-h-[3rem] line-clamp-2 leading-tight">
              {item.nom}
            </h3>

            <div className="space-y-3">
              {item.adresse && (
                <div className="flex items-start gap-3 text-slate-500 text-sm">
                  <MapPin size={16} className="shrink-0 mt-0.5 text-slate-300" />
                  <span>{item.adresse} <br/> <span className="font-bold text-slate-400">{item.commune}</span></span>
                </div>
              )}
              {item.telephone && (
                <div className="flex items-center gap-3 text-sm pt-2 border-t border-slate-50">
                  <Phone size={16} className="shrink-0 text-slate-300" />
                  <a href={`tel:${item.telephone}`} className="font-bold text-blue-600 hover:text-blue-800 transition-colors">
                    {item.telephone}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
