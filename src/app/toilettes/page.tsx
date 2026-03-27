"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Beer, MapPin, Info } from "lucide-react";
import "leaflet/dist/leaflet.css";

const TOULOUSE_CENTER: [number, number] = [43.6045, 1.444];

export default function ToilettesMapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [data, setData] = useState<{ bars: any[]; sanisettes: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [L, setL] = useState<any>(null);
  const [openDetailsId, setOpenDetailsId] = useState<string | null>(null);

  // 1. Chargement des données combinées
  useEffect(() => {
    fetch("/api/toilettes")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  // 2. Initialisation Leaflet
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

  // 3. Ajout des marqueurs (Bars en Rose, Sanisettes en Bleu)
  useEffect(() => {
    if (!L || !mapInstance.current || !data) return;

    // Ajout des Bars
    data.bars.forEach((bar, i) => {
      const marker = L.marker([bar.lat, bar.lon], {
        icon: L.divIcon({
          className: "custom-marker",
          html: `<div style="background-color: #db2777; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🍷</div>`,
          iconSize: [22, 22],
        })
      })
      .addTo(mapInstance.current)
      .bindPopup(`<strong>Bar : ${bar.nom}</strong><br/>${bar.adresse}`);
    });

    // Ajout des Sanisettes
    data.sanisettes.forEach((sani, i) => {
      const lat = sani.geo_point_2d.lat;
      const lon = sani.geo_point_2d.lon;
      
      L.marker([lat, lon], {
        icon: L.divIcon({
          className: "custom-marker",
          html: `<div style="background-color: #2563eb; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🚻</div>`,
          iconSize: [22, 22],
        })
      })
      .addTo(mapInstance.current)
      .bindPopup(`<strong>Sanisette : ${sani.route}</strong><br/>${sani.type}`);
    });

  }, [L, data]);

  if (loading) return <div className="p-10 text-center animate-pulse text-pink-600 font-bold">Localisation des toilettes...</div>;

  return (
    <div className="p-4 max-w-7xl mx-auto font-sans">
      <nav className="mb-6 flex justify-between items-center">
        <Link href="/" className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Retour à l'accueil
        </Link>
        <a href="https://ici-toilettes.fr/toilettes-publiques-toulouse/" target="_blank" className="text-xs bg-gray-100 px-3 py-1 rounded-full border hover:bg-gray-200 transition-colors">
          Source: ICI Toilettes
        </a>
      </nav>

      <h1 className="text-3xl font-extrabold mb-6 text-slate-900 flex items-center gap-3">
        🚽 Toilettes Publiques & Partenaires
      </h1>

      {/* Carte Leaflet */}
      <div
        ref={mapRef}
        style={{ height: "50vh", width: "100%" }}
        className="mb-8 border-4 border-slate-100 rounded-2xl shadow-2xl relative z-0 overflow-hidden"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Colonne 1 : Bars */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-pink-700">
            <Beer size={20} /> Les 15 Bars "ICI Toilettes"
          </h2>
          <div className="space-y-3">
            {data?.bars.map((bar, i) => (
              <div key={i} className="p-4 bg-white border border-pink-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold">{bar.nom}</h3>
                <p className="text-sm text-gray-600">{bar.adresse}</p>
                {bar.note && <p className="text-xs italic text-pink-500 mt-1">{bar.note}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Colonne 2 : Sanisettes */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-700">
            <Info size={20} /> Sanisettes Municipales
          </h2>
          <div className="max-h-[600px] overflow-y-auto space-y-2 pr-2">
            {data?.sanisettes.map((sani, i) => (
              <div key={i} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                <p className="font-semibold text-gray-800">{sani.route}</p>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{sani.type}</span>
                  <span className={sani.pmr.includes("Non") ? "text-orange-500" : "text-green-600"}>
                    {sani.pmr.includes("Non") ? "PMR ❌" : "PMR ✅"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
