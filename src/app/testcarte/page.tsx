'use client';

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Import dynamique de la carte pour éviter les erreurs SSR (Leaflet utilise 'window')
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

interface MembreOTAN {
  pays: string;
  capitale: string;
  date_admission: string;
  population: number;
  lat: number;
  lng: number;
}

interface OTANData {
  nom_liste: string;
  total: number;
  otan_membres: MembreOTAN[];
}

export default function OTANPage() {
  const [data, setData] = useState<OTANData | null>(null);
  const [L, setL] = useState<any>(null);

  // Chargement des données et de l'instance Leaflet pour les icônes
  useEffect(() => {
    fetch("/api/OTAN")
      .then(res => res.json())
      .then(json => setData(json))
      .catch(console.error);

    // Import de Leaflet pour configurer les icônes par défaut
    import("leaflet").then((leaflet) => {
      setL(leaflet);
      // Correction du bug d'affichage des icônes par défaut avec Webpack/Next.js
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    });
  }, []);

  if (!data || !L) return <div className="p-10 text-center animate-pulse">Chargement de la carte OTAN...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      {/* Import des styles Leaflet */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />

      <nav className="mb-6">
        <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium transition-colors">
          ← Retour à l'Accueil
        </Link>
      </nav>

      <header className="mb-8 border-b border-blue-900 pb-6">
        <h1 className="text-3xl md:text-5xl font-black text-blue-950 flex items-center gap-3">
          ⚓ {data.nom_liste}
        </h1>
        <p className="text-gray-600 mt-2 italic">Organisation du Traité de l'Atlantique Nord ({data.total} membres)</p>
      </header>

      {/* Carte Leaflet Responsive */}
      <div className="mb-10 h-[400px] md:h-[550px] w-full border-4 border-blue-900 shadow-2xl rounded-3xl bg-slate-200 overflow-hidden z-0">
        <MapContainer 
          center={[45, -10]} 
          zoom={3} 
          scrollWheelZoom={true} 
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {data.otan_membres.map((p, idx) => (
            <Marker key={idx} position={[p.lat, p.lng]}>
              <Popup>
                <div className="font-sans">
                  <strong className="text-lg text-blue-900">{p.pays}</strong><br />
                  <span className="text-gray-600">Capitale : {p.capitale}</span><br />
                  <span className="text-sm font-semibold">Admis le : {p.date_admission}</span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Grille responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.otan_membres.map((p, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-blue-900 text-xl mb-1">{p.pays}</h3>
              <p className="text-sm text-slate-500 mb-4 uppercase tracking-wider">{p.capitale}</p>
            </div>
            
            <div className="space-y-3">
              <div className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-bold inline-block">
                Membre depuis {p.date_admission.split(' ').slice(-1)}
              </div>
              <div className="flex justify-between items-center text-sm border-t pt-3">
                <span className="text-slate-400">Population</span>
                <span className="font-mono font-bold text-slate-700">{p.population.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
