'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Imports dynamiques pour Leaflet (pas de SSR)
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

interface Departement {
  nom: string;
  pays: string;
  statut: string;
  lat: number;
  lng: number;
  description: string;
  date_debut: number;
  date_fin: number;
}

export default function AnciensDepartementsPage() {
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    // Chargement de l'objet Leaflet pour les icônes personnalisées
    import("leaflet").then((leaflet) => {
      setL(leaflet);
    });

    fetch("/api/anciensdepartements")
      .then(async (res) => {
        const data = await res.json();
        if (Array.isArray(data)) {
          const sorted = data.sort((a, b) => 
            a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' })
          );
          setDepartements(sorted);
        }
      })
      .catch(console.error);
  }, []);

  // Fonction pour créer l'icône "Bleu de France" avec le numéro
  const createIcon = (index: number) => {
    if (!L) return null;
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: #002395;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 10px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
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

      <header className="mb-8 border-b pb-6 text-center">
        <h1 className="text-4xl font-black text-blue-900 uppercase tracking-tighter">
          Anciens Départements Français
        </h1>
        <p className="text-gray-600 mt-2 italic">Hors frontières actuelles : Europe Napoléonienne et Algérie Française</p>
      </header>

      {/* ZONE CARTE LEAFLET */}
      <div className="mb-8 border-4 border-white shadow-2xl rounded-3xl bg-slate-200 overflow-hidden" style={{ height: "60vh" }}>
        {typeof window !== "undefined" && (
          <MapContainer 
            center={[42.0, 12.0]} 
            zoom={4} 
            scrollWheelZoom={true} 
            style={{ height: "100%", width: "100%", zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {departements.map((d, index) => {
              const icon = createIcon(index);
              return icon ? (
                <Marker key={d.nom} position={[d.lat, d.lng]} icon={icon}>
                  <Popup>
                    <div style={{ color: 'black', padding: '5px', fontFamily: 'sans-serif', maxWidth: '220px' }}>
                      <strong style={{ fontSize: '14px' }}>#${index + 1} - ${d.nom}</strong><br />
                      <span style={{ color: '#002395', fontSize: '11px', font_weight: 'bold' }}>{d.pays.toUpperCase()}</span><br />
                      <span style={{ color: '#b91c1c', fontSize: '10px', font_weight: 'bold' }}>{d.date_debut} — {d.date_fin}</span><br />
                      <p style={{ marginTop: '8px', fontSize: '12px', lineHeight: '1.4', color: '#333' }}>{d.description}</p>
                    </div>
                  </Popup>
                </Marker>
              ) : null;
            })}
          </MapContainer>
        )}
      </div>

      {/* GRILLE DE DEPARTEMENTS (Inchangée) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departements.map((d, index) => (
          <div key={d.nom} className="group p-5 bg-white rounded-2xl shadow-sm border border-slate-200 hover:bg-blue-900 transition-all duration-300 flex gap-4">
            <span className="text-3xl font-black text-slate-200 group-hover:text-blue-400/30 transition-colors">
              {(index + 1).toString().padStart(2, '0')}
            </span>
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-white transition-colors leading-tight">
                {d.nom}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 group-hover:bg-blue-800 group-hover:text-blue-100 transition-colors">
                  {d.pays}
                </span>
                <span className="text-xs font-bold text-red-600 group-hover:text-red-300">
                  {d.date_debut} — {d.date_fin}
                </span>
              </div>
              <p className="text-sm text-gray-600 group-hover:text-blue-50 mt-3 leading-snug">
                {d.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
