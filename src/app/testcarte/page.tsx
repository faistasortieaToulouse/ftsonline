'use client';

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

// --- Imports dynamiques pour Leaflet (SSR Safe) ---
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

interface Territoire {
  nom: string;
  statut: string;
  continent: string;
  lat: number;
  lng: number;
  description: string;
  date_debut: number;
  date_fin: number;
}

export default function ColonieEuropePage() {
  const [territoires, setTerritoires] = useState<Territoire[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    // 1. Chargement de l'objet Leaflet pour les icônes personnalisées
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
      setIsReady(true);
    });

    // 2. Fetch des données
    fetch("/api/colonieeurope")
      .then(async (res) => {
        const data = await res.json();
        if (Array.isArray(data)) {
          const sorted = data.sort((a, b) => 
            a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' })
          );
          setTerritoires(sorted);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="p-4 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8 border-b pb-6 text-center">
        <h1 className="text-4xl font-black text-blue-900 uppercase tracking-tighter">
          Empire Français : Territoires Annexés
        </h1>
        <p className="text-gray-600 mt-2 italic">L'Europe sous Napoléon Ier et la Révolution (Période 1792 - 1815)</p>
      </header>

      {/* --- CARTE LEAFLET --- */}
      <div className="mb-8 border-4 border-white shadow-2xl rounded-3xl bg-slate-200 overflow-hidden h-[60vh] relative">
        {!isReady || territoires.length === 0 ? (
          <div className="flex items-center justify-center h-full bg-slate-100">
             <div className="flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <p className="font-bold text-blue-600">Chargement de la carte impériale...</p>
            </div>
          </div>
        ) : (
          <MapContainer 
            center={[47.5, 7.5]} 
            zoom={5} 
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            
            {territoires.map((t, index) => {
              // Création d'une icône personnalisée style "Bleu Empire"
              const customIcon = L.divIcon({
                className: "custom-div-icon",
                html: `<div style="background-color: #1e3a8a; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${index + 1}</div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              });

              return (
                <Marker key={t.nom} position={[t.lat, t.lng]} icon={customIcon}>
                  <Popup>
                    <div style={{ color: 'black', padding: '2px', maxWidth: '200px' }}>
                      <strong style={{ fontSize: '14px' }}>#${index + 1} - ${t.nom}</strong><br />
                      <span style={{ color: '#b91c1c', fontSize: '10px', fontWeight: 'bold' }}>${t.date_debut} — ${t.date_fin}</span><br />
                      <span style={{ color: '#666', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>${t.statut}</span>
                      <p style={{ marginTop: '8px', fontSize: '12px', lineHeight: '1.4', marginBottom: 0 }}>${t.description}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>

      {/* --- GRILLE DES TERRITOIRES (Inchangée) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {territoires.map((t, index) => (
          <div key={t.nom} className="group p-5 bg-white rounded-2xl shadow-sm border border-slate-200 hover:bg-blue-900 transition-all duration-300 flex gap-4">
            <span className="text-3xl font-black text-slate-200 group-hover:text-blue-400/30 transition-colors">
              {(index + 1).toString().padStart(2, '0')}
            </span>
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-white transition-colors">{t.nom}</h3>
              <div className="text-xs font-bold text-red-600 group-hover:text-red-300 mt-1">
                {t.date_debut} — {t.date_fin}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 group-hover:text-blue-200 mt-1">
                {t.statut}
              </div>
              <p className="text-sm text-gray-600 group-hover:text-blue-50 mt-3 leading-snug">
                {t.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
