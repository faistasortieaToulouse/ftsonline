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

interface Colonie {
  grande_entite: string;
  territoire: string;
  periode: string;
  lat: number;
  lng: number;
}

export default function ColonieFrancePage() {
  const [colonies, setColonies] = useState<Colonie[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    // 1. Charger Leaflet pour les icônes personnalisées
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
      setIsReady(true);
    });

    // 2. Récupérer les données
    fetch("/api/coloniefrance")
      .then(async (res) => {
        const data = await res.json();
        if (Array.isArray(data)) {
          const sorted = data.sort((a, b) => {
            if (a.grande_entite !== b.grande_entite) {
              return a.grande_entite.localeCompare(b.grande_entite);
            }
            return a.territoire.localeCompare(b.territoire, 'fr');
          });
          setColonies(sorted);
        }
      })
      .catch(console.error);
  }, []);

  // Calcul du centre moyen
  const center: [number, number] = colonies.length > 0 
    ? [
        colonies.reduce((sum, c) => sum + c.lat, 0) / colonies.length,
        colonies.reduce((sum, c) => sum + c.lng, 0) / colonies.length
      ]
    : [20, 0]; // Centre par défaut (monde)

  const entites = Array.from(new Set(colonies.map(c => c.grande_entite)));

  return (
    <div className="p-4 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8 border-b pb-6">
        <h1 className="text-4xl font-black text-blue-900 flex items-center gap-3">
          ⚜️ Anciennes Colonies de la France
        </h1>
        <p className="text-gray-600 mt-2 italic">Chronologie et géographie du premier empire colonial</p>
      </header>

      {/* --- CARTE LEAFLET --- */}
      <div className="mb-8 border-4 border-white shadow-xl rounded-3xl bg-slate-200 overflow-hidden h-[65vh] relative">
        {!isReady || colonies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="font-bold text-blue-600 text-lg">Initialisation de la carte coloniale...</p>
          </div>
        ) : (
          <MapContainer 
            center={center} 
            zoom={3} 
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            
            {colonies.map((c, index) => {
              // Création de l'icône personnalisée (Cercle bleu avec numéro)
              const customIcon = L.divIcon({
                className: "custom-div-icon",
                html: `<div style="background-color: #1e3a8a; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${index + 1}</div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              });

              return (
                <Marker key={`${c.territoire}-${index}`} position={[c.lat, c.lng]} icon={customIcon}>
                  <Popup>
                    <div style={{ color: 'black', padding: '5px', maxWidth: '220px' }}>
                      <strong style={{ fontSize: '14px' }}>#${index + 1} - ${c.territoire}</strong><br />
                      <span style={{ color: '#b91c1c', fontSize: '11px', fontWeight: 'bold' }}>${c.periode}</span><br />
                      <span style={{ color: '#666', fontSize: '10px', textTransform: 'uppercase' }}>${c.grande_entite}</span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>

      {/* --- LISTE DES TERRITOIRES PAR ENTITÉS (Inchangée) --- */}
      <div className="space-y-12">
        {entites.map((entite) => (
          <section key={entite} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-black mb-6 text-blue-900 border-l-4 border-blue-600 pl-4">
              {entite}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {colonies
                .filter(c => c.grande_entite === entite)
                .map((c) => {
                  const globalIndex = colonies.indexOf(c);
                  return (
                    <div key={`${c.territoire}-${globalIndex}`} className="group p-4 bg-slate-50 rounded-xl hover:bg-blue-900 transition-all duration-300 flex gap-4">
                      <span className="text-3xl font-black text-slate-300 group-hover:text-blue-400/50 transition-colors">
                        {(globalIndex + 1).toString().padStart(2, '0')}
                      </span>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-white transition-colors">{c.territoire}</h3>
                        <div className="text-xs font-bold text-red-600 group-hover:text-red-300 mt-1">
                          {c.periode}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
