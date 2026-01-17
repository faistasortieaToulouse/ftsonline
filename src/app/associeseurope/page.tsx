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

export default function AssociesEuropePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  const [territoires, setTerritoires] = useState<Territoire[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetch("/api/associeseurope") // Appel à votre nouvelle route
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
  }, []);

  useEffect(() => {
    if (!isReady || !mapRef.current || territoires.length === 0) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 3,
      center: { lat: 25, lng: 10 },
      scrollwheel: true,
      gestureHandling: "greedy",
      mapTypeId: 'terrain',
      styles: [{ featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#1e3a8a" }, { weight: 1 }] }]
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
          fillColor: "#1e3a8a", 
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff",
        }
      });

      const infowindow = new google.maps.InfoWindow({
        content: `
          <div style="color: black; padding: 5px; font-family: sans-serif; max-width: 200px;">
            <strong style="font-size: 14px;">#${index + 1} - ${t.nom}</strong><br>
            <span style="color: #1e3a8a; font-size: 10px; text-transform: uppercase; font-weight: bold;">${t.statut}</span>
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
          🇪🇺 États et Territoires Associés à l'UE
        </h1>
        <p className="text-gray-600 mt-2 italic">Analyse des statuts fiscaux et douaniers des dépendances européennes</p>
      </header>

      <div ref={mapRef} style={{ height: "60vh", width: "100%" }} className="mb-8 border-4 border-white shadow-2xl rounded-3xl bg-slate-200 overflow-hidden" />

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