'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Globe2, AlertTriangle, MapPin } from "lucide-react";
import 'leaflet/dist/leaflet.css';

interface Langue {
  id?: number;
  nom: string;
  famille: string;
  zone?: string;
  details?: string;
  statut?: string;
  lat?: number;
  lng?: number;
  varietes?: string[];
  sous_varietes?: string[];
}

export default function LanguesFrancePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [langues, setLangues] = useState<Langue[]>([]);
  const [isReady, setIsReady] = useState(false);

  // 1. Récupération des données via ton API
  useEffect(() => {
    fetch("/api/languesfrance")
      .then(async (res) => {
        const data = await res.json();
        if (Array.isArray(data)) setLangues(data);
      })
      .catch(console.error);
  }, []);

  // 2. Initialisation et Mise à jour de la carte
  useEffect(() => {
    const updateMap = async () => {
      if (!mapRef.current) return;
      const L = (await import('leaflet')).default;

      // Initialisation de l'instance si elle n'existe pas
      if (!mapInstance.current) {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        mapInstance.current = L.map(mapRef.current, {
          scrollWheelZoom: false,
          tap: true
        }).setView([46.6033, 1.8883], 5);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap'
        }).addTo(mapInstance.current);
        
        setIsReady(true);
      }

      // Ajout des marqueurs quand les langues sont chargées
      if (langues.length > 0) {
        const markers: any[] = [];
        
        langues.forEach(langue => {
          if (langue.lat && langue.lng) {
            const marker = L.marker([langue.lat, langue.lng])
              .addTo(mapInstance.current)
              .bindPopup(`
                <div style="font-family: sans-serif;">
                  <strong style="color: #4f46e5; font-size: 14px;">${langue.nom}</strong><br/>
                  <span style="font-size: 12px; color: #64748b;">${langue.famille}</span>
                </div>
              `);
            markers.push([langue.lat, langue.lng]);
          }
        });

        // Optionnel : Ajuster la vue pour voir tous les points (Métropole + DOM-TOM)
        if (markers.length > 0) {
            // On ne le fait qu'une fois au chargement
            // mapInstance.current.fitBounds(markers, { padding: [20, 20] });
        }
      }
    };

    updateMap();

    return () => {
      if (mapInstance.current && !mapRef.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [langues]); // Se déclenche quand les langues arrivent

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900">
      
      {/* BOUTON RETOUR */}
      <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 hover:underline mb-6 transition-colors group text-sm font-medium">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour à l'accueil
      </Link>

      <header className="mb-6 md:mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 flex flex-wrap justify-center md:justify-start items-center gap-3">
          <Globe2 size={40} className="text-indigo-600" /> Langues de France
        </h1>
        <p className="text-gray-600 mt-2 italic text-sm md:text-base max-w-2xl">
          Un inventaire cartographique de la diversité linguistique, du Gallo à l'Ajië, en passant par les langues de Guyane.
        </p>
      </header>

      {/* CARTE */}
      <div className="relative">
        <div
          ref={mapRef}
          className="h-[40vh] md:h-[50vh] w-full mb-10 border-4 border-white shadow-2xl rounded-3xl bg-slate-200 overflow-hidden z-0"
        />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100/50 backdrop-blur-sm rounded-3xl z-10">
             <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold text-indigo-600">Chargement des données...</p>
             </div>
          </div>
        )}
      </div>

      {/* SEPARATEUR ET TITRE GRILLE */}
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-xl font-bold text-slate-800 uppercase tracking-widest flex items-center gap-3">
          Inventaire <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-black">{langues.length}</span>
        </h2>
        <div className="h-px flex-1 bg-slate-200"></div>
      </div>

      {/* GRILLE DES LANGUES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {langues.map((langue, i) => (
          <div 
            key={langue.id || i} 
            className="group flex flex-col p-5 bg-white shadow-sm border border-slate-200 rounded-2xl hover:shadow-xl hover:border-indigo-200 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-3 gap-2">
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                {langue.nom}
              </h3>
              {langue.statut && (
                <span className={`flex-shrink-0 flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border ${
                  langue.statut === 'mort' || langue.statut === 'disparu' 
                  ? 'bg-red-50 text-red-600 border-red-100' 
                  : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  <AlertTriangle size={10} /> {langue.statut.toUpperCase()}
                </span>
              )}
            </div>

            <div className="space-y-1.5 mb-4">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="font-bold text-slate-400 uppercase tracking-tighter w-14">Famille</span> 
                <span className="text-slate-700 font-medium truncate">{langue.famille}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="font-bold text-slate-400 uppercase tracking-tighter w-14">Zone</span> 
                <span className="text-slate-700 truncate">{langue.zone || "France"}</span>
              </div>
            </div>

            {langue.details && (
              <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border-l-2 border-indigo-300 italic mb-4 flex-grow">
                {langue.details}
              </p>
            )}

            {(langue.varietes || langue.sous_varietes) && (
              <div className="flex flex-wrap gap-1 mt-auto pt-2">
                {(langue.varietes || langue.sous_varietes)?.map((v, idx) => (
                  <span key={idx} className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                    {v}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <footer className="mt-20 py-10 text-center border-t border-slate-200">
        <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-2">Source des données</p>
        <p className="text-slate-500 text-xs font-medium">Atlas linguistique des langues de France • {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
