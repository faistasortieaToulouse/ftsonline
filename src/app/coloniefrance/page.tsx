'use client';

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface Colonie {
  grande_entite: string;
  territoire: string;
  periode: string;
  lat: number;
  lng: number;
}

export default function ColonieFrancePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  const [colonies, setColonies] = useState<Colonie[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetch("/api/coloniefrance")
      .then(async (res) => {
        const data = await res.json();
        if (Array.isArray(data)) {
          // Tri par Grande Entité puis par nom de territoire
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

  useEffect(() => {
    if (!isReady || !mapRef.current || colonies.length === 0) return;

    // Calcul du centre moyen pour la vue initiale
    const centerLat = colonies.reduce((sum, c) => sum + c.lat, 0) / colonies.length;
    const centerLng = colonies.reduce((sum, c) => sum + c.lng, 0) / colonies.length;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 4,
      center: { lat: centerLat, lng: centerLng },
      scrollwheel: true,
      gestureHandling: "greedy",
      mapTypeId: 'terrain'
    });

    colonies.forEach((c, index) => {
      const marker = new google.maps.Marker({
        map: mapInstance.current!,
        position: { lat: c.lat, lng: c.lng },
        title: c.territoire,
        label: {
          text: (index + 1).toString(),
          color: "white",
          fontSize: "10px",
          fontWeight: "bold"
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#1e3a8a", 
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff",
        }
      });

      const infowindow = new google.maps.InfoWindow({
        content: `
          <div style="color: black; padding: 5px; font-family: sans-serif; max-width: 220px;">
            <strong style="font-size: 14px;">#${index + 1} - ${c.territoire}</strong><br>
            <span style="color: #b91c1c; font-size: 11px; font-weight: bold;">${c.periode}</span><br>
            <span style="color: #666; font-size: 10px; text-transform: uppercase;">${c.grande_entite}</span>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infowindow.open(mapInstance.current, marker);
      });
    });
  }, [isReady, colonies]);

  // Grouper les données pour l'affichage de la liste
  const entites = Array.from(new Set(colonies.map(c => c.grande_entite)));

  return (
    <div className="p-4 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <header className="mb-8 border-b pb-6">
        <h1 className="text-4xl font-black text-blue-900 flex items-center gap-3">
          ⚜️ Anciennes Colonies de la France
        </h1>
        <p className="text-gray-600 mt-2 italic">Chronologie et géographie du premier empire colonial</p>
      </header>

      <div
        ref={mapRef}
        style={{ height: "65vh", width: "100%" }}
        className="mb-8 border-4 border-white shadow-xl rounded-3xl bg-slate-200 overflow-hidden"
      >
        {!isReady && (
          <div className="flex items-center justify-center h-full">
            <p className="animate-pulse font-bold text-blue-600">Initialisation de la carte coloniale...</p>
          </div>
        )}
      </div>

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