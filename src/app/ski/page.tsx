'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mountain, MapPin, Navigation, Snowflake, Zap } from "lucide-react";
import 'leaflet/dist/leaflet.css';

export default function SkiPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [data, setData] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetch("/api/ski")
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || mapInstance.current) return;
      const L = (await import('leaflet')).default;

      mapInstance.current = L.map(mapRef.current).setView([42.9, 1.0], 8);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(mapInstance.current);

      setIsReady(true);
    };
    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Marqueurs numérotés pour le ski (Couleur Indigo/Violet)
  useEffect(() => {
    if (!isReady || !mapInstance.current || !data) return;

    const addMarkers = async () => {
      const L = (await import('leaflet')).default;
      const markersGroup = L.featureGroup();
      let globalCounter = 1;

      // On parcourt les départements, puis les catégories (Alpin, Nordique...)
      Object.values(data).forEach((departement: any) => {
        Object.values(departement).forEach((stations: any) => {
          stations.forEach((station: any) => {
            if (station.lat && station.lng) {
              const numberIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="background-color:#4f46e5; color:white; border-radius:8px; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-weight:bold; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3); font-size:12px; transform: rotate(45deg);"><span style="transform: rotate(-45deg);">${globalCounter}</span></div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14]
              });

              const marker = L.marker([station.lat, station.lng], { icon: numberIcon });
              marker.bindPopup(`<strong>#${globalCounter} - ${station.nom}</strong>`);
              marker.addTo(markersGroup);
              globalCounter++;
            }
          });
        });
      });
      
      markersGroup.addTo(mapInstance.current);
      mapInstance.current.fitBounds(markersGroup.getBounds(), { padding: [50, 50] });
    };
    addMarkers();
  }, [isReady, data]);

  let displayCounter = 1;

  if (!data) return null;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900">
      
      <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 transition-colors font-medium">
        <ArrowLeft size={18} /> Retour
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl md:text-5xl font-black flex items-center gap-3 text-slate-900">
          <Mountain className="text-indigo-500" size={36} /> Stations <span className="text-indigo-600">de Ski</span>
        </h1>
        <p className="text-slate-500 mt-2 italic">Pyrénées : Ariège, Haute-Garonne et Hautes-Pyrénées.</p>
      </header>

      <div ref={mapRef} className="h-[45vh] w-full mb-12 border-4 border-white shadow-xl rounded-3xl bg-indigo-50" />

      {Object.entries(data).map(([deptName, categories]: [string, any]) => (
        <section key={deptName} className="mb-20">
          <h2 className="text-3xl font-black text-slate-800 mb-10 border-l-8 border-indigo-500 pl-4 uppercase tracking-tighter">
            {deptName.replace('-', ' ')}
          </h2>

          {Object.entries(categories).map(([catName, stations]: [string, any]) => (
            <div key={catName} className="mb-12">
              <h3 className="text-lg font-bold text-indigo-400 mb-6 flex items-center gap-2 uppercase tracking-widest text-sm">
                <Snowflake size={16} /> {catName.replace(/_/g, ' ')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stations.map((station: any, i: number) => {
                  const currentNum = displayCounter++;
                  return (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-indigo-300 transition-all group">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <span className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-200">
                            {currentNum}
                          </span>
                          <a 
                            href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`}
                            target="_blank"
                            className="text-slate-300 hover:text-indigo-600 transition-colors"
                          >
                            <Navigation size={20} />
                          </a>
                        </div>

                        <h4 className="text-xl font-bold text-slate-900 mb-1">{station.nom}</h4>
                        {station.taille && (
                          <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded uppercase mb-3 inline-block">
                            {station.taille}
                          </span>
                        )}

                        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                          {station.description}
                        </p>

                        {station.le_plus && (
                          <div className="flex items-start gap-2 bg-amber-50 p-3 rounded-xl text-amber-800 text-xs">
                            <Zap size={14} className="shrink-0 mt-0.5" />
                            <p><strong>Le + :</strong> {station.le_plus}</p>
                          </div>
                        )}

                        {station.activites && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {station.activites.map((act: string) => (
                              <span key={act} className="text-[10px] border border-slate-200 px-2 py-0.5 rounded-full text-slate-500">
                                {act}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
