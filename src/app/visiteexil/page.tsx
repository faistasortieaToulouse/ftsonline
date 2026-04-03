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
  latitude?: number;  
  longitude?: number; 
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

  // --- 3. Ajout des marqueurs numérotés avec lien d'ancrage ---
  useEffect(() => {
    if (!L || !mapInstance.current || places.length === 0) return;

    places.forEach((place, i) => {
      if (place.latitude && place.longitude) {
        const currentNum = i + 1;
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
              ${currentNum}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        L.marker([place.latitude, place.longitude], { icon: customIcon })
          .addTo(mapInstance.current!)
          .bindPopup(`
            <div style="font-family: sans-serif; min-width: 180px; text-align: center;">
              <strong style="color: #b91c1c; font-size: 14px;">${currentNum}. ${place.nomLieu}</strong><br/>
              <small style="color: #64748b;">${numeroVoie}${place.typeRue} ${place.nomRue}</small><br/>
              <p style="margin: 8px 0; font-size:12px; line-height: 1.4; color: #334155;">${place.établissement}</p>
              <a href="#exil-place-${currentNum}" style="display: inline-block; background-color: #dc2626; color: white; padding: 5px 12px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: bold;">Voir détails ↓</a>
            </div>
          `);
      }
    });
  }, [L, places]);

  return (
    <div className="p-4 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-red-700 hover:text-red-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2 uppercase tracking-tight text-slate-900 leading-tight">
          ✊ Mémoire de l'Exil Républicain Espagnol
        </h1>
        <p className="text-slate-500 font-medium">Parcours historique dans les rues de Toulouse</p>
      </header>

      {/* --- Carte Leaflet --- */}
      <div
        ref={mapRef}
        style={{ height: "65vh", width: "100%" }}
        className="mb-10 border-2 border-white rounded-3xl bg-slate-100 flex items-center justify-center relative z-0 overflow-hidden shadow-2xl"
      >
        {loading && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-red-600 font-bold animate-pulse uppercase text-xs tracking-widest">Chargement des lieux de mémoire...</p>
          </div>
        )}
      </div>

      {/* --- Liste des lieux --- */}
      <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-800">
        <span className="bg-red-600 text-white px-4 py-1 rounded-full text-sm shadow-md font-bold">
          {places.length}
        </span>
        Sites répertoriés
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {places.map((place, i) => {
          const numeroStr = place.num && place.num !== "0" ? `${place.num} ` : "";
          const currentId = i + 1;

          return (
            <div 
              key={i} 
              id={`exil-place-${currentId}`}
              className="group p-6 border border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all hover:border-red-200 flex flex-col justify-between scroll-mt-24"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="flex items-center justify-center bg-red-600 group-hover:bg-red-700 text-white w-9 h-9 rounded-full font-bold text-sm shadow-md transition-colors">
                    {currentId}
                  </span>
                  {place.sigles && (
                    <span className="text-[10px] font-bold bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-100">
                      {place.sigles}
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-red-700 transition-colors">
                  {place.nomLieu}
                </h3>
                
                <p className="text-sm text-slate-500 italic mb-5 flex items-center gap-2">
                  <span className="text-red-400">📍</span> {numeroStr}{place.typeRue} {place.nomRue}
                </p>

                <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {place.établissement}
                </div>
              </div>

              {place.signification && (
                <p className="mt-5 text-[11px] text-slate-400 font-bold uppercase tracking-[0.1em] italic border-t border-slate-50 pt-4">
                  — {place.signification}
                </p>
              )}
            </div>
          );
        })}
      </div>
      
      <footer className="mt-16 py-10 border-t border-slate-200 text-center">
        <p className="text-xs font-bold text-slate-300 uppercase tracking-[0.4em]">
          Toulouse Espagnole • Données Historiques
        </p>
      </footer>
    </div>
  );
}
