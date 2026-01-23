"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function FrancophonieGlobalePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Calcul des totaux pour le résumé final
  const totalPopulation = data.reduce((acc, curr) => acc + curr.population_totale, 0);
  const totalFrancophones = data.reduce((acc, curr) => acc + curr.nombre_francophones, 0);

  useEffect(() => {
    // N'oubliez pas de vérifier si l'URL est bien /api/francophonie ou /api/francais/francophonie selon votre dossier
    fetch("/api/francophonie") 
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json)) {
          const cleaned = json.map(item => {
            let p = item.population_totale;
            let f = item.nombre_francophones;

            // Corrections spécifiques
            if (item.id === 7) { f = 40000; }               // Corée du Sud
            if (item.id === 8) { f = 100000; }              // Argentine
            if (item.id === 87) { p = 4660000; f = 115000; } // Louisiane
            if (item.id === 88) { p = 515000; f = 67000; }   // Malte
            if (item.id === 86) { p = 5033000; f = 612000; } // Irlande
            if (item.id === 85) { p = 2487000; f = 450000; } // Gambie

            const uniqueName = Array.from(new Set(item.pays.split(' '))).join(' ');
            
            // Calcul du pourcentage individuel
            const pourcentage = p > 0 ? ((f / p) * 100).toFixed(1) : "0";

            return { 
              ...item, 
              pays: uniqueName, 
              population_totale: p, 
              nombre_francophones: f,
              pourcentage: pourcentage
            };
          })
          .sort((a, b) => b.population_totale - a.population_totale);

          setData(cleaned);
        }
      });
  }, []);

  useEffect(() => {
    if (!isReady || !mapRef.current || data.length === 0) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 2.8,
      center: { lat: 20, lng: 0 },
      styles: [
        { featureType: "administrative", elementType: "labels", visibility: "on" },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#e9e9e9" }] }
      ]
    });

    const geocoder = new google.maps.Geocoder();

    data.forEach((item, i) => {
      if (item.population_totale <= 0) return;

      setTimeout(() => {
        geocoder.geocode({ address: item.pays }, (results, status) => {
          if (status === "OK" && results?.[0]) {
            const size = Math.max(15, Math.log(item.nombre_francophones + 1) * 2);
            
            new google.maps.Marker({
              map: mapInstance.current!,
              position: results[0].geometry.location,
              label: {
                text: `${i + 1}`,
                color: "white",
                fontSize: "11px",
                fontWeight: "bold"
              },
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: size,
                fillColor: item.statut === "membre" ? "#2563eb" : "#059669",
                fillOpacity: 0.8,
                strokeWeight: 2,
                strokeColor: "white",
              },
              title: `${item.pays} (${item.pourcentage}%)`
            });
          }
        });
      }, i * 150);
    });
  }, [isReady, data]);

  return (
    <div className="min-h-screen bg-white p-4 md:p-10 font-sans">
      
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
        {/* EN-TÊTE */}
        <div className="flex justify-between items-end mb-8 border-b-8 border-slate-900 pb-4">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900">Francophonie</h1>
            <p className="text-blue-600 font-bold uppercase tracking-widest text-sm">Espace Global (Tri Population)</p>
          </div>
          <div className="text-right hidden md:block">
            <span className="text-xs font-bold text-slate-400 block italic">Source : OIF / Estimations</span>
          </div>
        </div>

        {/* CARTE */}
        <div ref={mapRef} className="h-[550px] w-full bg-slate-100 rounded-3xl mb-12 shadow-inner border border-slate-200" />

        {/* TABLEAU AVEC NOUVELLE COLONNE */}
        <div className="overflow-x-auto shadow-2xl rounded-xl border border-slate-200 mb-10">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white text-[11px] uppercase tracking-widest">
              <tr>
                <th className="p-5 text-center w-24 bg-blue-700">Rang</th>
                <th className="p-5">Pays / Entité</th>
                <th className="p-5 text-center">Statut</th>
                <th className="p-5 text-right">Population Totale</th>
                <th className="p-5 text-right text-blue-300">Francophones</th>
                <th className="p-5 text-center bg-slate-800">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group text-sm">
                  <td className="p-4 text-center font-black text-slate-300 group-hover:text-blue-600 border-r border-slate-50">
                    {index + 1}
                  </td>
                  <td className="p-4 font-bold text-slate-800 uppercase">
                    {item.pays}
                  </td>
                  <td className="p-4 text-center text-[10px] font-black italic text-slate-400 uppercase">
                    {item.statut}
                  </td>
                  <td className="p-4 text-right font-mono text-slate-600 bg-slate-50/50">
                    {item.population_totale.toLocaleString()}
                  </td>
                  <td className="p-4 text-right font-black text-blue-700">
                    {item.nombre_francophones.toLocaleString()}
                  </td>
                  <td className="p-4 text-center font-bold text-emerald-600 bg-slate-50">
                    {item.pourcentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* RÉSUMÉ GLOBAL (TOTAL) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900 p-8 rounded-2xl text-white shadow-xl">
            <p className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-2">Population Totale OIF</p>
            <p className="text-4xl font-black">{totalPopulation.toLocaleString()}</p>
          </div>
          <div className="bg-blue-600 p-8 rounded-2xl text-white shadow-xl">
            <p className="text-blue-200 uppercase text-xs font-bold tracking-widest mb-2">Total Francophones</p>
            <p className="text-4xl font-black">{totalFrancophones.toLocaleString()}</p>
          </div>
          <div className="bg-emerald-600 p-8 rounded-2xl text-white shadow-xl">
            <p className="text-emerald-100 uppercase text-xs font-bold tracking-widest mb-2">Taux Moyen Global</p>
            <p className="text-4xl font-black">{totalPopulation > 0 ? ((totalFrancophones / totalPopulation) * 100).toFixed(1) : 0}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
