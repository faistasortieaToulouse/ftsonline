'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Interface corrigée pour correspondre exactement aux noms des clés de votre API
interface ExilPlace {
  nomLieu: string;
  num: string;
  typeRue: string;
  nomRue: string;
  établissement: string;
  sigles: string;
  signification: string;
  latitude?: number;  // Changé ici
  longitude?: number; // Changé ici
}

const TOULOUSE_CENTER: [number, number] = [43.6045, 1.444];

export default function VisiteExilPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);

  const [places, setPlaces] = useState<ExilPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [L, setL] = useState<any>(null);

  // --- 1. Charger les données depuis visiteexil ---
  useEffect(() => {
    fetch("/api/visiteexil")
      .then(async (res) => {
        const text = await res.text();
        try {
          const data: ExilPlace[] = JSON.parse(text);
          setPlaces(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("❌ Erreur JSON /api/visiteexil :", text, err);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // --- 2. Initialisation Leaflet ---
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || loading) return;

    const initMap = async () => {
      const Leaflet = (await import('leaflet')).default;
      setL(Leaflet);

      if (mapInstance.current) return;

      mapInstance.current = Leaflet.map(mapRef.current!).setView(TOULOUSE_CENTER, 14);

      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
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

  // --- 3. Ajout des marqueurs (Corrigé pour latitude/longitude) ---
  useEffect(() => {
    if (!L || !mapInstance.current || places.length === 0) return;

    places.forEach((place, i) => {
      // Utilisation des bons noms de propriétés
      if (place.latitude && place.longitude) {
        const numeroVoie = place.num && place.num !== "0" ? `${place.num} ` : "";
        
        const customIcon = L.divIcon({
          className: 'marker-exil',
          html: `
            <div style="
              background-color: #dc2626;
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
              box-shadow: 0 2px 5px rgba(0,0,0,0.4);
            ">
              ${i + 1}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        // Application sur la carte avec [latitude, longitude]
        L.marker([place.latitude, place.longitude], { icon: customIcon })
          .addTo(mapInstance.current!)
          .bindPopup(`
            <div style="font-family: sans-serif; min-width: 180px;">
              <strong style="color: #b91c1c;">${i + 1}. ${place.nomLieu}</strong><br/>
              <small>${numeroVoie}${place.typeRue} ${place.nomRue}</small><br/>
              <p style="margin-top:8px; font-size:12px; line-height: 1.4;">${place.établissement}</p>
              ${place.sigles ? `<p style="font-size:11px; color: #dc2626; font-weight: bold; margin-top: 4px;">${place.sigles}</p>` : ''}
            </div>
          `);
      }
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

      <h1 className="text-3xl font-extrabold mb-2 uppercase tracking-tight text-slate-900">
        ✊ Mémoire de l'Exil Républicain Espagnol
      </h1>
      <p className="text-slate-500 mb-6 font-medium">Parcours historique dans les rues de Toulouse</p>

      {/* --- Carte Leaflet --- */}
      <div
        ref={mapRef}
        style={{ height: "65vh", width: "100%" }}
        className="mb-8 border-2 border-slate-200 rounded-3xl bg-slate-50 flex items-center justify-center relative z-0 overflow-hidden shadow-xl"
      >
        {loading && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-red-600 font-bold animate-pulse uppercase text-xs tracking-widest">Chargement des lieux de mémoire...</p>
          </div>
        )}
      </div>

      {/* --- Liste des lieux --- */}
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-slate-800">
        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm shadow-sm">
          {places.length}
        </span>
        Sites répertoriés
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.map((place, i) => {
          const numeroStr = place.num && place.num !== "0" ? `${place.num} ` : "";

          return (
            <div key={i} className="group p-5 border border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all hover:border-red-200 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="flex items-center justify-center bg-red-600 text-white w-8 h-8 rounded-full font-bold text-xs shadow-sm">
                    {i + 1}
                  </span>
                  {place.sigles && (
                    <span className="text-[10px] font-bold bg-red-50 text-red-700 px-2 py-1 rounded-md border border-red-100">
                      {place.sigles}
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-red-700 transition-colors">
                  {place.nomLieu}
                </h3>
                
                <p className="text-sm text-slate-500 italic mb-4 flex items-center gap-1">
                  <span className="text-red-400">📍</span> {numeroStr}{place.typeRue} {place.nomRue}
                </p>

                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {place.établissement}
                </p>
              </div>

              {place.signification && (
                <p className="mt-4 text-[11px] text-slate-400 font-medium uppercase tracking-wider italic">
                  — {place.signification}
                </p>
              )}
            </div>
          );
        })}
      </div>
      
      <footer className="mt-12 py-6 border-t border-slate-100 text-center">
        <p className="text-xs font-bold text-slate-300 uppercase tracking-[0.3em]">
          Toulouse Espagnole • Données Historiques
        </p>
      </footer>
    </div>
  );
}