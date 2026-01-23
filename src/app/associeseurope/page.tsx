'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// --- Imports dynamiques pour Leaflet (pas de SSR) ---
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
}

export default function AssociesEuropePage() {
  const [territoires, setTerritoires] = useState<Territoire[]>([]);
  const [L, setL] = useState<any>(null); // Pour stocker l'instance Leaflet (icônes)

  useEffect(() => {
    // Chargement des données
    fetch("/api/associeseurope")
      .then(async (res) => {
        const data = await res.json();
        if (Array.isArray(data)) {
          const ordreContinents = ["Europe", "Afrique", "Amérique", "Asie", "Antarctique", "Océanie"];
          const sorted = data.sort((a, b) => {
            if (a.continent !== b.continent) {
              return ordreContinents.indexOf(a.continent) - ordreContinents.indexOf(b.continent);
            }
            return a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' });
          });
          setTerritoires(sorted);
        }
      })
      .catch(console.error);

    // Chargement de Leaflet pour les icônes personnalisées
    import("leaflet").then((leaflet) => {
      setL(leaflet);
    });
  }, []);

  // Fonction pour créer l'icône personnalisée (Cercle bleu avec numéro)
  const createCustomIcon = (index: number) => {
    if (!L) return null;
    return L.divIcon({
      className: 'custom-icon',
      html: `
        <div style="
          background-color: #1e3a8a;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">
          ${index + 1}
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

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
          🇪🇺 États et Territoires Associés à l'UE
        </h1>
        <p className="text-gray-600 mt-2 italic">Analyse des statuts fiscaux et douaniers des dépendances européennes</p>
      </header>

      {/* --- ZONE CARTE LEAFLET --- */}
      <div className="mb-8 border-4 border-white shadow-2xl rounded-3xl bg-slate-200 overflow-hidden" style={{ height: "60vh", width: "100%" }}>
        {typeof window !== "undefined" && L && (
          <MapContainer center={[25, 10]} zoom={3} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {territoires.map((t, index) => {
              const icon = createCustomIcon(index);
              return icon ? (
                <Marker key={t.nom} position={[t.lat, t.lng]} icon={icon}>
                  <Popup>
                    <div style={{ color: 'black', padding: '5px', fontFamily: 'sans-serif', maxWidth: '200px' }}>
                      <strong style={{ fontSize: '14px' }}>#${index + 1} - ${t.nom}</strong><br />
                      <span style={{ color: '#1e3a8a', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>{t.statut}</span>
                      <p style={{ marginTop: '8px', fontSize: '12px', lineHeight: '1.4' }}>{t.description}</p>
                    </div>
                  </Popup>
                </Marker>
              ) : null;
            })}
          </MapContainer>
        )}
      </div>

      {/* --- ZONE CONTENU (Inchangée) --- */}
      <div className="space-y-12">
        {["Europe", "Afrique", "Amérique", "Asie", "Antarctique", "Océanie"].map((continent) => {
          const list = territoires.filter(t => t.continent === continent);
          if (list.length === 0) return null;

          return (
            <section key={continent} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black mb-6 text-blue-900 flex items-center justify-between border-l-4 border-blue-600 pl-4">
                <span>{continent}</span>
                <span className="text-sm font-normal bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{list.length} territoires</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {list.map((t) => {
                  const globalIndex = territoires.indexOf(t);
                  return (
                    <div key={t.nom} className="group p-4 bg-slate-50 rounded-xl hover:bg-blue-900 transition-all duration-300 flex gap-4 border border-slate-100 hover:border-blue-700">
                      <span className="text-3xl font-black text-slate-300 group-hover:text-blue-400/50 transition-colors">
                        {(globalIndex + 1).toString().padStart(2, '0')}
                      </span>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-white transition-colors">{t.nom}</h3>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 group-hover:text-blue-200 mt-1">
                          {t.statut}
                        </div>
                        <p className="text-sm text-gray-600 group-hover:text-blue-100 mt-2 leading-snug">
                          {t.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
