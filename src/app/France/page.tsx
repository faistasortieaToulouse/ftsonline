'use client';

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface Territoire {
  nom: string;
  statut: string;
  continent: string;
  lat: number;
  lng: number;
  description: string;
}

export default function FranceTerritoiresPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  const [territoires, setTerritoires] = useState<Territoire[]>([]);
  const [isReady, setIsReady] = useState(false);

  // --- 1. Charger et Trier les données ---
  useEffect(() => {
    fetch("/api/France")
      .then(async (res) => {
        const data = await res.json();
        if (Array.isArray(data)) {
          // Ordre d'affichage des sections
          const ordreContinents = ["Europe", "Afrique", "Amérique", "Asie", "Antarctique", "Océanie"];
          
          // TRI DOUBLE : Par continent d'abord, puis alphabétique par NOM
          const sorted = data.sort((a, b) => {
            // Si les continents sont différents, on suit l'ordre défini
            if (a.continent !== b.continent) {
              return ordreContinents.indexOf(a.continent) - ordreContinents.indexOf(b.continent);
            }
            // Si c'est le même continent, tri alphabétique sur le nom
            return a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' });
          });
          
          setTerritoires(sorted);
        }
      })
      .catch(console.error);
  }, []);

  // --- 2. Initialisation de la carte ---
  useEffect(() => {
    if (!isReady || !mapRef.current || territoires.length === 0) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 3,
      center: { lat: 25, lng: 10 },
      scrollwheel: true,
      gestureHandling: "greedy",
      mapTypeId: 'terrain'
    });

    territoires.forEach((t, index) => {
      const marker = new google.maps.Marker({
        map: mapInstance.current!,
        position: { lat: t.lat, lng: t.lng },
        title: t.nom,
        label: {
          text: (index + 1).toString(),
          color: "white",
          fontSize: "10px",
          fontWeight: "bold"
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 11,
          fillColor: t.continent === "Europe" ? "#1e3a8a" : "#ef4444", 
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff",
        }
      });

      const infowindow = new google.maps.InfoWindow({
        content: `
          <div style="color: black; padding: 5px; font-family: sans-serif; max-width: 200px;">
            <strong style="font-size: 14px;">#${index + 1} - ${t.nom}</strong><br>
            <span style="color: #666; font-size: 10px; text-transform: uppercase; font-weight: bold;">${t.statut}</span>
            <p style="margin-top:8px; font-size: 12px; line-height: 1.4;">${t.description}</p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infowindow.open(mapInstance.current, marker);
      });
    });
  }, [isReady, territoires]);

  return (
    <div className="p-4 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <header className="mb-8 border-b pb-6">
        <h1 className="text-4xl font-black text-blue-900 flex items-center gap-3">
          🇫🇷 Territoires et Domaines Français
        </h1>
        <p className="text-gray-600 mt-2 italic">Numérotation indexée sur le tri par continent puis alphabétique</p>
      </header>

      {/* --- Carte --- */}
      <div
        ref={mapRef}
        style={{ height: "65vh", width: "100%" }}
        className="mb-8 border-4 border-white shadow-2xl rounded-3xl bg-slate-200 overflow-hidden"
      >
        {!isReady && (
          <div className="flex items-center justify-center h-full bg-slate-100">
            <p className="animate-pulse font-bold text-blue-600">Initialisation des marqueurs...</p>
          </div>
        )}
      </div>

      {/* --- Liste organisée --- */}
      <div className="space-y-12">
        {["Europe", "Afrique", "Amérique", "Asie", "Antarctique", "Océanie"].map((continent) => {
          // On filtre la liste déjà triée globalement
          const list = territoires.filter(t => t.continent === continent);
          if (list.length === 0) return null;

          return (
            <section key={continent} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black mb-6 text-blue-900 flex items-center justify-between">
                <span>{continent}</span>
                <span className="text-sm font-normal bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                  {list.length} lieux
                </span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {list.map((t) => {
                  // On récupère l'index global pour faire le lien avec la carte
                  const globalIndex = territoires.indexOf(t);
                  return (
                    <div key={t.nom} className="group p-4 bg-slate-50 rounded-xl hover:bg-blue-900 transition-all duration-300 flex gap-4 border border-transparent hover:border-blue-700">
                      <span className="text-3xl font-black text-slate-300 group-hover:text-blue-400/50 transition-colors">
                        {(globalIndex + 1).toString().padStart(2, '0')}
                      </span>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-white transition-colors">{t.nom}</h3>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 group-hover:text-blue-300 mt-1">
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