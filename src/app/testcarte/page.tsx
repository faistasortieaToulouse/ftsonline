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

  const [filters, setFilters] = useState<Record<Administration["categorie"], boolean>>({
    mairie: true,
    mairie_annexe: true,
    maison_justice: true,
    maison_toulouse_services: true,
    point_acces_droit: true,
  });

  const colors: Record<Administration["categorie"], string> = {
    mairie: "#ef4444", // Red
    mairie_annexe: "#f97316", // Orange
    maison_justice: "#a855f7", // Purple
    maison_toulouse_services: "#22c55e", // Green
    point_acces_droit: "#3b82f6", // Blue
  };

  const labels: Record<Administration["categorie"], string> = {
    mairie: "Mairie",
    mairie_annexe: "Mairie annexe",
    maison_justice: "Maison de Justice",
    maison_toulouse_services: "Toulouse Services",
    point_acces_droit: "Accès au droit",
  };

  // 1. Fetch data
  useEffect(() => {
    fetch("/api/administration")
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  // 2. Map Management
  useEffect(() => {
    if (!isReady || !mapRef.current || data.length === 0) return;

    // Initialisation de la carte si elle n'existe pas
    if (!mapInstance.current) {
      mapInstance.current = new google.maps.Map(mapRef.current, {
        zoom: 12,
        center: { lat: 43.6045, lng: 1.444 },
        styles: [ { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] } ],
        gestureHandling: "greedy",
      });
    }

    // Nettoyage des anciens marqueurs
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

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
          scale: 12,
          fillColor: colors[item.categorie],
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      const infowindow = new google.maps.InfoWindow({
        content: `
          <div style="padding:10px; font-family: sans-serif;">
            <strong style="color:#1e293b; font-size:14px;">${item.nom}</strong><br/>
            <p style="margin:5px 0; color:#64748b; font-size:12px;">${item.adresse ?? ""}</p>
            <span style="color:${colors[item.categorie]}; font-weight:bold; font-size:10px; text-transform:uppercase;">
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

      {/* Navigation */}
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour au portail
        </Link>
      </nav>

      {/* Header */}
      <header className="mb-8 border-b-2 border-slate-200 pb-6">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 flex items-center gap-4">
          <Landmark size={40} className="text-slate-800" />
          Services Publics
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Localisation des administrations de Toulouse Métropole</p>
      </header>

      {/* Filtres Stylisés */}
      <div className="mb-8 flex flex-wrap gap-3">
        {(Object.keys(filters) as Array<Administration["categorie"]>).map(cat => (
          <button
            key={cat}
            onClick={() => toggle(cat)}
            className={`flex items-center gap-3 px-4 py-2 rounded-full border-2 transition-all font-bold text-sm shadow-sm ${
              filters[cat] 
                ? 'bg-white border-slate-800 text-slate-800' 
                : 'bg-slate-100 border-transparent text-slate-400 opacity-60'
            }`}
          >
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[cat] }}></span>
            {labels[cat]}
          </button>
        ))}
      </div>

      {/* Carte Premium */}
      <div className="relative h-[50vh] md:h-[60vh] w-full mb-10 border-4 border-white shadow-2xl rounded-3xl bg-slate-200 overflow-hidden z-0">
        <div ref={mapRef} className="h-full w-full" />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10 font-bold text-slate-400 italic">
            Initialisation de Google Maps...
          </div>
        )}
      </div>

      {/* Liste des administrations */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Search size={24} />
          Résultats ({filteredList.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredList.map((item, i) => (
          <div 
            key={i} 
            className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-slate-300 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <span 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0"
                style={{ backgroundColor: colors[item.categorie] }}
              >
                {i + 1}
              </span>
              <span 
                className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-slate-50 text-slate-500 border border-slate-100"
              >
                {labels[item.categorie]}
              </span>
            </div>

            <h3 className="font-bold text-slate-900 text-lg leading-tight mb-4 group-hover:text-blue-600 transition-colors">
              {item.nom}
            </h3>

            <div className="space-y-2">
              {item.adresse && (
                <div className="flex items-start gap-2 text-slate-600 text-sm italic">
                  <MapPin size={16} className="shrink-0 mt-0.5" />
                  <span>{item.adresse}, {item.commune}</span>
                </div>
              )}
              {item.telephone && (
                <div className="flex items-center gap-2 text-slate-800 text-sm font-bold">
                  <Phone size={16} className="shrink-0 text-slate-400" />
                  <a href={`tel:${item.telephone}`} className="hover:underline text-blue-600">
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
