'use client';

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

// Dictionnaire étendu pour couvrir tous les partenaires
const coordsGlobal: Record<string, { lat: number; lng: number }> = {
  // Candidats
  "Ukraine": { lat: 50.45, lng: 30.52 }, "Géorgie": { lat: 41.71, lng: 44.82 }, "Bosnie-Herzégovine": { lat: 43.85, lng: 18.41 },
  // PPP & Plan individuel (IPAP)
  "Kazakhstan": { lat: 51.16, lng: 71.42 }, "Serbie": { lat: 44.78, lng: 20.44 }, "Moldavie": { lat: 47.01, lng: 28.86 },
  "Arménie": { lat: 40.17, lng: 44.50 }, "Autriche": { lat: 48.20, lng: 16.37 }, "Azerbaïdjan": { lat: 40.40, lng: 49.86 },
  "Biélorussie": { lat: 53.90, lng: 27.55 }, "Irlande": { lat: 53.34, lng: -6.26 }, "Suisse": { lat: 46.94, lng: 7.44 },
  "Russie": { lat: 55.75, lng: 37.61 }, "Ouzbékistan": { lat: 41.3, lng: 69.2 }, "Kirghizistan": { lat: 42.8, lng: 74.5 },
  // Global
  "Australie": { lat: -35.28, lng: 149.13 }, "Nouvelle-Zélande": { lat: -41.28, lng: 174.77 }, "Mongolie": { lat: 47.88, lng: 106.88 },
  "Pakistan": { lat: 33.68, lng: 73.04 }, "Colombie": { lat: 4.71, lng: -74.07 }, "Japon": { lat: 35.67, lng: 139.65 },
  "Corée du Sud": { lat: 37.56, lng: 126.97 }, "Irak": { lat: 33.31, lng: 44.36 },
  // Méditerranée & Istanbul
  "Maroc": { lat: 33.97, lng: -6.84 }, "Israël": { lat: 31.76, lng: 35.21 }, "Égypte": { lat: 30.04, lng: 31.23 },
  "Tunisie": { lat: 36.8, lng: 10.1 }, "Algérie": { lat: 36.75, lng: 3.05 }, "Qatar": { lat: 25.28, lng: 51.53 },
  "Koweït": { lat: 29.3, lng: 47.9 }, "Émirats arabes unis": { lat: 24.45, lng: 54.37 }, "Bahreïn": { lat: 26.2, lng: 50.5 }
};

export default function OTANSupPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [data, setData] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetch("/api/OTANsup")
      .then(res => res.json())
      .then(json => { if (!json.error) setData(json); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!isReady || !mapRef.current || !data || typeof window.google === 'undefined') return;
    if (mapInstance.current) return;

    const map = new google.maps.Map(mapRef.current, {
      zoom: 2,
      center: { lat: 20, lng: 20 },
      mapTypeId: 'terrain'
    });
    mapInstance.current = map;

    const createMarkers = (list: any[], color: string) => {
      list?.forEach(p => {
        const coords = coordsGlobal[p.pays];
        if (coords) {
          new google.maps.Marker({
            position: coords,
            map,
            icon: { path: google.maps.SymbolPath.CIRCLE, scale: 5, fillColor: color, fillOpacity: 0.9, strokeWeight: 1, strokeColor: "white" }
          });
        }
      });
    };

    createMarkers(data.candidatures_promesses, "#ef4444"); // Rouge
    createMarkers(data.partenaires_plan_individuel, "#64748b"); // Ardoise (Nouveau)
    createMarkers(data.partenariat_global, "#8b5cf6"); // Violet
    createMarkers(data.partenariat_paix_membres, "#3b82f6"); // Bleu
    createMarkers(data.cooperation_istanbul, "#10b981"); // Vert
  }, [isReady, data]);

  if (!data) return <div className="p-10 text-center text-slate-500">Chargement des données...</div>;

  return (
    <div className="p-4 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => { if (typeof window.google !== 'undefined') setIsReady(true); }}
      />

      <header className="mb-8 border-b border-indigo-200 pb-6">
        <h1 className="text-4xl font-black text-indigo-950">🌍 {data.nom_liste}</h1>
        <p className="text-slate-500 mt-2 italic">Détail des {data.total} coopérations internationales</p>
      </header>

      <div ref={mapRef} style={{ height: "40vh" }} className="mb-10 shadow-xl rounded-3xl border-4 border-white bg-slate-200 overflow-hidden" />

      <div className="space-y-12">
        
        {/* 1. Candidatures et Promesses */}
        <section>
          <h2 className="text-2xl font-bold text-red-700 mb-4">🚀 Candidatures et Promesses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.candidatures_promesses?.map((p: any, i: number) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm border-t-4 border-red-500">
                <h3 className="font-bold text-lg">{p.pays}</h3>
                <p className="text-xs text-slate-500 italic mb-2">{p.statut}</p>
                <div className="text-[10px] space-y-1 text-slate-400">
                  <p>PPP: {p.ppp} | IPAP: {p.ipap}</p>
                  <p>MAP: {p.map}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. NOUVEAU : Partenaires Plan d'action individuel (IPAP) */}
        <section>
          <h2 className="text-2xl font-bold text-slate-700 mb-4">📋 Plan d'action individuel (IPAP)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {data.partenaires_plan_individuel?.map((p: any, i: number) => (
              <div key={i} className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-800">{p.pays}</span>
                <span className="text-[10px] bg-white px-2 py-1 rounded shadow-sm font-mono text-slate-500 uppercase">Partenaire IPAP</span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Partenariats Globaux */}
        <section>
          <h2 className="text-2xl font-bold text-purple-700 mb-4">🌐 Partenariat Global</h2>
          <div className="flex flex-wrap gap-3">
            {data.partenariat_global?.map((p: any, i: number) => (
              <span key={i} className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-bold text-sm">
                {p.pays}
              </span>
            ))}
          </div>
        </section>

        {/* 4. Partenariat pour la Paix (PPP) */}
        <section>
          <h2 className="text-2xl font-bold text-blue-700 mb-4">🕊️ Partenariat pour la Paix</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {data.partenariat_paix_membres?.map((p: any, i: number) => (
              <div key={i} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                <div className="font-bold text-slate-800">{p.pays}</div>
                <div className={`text-[10px] font-semibold ${p.statut.includes('Suspendue') ? 'text-red-500' : 'text-blue-500'}`}>
                  {p.statut}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Dialogue Méditerranéen & Istanbul */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <section>
            <h2 className="text-2xl font-bold text-amber-600 mb-4">☀️ Dialogue Méditerranéen</h2>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100">
              <ul className="grid grid-cols-2 gap-2">
                {data.dialogue_mediterraneen?.map((p: any, i: number) => (
                  <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span> {p.pays}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-emerald-600 mb-4">🕌 Coopération d'Istanbul (ICI)</h2>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100">
              <ul className="grid grid-cols-2 gap-2">
                {data.cooperation_istanbul?.map((p: any, i: number) => (
                  <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> {p.pays}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}