"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";

export default function FrancaisAutresPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Calcul des totaux
  const totalPopulation = data.reduce((acc, curr) => acc + (curr.population_totale || 0), 0);
  const totalFrancophones = data.reduce((acc, curr) => acc + (curr.nombre_francophones || 0), 0);
  const totalExpatries = data.reduce((acc, curr) => acc + (curr.expatries_francais || 0), 0);

  useEffect(() => {
    fetch("/api/francaisautres")
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json)) {
          const cleaned = json.map((item) => {
            const p = item.population_totale || 0;
            const f = item.nombre_francophones || 0;
            const calculPourcentage = p > 0 ? ((f / p) * 100).toFixed(2) : "0";

            return {
              ...item,
              pourcentage: item.pourcentage ? item.pourcentage.replace('%', '').trim() : calculPourcentage
            };
          })
          .sort((a, b) => b.nombre_francophones - a.nombre_francophones);

          setData(cleaned);
        }
      });
  }, []);

  useEffect(() => {
    if (!isReady || !mapRef.current || data.length === 0) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 2.2,
      center: { lat: 15, lng: 10 },
      styles: [
        { featureType: "administrative", elementType: "labels", visibility: "on" },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#f0f4f8" }] }
      ]
    });

    const geocoder = new google.maps.Geocoder();

    data.forEach((item, i) => {
      if (item.nombre_francophones <= 0) return;

      setTimeout(() => {
        geocoder.geocode({ address: item.pays }, (results, status) => {
          if (status === "OK" && results?.[0]) {
            const size = Math.max(12, Math.log(item.nombre_francophones + 1) * 2.5);
            
            new google.maps.Marker({
              map: mapInstance.current!,
              position: results[0].geometry.location,
              label: {
                text: `${i + 1}`,
                color: "white",
                fontSize: "10px",
                fontWeight: "bold"
              },
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: size,
                fillColor: "#ef4444",
                fillOpacity: 0.7,
                strokeWeight: 1.5,
                strokeColor: "white",
              },
              title: `${item.pays}`
            });
          }
        });
      }, i * 200);
    });
  }, [isReady, data]);

  return (
    <div className="min-h-screen bg-white p-4 md:p-10 font-sans text-slate-900">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        onLoad={() => setIsReady(true)}
      />

      <div className="max-w-7xl mx-auto">
        {/* EN-TÊTE */}
        <div className="flex justify-between items-end mb-8 border-b-8 border-slate-900 pb-4">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter italic">Pays où il y a des Francophones en-dehors de la Francophonie</h1>
            <p className="text-red-600 font-bold uppercase tracking-widest text-sm">Pays non-membres de l'OIF</p>
          </div>
          <div className="text-right hidden md:block">
            <span className="text-xs font-bold text-slate-400 block italic">Données : Recensements & Estimations</span>
          </div>
        </div>

        {/* CARTE (En haut pour la vue d'ensemble) */}
        <div ref={mapRef} className="h-[500px] w-full bg-slate-100 rounded-3xl mb-12 shadow-inner border border-slate-200" />

        {/* TABLEAU DE DÉTAILS */}
        <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2 text-slate-700">
          <span className="w-8 h-1 bg-red-600"></span> Détails par pays
        </h2>
        <div className="overflow-x-auto shadow-2xl rounded-xl border border-slate-200 mb-12">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white text-[11px] uppercase tracking-widest">
              <tr>
                <th className="p-5 text-center w-24 bg-red-700">Rang</th>
                <th className="p-5">Pays / Territoire</th>
                <th className="p-5 text-right">Population</th>
                <th className="p-5 text-right text-red-300">Francophones</th>
                <th className="p-5 text-right text-blue-300">Expatriés FR</th>
                <th className="p-5 text-center bg-slate-800">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item, index) => (
                <tr key={index} className="hover:bg-red-50/30 transition-colors group text-sm">
                  <td className="p-4 text-center font-black text-slate-300 group-hover:text-red-600 border-r border-slate-50">
                    {index + 1}
                  </td>
                  <td className="p-4 font-bold text-slate-800 uppercase italic">
                    {item.pays}
                  </td>
                  <td className="p-4 text-right font-mono text-slate-500">
                    {item.population_totale.toLocaleString()}
                  </td>
                  <td className="p-4 text-right font-black text-red-700">
                    {item.nombre_francophones.toLocaleString()}
                  </td>
                  <td className="p-4 text-right font-bold text-blue-700">
                    {item.expatries_francais ? item.expatries_francais.toLocaleString() : "—"}
                  </td>
                  <td className="p-4 text-center font-bold text-slate-900 bg-slate-50">
                    {item.pourcentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* RÉSUMÉ GLOBAL (PLOMBÉ EN BAS) */}
        <div className="border-t-4 border-slate-100 pt-10">
            <h2 className="text-xl font-black uppercase mb-6 text-center text-slate-800 italic underline decoration-red-600 underline-offset-8">
                Synthèse cumulative hors-OIF
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-slate-900 p-8 rounded-2xl text-white shadow-xl flex flex-col items-center">
                    <p className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-2">Population Globale</p>
                    <p className="text-4xl font-black">{totalPopulation.toLocaleString()}</p>
                </div>
                <div className="bg-red-600 p-8 rounded-2xl text-white shadow-xl flex flex-col items-center">
                    <p className="text-red-200 uppercase text-xs font-bold tracking-widest mb-2">Masse Francophone</p>
                    <p className="text-4xl font-black">{totalFrancophones.toLocaleString()}</p>
                </div>
                <div className="bg-blue-600 p-8 rounded-2xl text-white shadow-xl flex flex-col items-center">
                    <p className="text-blue-100 uppercase text-xs font-bold tracking-widest mb-2">Cumul Expatriés</p>
                    <p className="text-4xl font-black">{totalExpatries.toLocaleString()}</p>
                </div>
            </div>
            <p className="text-center text-xs text-slate-400 uppercase font-bold tracking-widest mb-10">
                Fin du rapport
            </p>
        </div>
      </div>
    </div>
  );
}