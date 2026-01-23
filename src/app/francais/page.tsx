"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function FrancophonieMapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);

  // 1. Charger, nettoyer et trier les données par population
  useEffect(() => {
    fetch("/api/francais")
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json)) {
          const cleaned = json.map(item => {
            let p = item.population_totale;
            let f = item.nombre_francophones;
            // Correction Louisiane et Malte
            if (item.id === 49) { p = 4660000; f = 115000; }
            if (item.id === 50) { p = 515000; f = 67000; }
            
            // Nettoyage des noms (supprime les doublons comme "France France")
            const uniqueName = Array.from(new Set(item.pays.split(' '))).join(' ');
            
            return { ...item, pays: uniqueName, population_totale: p, nombre_francophones: f };
          }).sort((a, b) => b.population_totale - a.population_totale); // Tri population
          
          setData(cleaned);
        }
      });
  }, []);

  // 2. Initialiser la Carte Google Maps
  useEffect(() => {
    if (!isReady || !mapRef.current || data.length === 0) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 3,
      center: { lat: 15, lng: 10 }, 
      scrollwheel: true,
      gestureHandling: "greedy",
      mapTypeControl: false,
      streetViewControl: false,
    });

    const geocoder = new google.maps.Geocoder();

    data.forEach((item, i) => {
      setTimeout(() => {
        geocoder.geocode({ address: item.pays }, (results, status) => {
          if (status === "OK" && results?.[0]) {
            // Calcul de la taille du cercle (logarithmique pour équilibrer les écarts)
            const circleSize = Math.max(14, Math.log(item.nombre_francophones + 1) * 2.2);

            const marker = new google.maps.Marker({
              map: mapInstance.current!,
              position: results[0].geometry.location,
              title: `${i + 1}. ${item.pays}`,
              // AJOUT DU NUMÉRO (RANG)
              label: {
                text: `${i + 1}`,
                color: "white",
                fontSize: circleSize > 20 ? "13px" : "10px",
                fontWeight: "bold",
              },
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: circleSize,
                fillColor: "#1d4ed8", // Bleu royal
                fillOpacity: 0.8,
                strokeWeight: 2,
                strokeColor: "#ffffff",
              },
            });

            const infowindow = new google.maps.InfoWindow({
              content: `
                <div style="color:#1e293b; padding:8px; font-family:sans-serif;">
                  <div style="font-size:10px; font-weight:900; color:#64748b; text-transform:uppercase; letter-spacing:0.05em;">Rang ${i+1}</div>
                  <div style="font-size:16px; font-weight:900; text-transform:uppercase; margin-bottom:4px;">${item.pays}</div>
                  <div style="font-size:12px;">Population: <strong>${item.population_totale.toLocaleString()}</strong></div>
                  <div style="font-size:12px; color:#2563eb;">Francophones: <strong>${item.nombre_francophones.toLocaleString()}</strong></div>
                </div>
              `,
            });

            marker.addListener("click", () => infowindow.open(mapInstance.current, marker));
          }
        });
      }, i * 120); 
    });
  }, [isReady, data]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        onLoad={() => setIsReady(true)}
      />

      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
            Pays où le français est langue officielle ou associée
          </h1>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Localisation par poids démographique</p>
        </header>

        {/* --- CARTE --- */}
        <div 
          ref={mapRef} 
          className="h-[600px] w-full rounded-3xl shadow-2xl border-8 border-white mb-10 bg-slate-200 overflow-hidden"
        >
          {!isReady && (
            <div className="h-full w-full flex items-center justify-center bg-slate-100">
                <p className="animate-pulse font-black text-slate-400">CHARGEMENT DU GLOBE...</p>
            </div>
          )}
        </div>

        {/* --- TABLEAU --- */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
             <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-widest">
                        <th className="p-4 border-r border-slate-800 text-center w-20">Rang</th>
                        <th className="p-4">Pays / Entité</th>
                        <th className="p-4 text-right">Population Totale</th>
                        <th className="p-4 text-right bg-blue-900">Francophones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.slice(0, 20).map((item, index) => (
                        <tr key={item.id} className="hover:bg-blue-50 transition-colors group">
                            <td className="p-4 text-center font-black text-slate-400 border-r border-slate-50 group-hover:text-blue-600">
                                {index + 1}
                            </td>
                            <td className="p-4 font-bold text-slate-800 uppercase text-sm">
                                {item.pays}
                            </td>
                            <td className="p-4 text-right font-mono text-sm text-slate-600">
                                {item.population_totale.toLocaleString()}
                            </td>
                            <td className="p-4 text-right font-black text-sm text-blue-700 bg-blue-50/30">
                                {item.nombre_francophones.toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
             <div className="bg-slate-50 p-4 text-center">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                    Utilisez les numéros sur la carte pour identifier les {data.length} zones
                </p>
             </div>
        </div>
      </div>
    </div>
  );
}
