'use client';

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Globe2, Anchor, MapPin, ChevronRight, Info } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface Territoire {
  nom: string;
  statut: string;
  continent: string;
  lat: number;
  lng: number;
  description: string;
}

export default function AssociesEuropePage() {
  const [territoires, setTerritoires] = useState<Territoire[]>([]);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetch("/api/associeseurope")
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
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current!).setView([15, 10], 2);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance.current);

      setTimeout(() => {
        mapInstance.current.invalidateSize();
        setIsReady(true);
      }, 500);
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
    if (!isReady || !mapInstance.current || territoires.length === 0) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;

      territoires.forEach((t, index) => {
        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div style="
              background-color: #1e3a8a;
              color: white;
              width: 28px;
              height: 28px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 2px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              font-weight: 900;
              box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            ">
              <span style="transform: rotate(45deg);">${index + 1}</span>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 28]
        });

        const marker = L.marker([t.lat, t.lng], { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: sans-serif; padding: 5px; min-width: 180px;">
            <div style="font-[900] text-[10px] color: #1e3a8a; text-transform: uppercase; letter-spacing: 1px;">Territoire Associé</div>
            <strong style="font-size: 16px; color: #0f172a; display: block; margin: 4px 0;">${t.nom}</strong>
            <div style="background: #eff6ff; color: #1d4ed8; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; display: inline-block;">
              ${t.statut}
            </div>
            <p style="margin-top: 10px; font-size: 12px; color: #475569; line-height: 1.5;">${t.description}</p>
          </div>
        `);
        marker.addTo(mapInstance.current);
        markersRef.current.set(t.nom, marker);
      });
    };

    updateMarkers();
  }, [isReady, territoires]);

  const jumpToLocation = (t: Territoire) => {
    const marker = markersRef.current.get(t.nom);
    if (mapInstance.current && marker) {
      mapInstance.current.flyTo([t.lat, t.lng], 5, { duration: 2 });
      marker.openPopup();
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <nav className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-800 hover:text-blue-900 font-black uppercase text-[10px] tracking-widest transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Portail International
        </Link>
      </nav>

      <header className="mb-10 bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full -mr-48 -mt-48 -z-0"></div>
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-black text-blue-900 uppercase tracking-tighter italic leading-none">
            Régions & <span className="text-blue-600 italic underline decoration-blue-200 underline-offset-8">Associés</span>
          </h1>
          <p className="text-slate-400 font-bold text-xs md:text-sm uppercase tracking-[0.2em] mt-6 flex items-center gap-3">
            <Anchor size={18} className="text-blue-500" /> Analyse des Outre-mer et Dépendances Européennes
          </p>
        </div>
      </header>

      {/* CARTE */}
      <div className="relative w-full mb-16 border-4 border-white shadow-2xl rounded-[3rem] bg-slate-200 overflow-hidden z-0" style={{ height: "65vh" }}>
        <div ref={mapRef} className="h-full w-full" />
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/90 z-10 backdrop-blur-md">
            <Loader2 className="animate-spin text-blue-900 mb-4" size={48} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 animate-pulse">Scanning Global Coordinates...</p>
          </div>
        )}
      </div>

      {/* SECTIONS PAR CONTINENT */}
      <div className="space-y-20">
        {["Europe", "Afrique", "Amérique", "Asie", "Antarctique", "Océanie"].map((continent) => {
          const list = territoires.filter(t => t.continent === continent);
          if (list.length === 0) return null;

          return (
            <section key={continent} className="relative">
              <div className="flex items-center gap-4 mb-10">
                <div className="bg-blue-900 text-white p-3 rounded-2xl shadow-lg">
                  <Globe2 size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900">{continent}</h2>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{list.length} Localisations enregistrées</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {list.map((t) => {
                  const globalIndex = territoires.indexOf(t);
                  return (
                    <div 
                      key={t.nom} 
                      onClick={() => jumpToLocation(t)}
                      className="group cursor-pointer bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all duration-500 relative flex flex-col h-full"
                    >
                      <div className="flex justify-between items-start mb-6">
                         <span className="bg-slate-100 text-slate-400 group-hover:bg-blue-900 group-hover:text-white px-4 py-1 rounded-xl font-black text-[10px] transition-all">
                            {(globalIndex + 1).toString().padStart(2, '0')}
                         </span>
                         <div className="text-blue-200 group-hover:text-blue-500 transition-colors">
                            <MapPin size={20} />
                         </div>
                      </div>

                      <div className="flex-grow">
                        <h3 className="font-black text-slate-900 text-xl uppercase tracking-tighter mb-2 group-hover:text-blue-800 transition-colors">{t.nom}</h3>
                        <div className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.1em] text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-4">
                          <Info size={10} /> {t.statut}
                        </div>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed italic group-hover:text-slate-700 transition-colors">
                          "{t.description}"
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-600">
                        <span>Voir sur la carte</span>
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <footer className="mt-24 p-12 bg-slate-900 rounded-[3rem] text-center">
         <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.5em]">Observatoire de la territorialité européenne — 2026</p>
      </footer>

      <style jsx global>{`
        .custom-div-icon { background: none !important; border: none !important; }
        .leaflet-popup-content-wrapper { border-radius: 2rem; border: 4px solid #1e3a8a; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
        .leaflet-popup-tip { background: #1e3a8a; }
      `}</style>
    </div>
  );
}
