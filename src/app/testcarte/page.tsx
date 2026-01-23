'use client';

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { ArrowLeft, Landmark, Search } from "lucide-react";

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
  const markersRef = useRef<any[]>([]);

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
  }, []);

  useEffect(() => {
    if (!isReady || !mapRef.current || data.length === 0) return;

    const initMap = async () => {
      // Importation des bibliothèques nécessaires pour Advanced Markers
      const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
      const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

      if (!mapInstance.current) {
        mapInstance.current = new Map(mapRef.current!, {
          zoom: 11,
          center: { lat: 43.6045, lng: 1.444 },
          mapId: "DEMO_MAP_ID", // Requis pour AdvancedMarkerElement
          gestureHandling: "greedy",
          disableDefaultUI: false,
        });
      }

      // Nettoyage des marqueurs
      markersRef.current.forEach(m => m.map = null);
      markersRef.current = [];

      const filtered = data.filter(d => filters[d.categorie] && d.geo);

      filtered.forEach((item, i) => {
        if (!item.geo) return;

        // Création du visuel du marqueur (PinElement)
        const pin = new PinElement({
          glyph: `${i + 1}`,
          glyphColor: "white",
          background: colors[item.categorie],
          borderColor: "white",
        });

        const marker = new AdvancedMarkerElement({
          map: mapInstance.current,
          position: { lat: item.geo.lat, lng: item.geo.lon },
          content: pin.element,
          title: item.nom,
        });

        const infowindow = new google.maps.InfoWindow({
          content: `
            <div style="padding:5px; color:#333;">
              <b style="font-size:14px">${item.nom}</b><br/>
              <span style="font-size:12px">${item.adresse ?? ""}</span>
            </div>
          `,
        });

        marker.addListener("click", () => {
          infowindow.open(mapInstance.current, marker);
        });

        markersRef.current.push(marker);
      });
    };

    initMap();
  }, [isReady, data, filters]);

  const toggle = (cat: Administration["categorie"]) => {
    setFilters(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const filteredList = data.filter(d => filters[d.categorie]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-white min-h-screen text-slate-900">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=marker`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

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
                ? 'bg-slate-900 border-slate-900 text-white' 
                : 'bg-slate-100 border-transparent text-slate-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[cat] }}></span>
            {labels[cat]}
          </button>
        ))}
      </div>

      {/* Carte */}
      <div className="h-[50vh] w-full mb-12 rounded-3xl bg-slate-100 overflow-hidden border shadow-inner">
        <div ref={mapRef} className="h-full w-full" />
      </div>

      {/* Liste - Format exact demandé */}
      <div className="mb-8 border-b pb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
          <Search size={24} />
          Liste complète ({filteredList.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-8">
        {filteredList.map((item, i) => (
          <div key={i} className="text-[15px] leading-relaxed">
            {/* 1. NOM (Catégorie) */}
            <h3 className="font-bold text-base">
              {i + 1}. {item.categorie === 'mairie' ? item.nom.toUpperCase() : item.nom} 
              <span className="font-medium text-slate-500 ml-1">
                ({labels[item.categorie]})
              </span>
            </h3>

            {/* Adresse */}
            {item.adresse && <p className="text-slate-700">{item.adresse}</p>}
            
            {/* Commune (Majuscule si Mairie) */}
            {item.commune && (
              <p className={`text-slate-700 ${item.categorie === 'mairie' ? 'uppercase' : ''}`}>
                {item.commune}
              </p>
            )}

            {/* Téléphone */}
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
