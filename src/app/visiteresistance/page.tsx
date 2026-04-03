"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface ResistancePlace {
  nom: string;
  num: string;
  type_rue: string;
  nom_rue: string;
  appartient: string;
  site: string;
  quartier: string;
  etablissement: string;
  sigles: string;
  signification: string;
  lat?: number;
  lng?: number;
}

const TOULOUSE_CENTER: [number, number] = [43.6045, 1.444];

export default function VisiteResistancePage() {
  // ----------------------------------------------------
  // 1. ÉTATS ET RÉFÉRENCES
  // ----------------------------------------------------
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [places, setPlaces] = useState<ResistancePlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [L, setL] = useState<any>(null);
  const [openDetailsId, setOpenDetailsId] = useState<number | null>(null);

  const toggleDetails = (id: number) => {
    setOpenDetailsId((prevId) => (prevId === id ? null : id));
  };

  // ----------------------------------------------------
  // 2. CHARGEMENT DES DONNÉES
  // ----------------------------------------------------
  useEffect(() => {
    fetch("/api/visiteresistance")
      .then((res) => res.json())
      .then((data: ResistancePlace[]) => {
        setPlaces(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  // ----------------------------------------------------
  // 3. INITIALISATION LEAFLET
  // ----------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || loading) return;

    const initMap = async () => {
      const Leaflet = (await import("leaflet")).default;
      setL(Leaflet);

      if (mapInstance.current) return;

      mapInstance.current = Leaflet.map(mapRef.current!).setView(TOULOUSE_CENTER, 14);

      Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapInstance.current);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [loading]);

  // ----------------------------------------------------
  // 4. MARQUEURS
  // ----------------------------------------------------
  useEffect(() => {
    if (!L || !mapInstance.current || places.length === 0) return;

    places.forEach((place, i) => {
      if (place.lat === undefined || place.lng === undefined) return;

      const id = i + 1;
      const color = place.appartient.toLowerCase() === "résistance" ? "#16a34a" : "#dc2626";

      const customIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            background-color: ${color};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 2px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 11px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ">
            ${id}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([place.lat, place.lng], { icon: customIcon })
        .addTo(mapInstance.current!)
        .bindPopup(`
          <div style="text-align: center; font-family: sans-serif; min-width: 140px;">
            <strong style="color: ${color}; font-size: 13px;">${id}. ${place.nom}</strong><br/>
            <p style="font-size: 10px; margin: 4px 0; color: #64748b;">${place.appartient}</p>
            <a href="#place-item-${id}" style="display: inline-block; background-color: #334155; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 10px; font-weight: bold; margin-top: 4px;">Détails ↓</a>
          </div>
        `);

      marker.on("click", () => {
        toggleDetails(id);
        mapInstance.current.setView([place.lat, place.lng], 16, { animate: true });
      });
    });
  }, [L, places]);

  return (
    <div className="p-4 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-black mb-2 text-slate-900 tracking-tight">
          🏛️ Toulouse : Lieux de la Résistance
        </h1>
        <p className="text-slate-500 font-medium">Parcours historique et mémoriel — ({places.length} Lieux)</p>
      </header>

      {/* Carte */}
      <div
        ref={mapRef}
        className="mb-10 h-[60vh] border-4 border-white rounded-[2.5rem] bg-slate-200 relative z-0 overflow-hidden shadow-2xl"
      >
        {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/60 backdrop-blur-sm">
                <div className="w-10 h-10 border-4 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-600 font-bold text-xs uppercase tracking-widest">Chargement des données...</p>
            </div>
        )}
      </div>

      <h2 className="text-2xl font-black mb-6 text-slate-800 flex items-center gap-3">
        <span className="h-1.5 w-12 bg-slate-800 rounded-full"></span>
        CHRONOLOGIE DES LIEUX
      </h2>

      {/* Liste des lieux */}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {places.map((place, i) => {
          const id = i + 1;
          const isDetailsOpen = openDetailsId === id;
          const isResistance = place.appartient.toLowerCase() === "résistance";

          return (
            <li
              key={i}
              id={`place-item-${id}`}
              className={`p-6 border-2 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col scroll-mt-24 ${
                isDetailsOpen 
                ? "bg-white border-slate-900 shadow-xl scale-[1.01]" 
                : "bg-white border-white shadow-sm hover:border-slate-100 hover:shadow-md"
              }`}
              onClick={() => toggleDetails(id)}
            >
              <div className="flex justify-between items-start mb-2">
                <p className="text-lg font-bold text-slate-900 leading-tight flex-grow pr-4">
                  <span className={`mr-2 ${isResistance ? 'text-green-600' : 'text-red-600'}`}>{id}.</span> 
                  {place.nom}
                </p>
                <span className={`text-slate-400 transition-transform duration-300 ${isDetailsOpen ? "rotate-180 text-slate-900" : "rotate-0"}`}>
                  ▼
                </span>
              </div>

              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-4">
                📍 {place.num} {place.type_rue} {place.nom_rue} • {place.quartier}
              </p>

              {isDetailsOpen && (
                <div className="mt-2 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl">
                        <span className="font-black text-slate-400 uppercase text-[9px] block mb-1">Catégorie</span>
                        <p className="text-xs font-bold text-slate-700 uppercase leading-none">{place.etablissement}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                        <span className="font-black text-slate-400 uppercase text-[9px] block mb-1">Affiliation</span>
                        <p className={`text-xs font-bold uppercase leading-none ${isResistance ? 'text-green-700' : 'text-red-700'}`}>{place.appartient}</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <span className="font-black text-slate-400 uppercase text-[9px] block mb-1">Site / Usage</span>
                    <p className="text-sm font-medium text-slate-800">{place.site}</p>
                  </div>

                  {place.sigles && (
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-slate-900 text-white text-[10px] font-black rounded uppercase">{place.sigles}</span>
                    </div>
                  )}

                  {place.signification && (
                    <div className="p-4 bg-slate-100 rounded-2xl italic text-sm text-slate-600 leading-relaxed border-l-4 border-slate-300">
                      {place.signification}
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Tableau des Sigles */}
      <div className="mt-16 p-8 bg-white rounded-[2rem] shadow-sm border border-slate-100">
        <h2 className="text-2xl font-black mb-6 text-slate-900 tracking-tighter">📑 LEXIQUE DES SIGLES</h2>
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-sm">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-100">
                <th className="px-4 py-4 text-left font-black">Sigles</th>
                <th className="px-4 py-4 text-left font-black">Signification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <tr><td className="px-4 py-3 font-black text-slate-900">CNT</td><td className="px-4 py-3 text-slate-600">Comité national des Travailleurs</td></tr>
              <tr><td className="px-4 py-3 font-black text-slate-900">UGT</td><td className="px-4 py-3 text-slate-600">Union générale des travailleurs</td></tr>
              <tr><td className="px-4 py-3 font-black text-slate-900">AIT</td><td className="px-4 py-3 text-slate-600">Association internationale des travailleurs</td></tr>
              <tr><td className="px-4 py-3 font-black text-slate-900">MLE</td><td className="px-4 py-3 text-slate-600">Mouvement de libération de l'Espagne</td></tr>
              <tr><td className="px-4 py-3 font-black text-slate-900">FIJL</td><td className="px-4 py-3 text-slate-600">Fédération internationale des jeunesses libertaires</td></tr>
              <tr><td className="px-4 py-3 font-black text-slate-900">AG</td><td className="px-4 py-3 text-slate-600">Assemblée Générale</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <footer className="mt-20 py-10 border-t border-slate-200 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em]">
            Mémoire de la Résistance • Toulouse • Open Data
        </p>
      </footer>
    </div>
  );
}
