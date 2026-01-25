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
  lat?: number; // Requis pour éviter le géocodage
  lng?: number; // Requis pour éviter le géocodage
}

const TOULOUSE_CENTER: [number, number] = [43.6045, 1.444];

export default function VisiteResistancePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [places, setPlaces] = useState<ResistancePlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [L, setL] = useState<any>(null);
  const [openDetailsId, setOpenDetailsId] = useState<number | null>(null);

  const toggleDetails = (id: number) => {
    setOpenDetailsId((prevId) => (prevId === id ? null : id));
  };

  // 1. Chargement des données
  useEffect(() => {
    fetch("/api/visiteresistance")
      .then((res) => res.json())
      .then((data: ResistancePlace[]) => {
        setPlaces(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  // 2. Initialisation Leaflet (Méthode OTAN)
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

  // 3. Ajout des marqueurs (Sans Géocodage)
  useEffect(() => {
    if (!L || !mapInstance.current || places.length === 0) return;

    places.forEach((place, i) => {
      if (place.lat === undefined || place.lng === undefined) return;

      const id = i + 1;
      const color = place.appartient.toLowerCase() === "résistance" ? "#22c55e" : "#ef4444";

      const customIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            background-color: ${color};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid black;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 11px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">
            ${id}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([place.lat, place.lng], { icon: customIcon })
        .addTo(mapInstance.current!)
        .bindPopup(`<strong>${id}. ${place.nom}</strong>`);

      marker.on("click", () => {
        toggleDetails(id);
        mapInstance.current.setView([place.lat, place.lng], 16);
        document.getElementById(`place-item-${id}`)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    });
  }, [L, places]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-6 text-slate-900">
        🏛️ Visite Résistance — Toulouse ({places.length} Lieux)
      </h1>

      {/* Conteneur de la Carte */}
      <div
        ref={mapRef}
        style={{ height: "65vh", width: "100%" }}
        className="mb-8 border-4 border-slate-200 rounded-xl bg-gray-100 flex items-center justify-center relative z-0 overflow-hidden shadow-xl"
      >
        {loading && <p className="text-gray-500 font-bold animate-pulse">Chargement de la carte...</p>}
      </div>

      <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-slate-800">
        Liste des lieux détaillés
      </h2>

      {/* Liste des lieux avec Accordéon */}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {places.map((place, i) => {
          const id = i + 1;
          const isDetailsOpen = openDetailsId === id;

          return (
            <li
              key={i}
              id={`place-item-${id}`}
              className={`p-5 border rounded-xl transition-all duration-300 cursor-pointer flex flex-col ${
                isDetailsOpen 
                ? "bg-slate-50 border-blue-400 shadow-md ring-1 ring-blue-100" 
                : "bg-white border-slate-200 shadow hover:shadow-lg"
              }`}
              onClick={() => toggleDetails(id)}
            >
              <div className="flex justify-between items-start">
                <p className="text-lg font-bold text-slate-900">
                  <span className="text-blue-600 mr-2">{id}.</span> {place.nom}
                </p>
                <span className={`text-xl text-black font-bold transition-transform duration-300 ${isDetailsOpen ? "rotate-180" : "rotate-0"}`}>
                  ▼
                </span>
              </div>

              <p className="text-sm italic text-slate-600 mt-1">
                📍 {place.num} {place.type_rue} {place.nom_rue} ({place.quartier})
              </p>

              {isDetailsOpen && (
                <div className="mt-3 pt-3 border-t border-slate-200 animate-in fade-in slide-in-from-top-1 duration-300 space-y-2">
                  <p className="text-sm"><span className="font-bold text-slate-700">Établissement :</span> {place.etablissement}</p>
                  <p className="text-sm"><span className="font-bold text-slate-700">Site :</span> {place.site}</p>
                  <p className="text-sm"><span className="font-bold text-slate-700">Appartient :</span> {place.appartient}</p>
                  {place.sigles && <p className="text-sm"><span className="font-bold text-slate-700">Sigles :</span> {place.sigles}</p>}
                  {place.signification && (
                    <div className="p-3 bg-white rounded border italic text-sm text-slate-600">
                      {place.signification}
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Tableau des Sigles - Reste identique */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">📑 Sigles et significations</h2>
      <div className="overflow-x-auto">
        <table className="table-auto border-collapse border border-gray-400 w-full text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 px-2 py-1 text-left">Sigles</th>
              <th className="border border-gray-400 px-2 py-1 text-left">Signification</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border px-2 py-1 font-bold">CNT</td><td className="border px-2 py-1">Comité national des Travailleurs</td></tr>
            <tr><td className="border px-2 py-1 font-bold">UGT</td><td className="border px-2 py-1">Union générale des travailleurs</td></tr>
            <tr><td className="border px-2 py-1 font-bold">AIT</td><td className="border px-2 py-1">Association internationale des travailleurs</td></tr>
            {/* ... Reste des lignes du tableau ... */}
            <tr><td className="border px-2 py-1 font-bold">AG</td><td className="border px-2 py-1">Assemblée Générale</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}