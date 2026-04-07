'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, Landmark, Search, Loader2, Phone, MapPin, ExternalLink } from "lucide-react";

// 1. IMPORTATION DU CSS LEAFLET
import "leaflet/dist/leaflet.css";

// 2. CHARGEMENT DYNAMIQUE (SSR: false est crucial ici)
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const MapEffect = dynamic(() => Promise.resolve(({ map }: { map: any }) => {
    // Ce petit composant interne force le rafraîchissement de la carte
    useEffect(() => {
        if (map) {
            setTimeout(() => {
                map.invalidateSize();
            }, 500);
        }
    }, [map]);
    return null;
}), { ssr: false });

interface Administration {
  id: string; // Ajout d'un ID pour l'ancre
  nom: string;
  adresse?: string;
  commune?: string;
  telephone?: string;
  categorie: "mairie" | "mairie_annexe" | "maison_justice" | "maison_toulouse_services" | "point_acces_droit";
  geo?: { lat: number; lon: number; };
}

export default function AdministrationPage() {
  const [data, setData] = useState<Administration[]>([]);
  const [L, setL] = useState<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);

  const [filters, setFilters] = useState<Record<Administration["categorie"], boolean>>({
    mairie: true,
    mairie_annexe: true,
    maison_justice: true,
    maison_toulouse_services: true,
    point_acces_droit: true,
  });

  const colors: Record<Administration["categorie"], string> = {
    mairie: "#ef4444", mairie_annexe: "#f97316", maison_justice: "#a855f7",
    maison_toulouse_services: "#22c55e", point_acces_droit: "#3b82f6",
  };

  const labels: Record<Administration["categorie"], string> = {
    mairie: "Mairie", mairie_annexe: "Mairie annexe", maison_justice: "Maison de Justice",
    maison_toulouse_services: "Maison Toulouse Services", point_acces_droit: "Point d’accès au droit",
  };

  useEffect(() => {
    fetch("/api/administration")
      .then(res => res.json())
      .then(json => {
        // On ajoute un ID unique basé sur l'index pour les ancres
        const withIds = json.map((item: any, i: number) => ({ ...item, id: `admin-${i}` }));
        setData(withIds);
      })
      .catch(console.error);

    import("leaflet").then((leaflet) => { setL(leaflet); });
  }, []);

  const toggle = (cat: Administration["categorie"]) => {
    setFilters(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const filteredList = data.filter(d => filters[d.categorie]);

  const createIcon = (index: number, color: string) => {
    if (!L) return null;
    return L.divIcon({
      className: 'custom-icon',
      html: `<div style="background-color:${color}; width:26px; height:26px; border-radius:50%; border:2px solid white; color:white; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:10px; box-shadow:0 3px 6px rgba(0,0,0,0.2);">${index}</div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-all group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          RETOUR AU PORTAIL
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl md:text-5xl font-black flex items-center gap-4 tracking-tighter italic uppercase text-slate-900">
          <Landmark className="text-blue-700" size={40} />
          Services <span className="text-blue-700">Publics</span>
        </h1>
        <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-xs">Annuaire administratif • Toulouse Métropole</p>
      </header>

      {/* FILTRES STYLE BADGE */}
      <div className="mb-8 flex flex-wrap gap-2">
        {(Object.keys(filters) as Array<Administration["categorie"]>).map(cat => (
          <button
            key={cat}
            onClick={() => toggle(cat)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-wider ${
              filters[cat] 
                ? 'bg-white border-slate-900 text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]' 
                : 'bg-slate-100 border-transparent text-slate-400 opacity-50 grayscale'
            }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[cat] }}></span>
            {labels[cat]}
          </button>
        ))}
      </div>

      {/* CARTE AVEC FIX D'AFFICHAGE */}
      <div className="h-[55vh] w-full mb-12 rounded-[2rem] bg-slate-200 overflow-hidden border-4 border-white shadow-2xl relative z-0">
        {!isMapReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/90 z-10 backdrop-blur-sm">
            <Loader2 className="animate-spin h-10 w-10 text-blue-700 mb-4" />
            <p className="text-blue-900 font-black text-xs uppercase tracking-widest italic animate-pulse">Chargement de la carte métropolitaine...</p>
          </div>
        )}

        <MapContainer 
          center={[43.6045, 1.444]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          whenReady={(e: any) => {
            setMapInstance(e.target);
            setIsMapReady(true);
          }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Le fix est ici : MapEffect force le recalcul des tuiles */}
          {mapInstance && <MapEffect map={mapInstance} />}
          
          {L && filteredList.map((item, i) => (
            item.geo && (
              <Marker 
                key={`${item.nom}-${i}`}
                position={[item.geo.lat, item.geo.lon]}
                icon={createIcon(i + 1, colors[item.categorie])}
              >
                <Popup>
                  <div className="p-1 text-center font-sans">
                    <strong className="text-slate-900 block border-b pb-1 mb-2 uppercase text-[11px] tracking-tight">{item.nom}</strong>
                    <span className="text-slate-500 text-[10px] block mb-2 italic">{item.adresse}</span>
                    <a href={`#${item.id}`} className="bg-slate-900 text-white px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest no-underline inline-block">Détails ↓</a>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>

      <div className="mb-6 flex items-center justify-between border-b-4 border-slate-900 pb-2">
        <h2 className="text-2xl font-black flex items-center gap-2 text-slate-900 italic uppercase">
          <Search size={24} /> Résultats ({filteredList.length})
        </h2>
      </div>

      {/* LISTE STYLE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
        {filteredList.map((item, i) => (
          <div 
            key={i} 
            id={item.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all scroll-mt-24 group"
          >
            <div className="flex items-start justify-between mb-4">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-xs shadow-inner" style={{ backgroundColor: colors[item.categorie] }}>
                    {i + 1}
                </span>
                <span className="px-2 py-1 bg-slate-100 rounded text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                    {labels[item.categorie]}
                </span>
            </div>

            <h3 className="font-black text-lg text-slate-900 leading-tight mb-2 group-hover:text-blue-700 transition-colors uppercase tracking-tighter">
              {item.nom}
            </h3>

            <div className="space-y-2 text-sm">
                {item.adresse && (
                    <p className="text-slate-500 flex items-start gap-2 italic">
                        <MapPin size={14} className="text-slate-300 mt-1 flex-shrink-0" />
                        <span>{item.adresse}<br/>{item.commune}</span>
                    </p>
                )}
                {item.telephone && (
                    <a href={`tel:${item.telephone}`} className="inline-flex items-center gap-2 font-black text-blue-700 hover:text-blue-900 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg text-xs mt-2">
                        <Phone size={12} /> {item.telephone}
                    </a>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex justify-end">
                <button 
                  onClick={() => {
                    if(item.geo) {
                        mapInstance.setView([item.geo.lat, item.geo.lon], 16);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="text-[10px] font-black text-slate-400 hover:text-blue-600 flex items-center gap-1 uppercase tracking-widest transition-colors"
                >
                    Localiser sur la carte <ExternalLink size={10} />
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
