'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Umbrella, MapPin, Navigation, Info } from "lucide-react";
import 'leaflet/dist/leaflet.css';

interface PlageDetail {
  nom: string;
  details: string;
}

interface Station {
  ville: string;
  departement: string;
  lat: number;
  lng: number;
  description: string;
  plages: PlageDetail[];
}

export default function PlagesPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [data, setData] = useState<Record<string, Station[]>>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetch("/api/plages")
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || mapInstance.current) return;
      const L = (await import('leaflet')).default;

      mapInstance.current = L.map(mapRef.current).setView([43.1, 3.1], 8);

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

  useEffect(() => {
    if (!isReady || !mapInstance.current || Object.keys(data).length === 0) return;

    const addMarkers = async () => {
      const L = (await import('leaflet')).default;
      const markersGroup = L.featureGroup();
      let globalCounter = 1;

      Object.entries(data).forEach(([dept, stations]) => {
        stations.forEach((station) => {
          const numberIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color:#0ea5e9; color:white; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-weight:bold; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3); font-size:12px;">${globalCounter}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          const marker = L.marker([station.lat, station.lng], { icon: numberIcon });
          marker.bindPopup(`<strong>#${globalCounter} - ${station.ville}</strong>`);
          marker.addTo(markersGroup);
          globalCounter++;
        });
      });
      
      markersGroup.addTo(mapInstance.current);
      mapInstance.current.fitBounds(markersGroup.getBounds(), { padding: [50, 50] });
    };
    addMarkers();
  }, [isReady, data]);

  let displayCounter = 1;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900">
      
      <Link href="/" className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-800 mb-6 transition-colors font-medium">
        <ArrowLeft size={18} /> Retour
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl md:text-5xl font-black flex items-center gap-3">
          <Umbrella className="text-sky-500" size={36} /> Plages <span className="text-sky-600">& Littoral</span>
        </h1>
        <p className="text-slate-500 mt-2 italic">Le littoral d'Occitanie, de l'Aude aux Pyrénées-Orientales.</p>
      </header>

      <div ref={mapRef} className="h-[40vh] md:h-[50vh] w-full mb-12 border-4 border-white shadow-xl rounded-3xl bg-slate-100 overflow-hidden" />

      {Object.entries(data).map(([dept, stations]) => (
        <section key={dept} className="mb-16">
          <h2 className="text-2xl font-bold text-sky-900 mb-8 border-b-2 border-sky-100 pb-2 flex items-center gap-3">
            {dept}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {stations.map((station, i) => {
              const currentNum = displayCounter++;
              return (
                <div key={i} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-sky-600 font-black text-xl mr-2">#{currentNum}</span>
                        <h3 className="text-xl font-bold inline">{station.ville}</h3>
                      </div>
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`}
                        target="_blank"
                        className="p-2 bg-slate-100 rounded-full hover:bg-sky-600 hover:text-white transition-colors"
                      >
                        <Navigation size={18} />
                      </a>
                    </div>

                    <p className="text-slate-600 text-sm mb-6 bg-slate-50 p-3 rounded-xl border-l-4 border-sky-400 italic">
                      "{station.description}"
                    </p>

                    <div className="space-y-4">
                      <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Info size={14} /> Les différentes plages
                      </h4>
                      {station.plages.map((p, idx) => (
                        <div key={idx} className="pl-4 border-l-2 border-slate-100">
                          <p className="font-bold text-slate-800 text-sm">{p.nom}</p>
                          <p className="text-xs text-slate-500 leading-relaxed">{p.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
