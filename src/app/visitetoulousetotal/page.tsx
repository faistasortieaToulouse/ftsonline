'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react"; // Ajout de ChevronDown

interface Lieu {
  id: number;
  numero: string;
  type_voie: string;
  nom_voie: string;
  description: string;
  lat: number;
  lng: number;
}

export default function VisiteToulouseTotalPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [lieux, setLieux] = useState<Lieu[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [openDetailsId, setOpenDetailsId] = useState<number | null>(null);

  const toggleDetails = (id: number) => {
    setOpenDetailsId((prevId) => (prevId === id ? null : id));
  };

  useEffect(() => {
    fetch('/api/visitetoulousetotal')
      .then(res => res.json())
      .then(data => setLieux(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    // Changement ici : on s'assure que mapRef.current est vide avant d'init
    if (!isReady || !mapRef.current || lieux.length === 0) return;

    const center = {
      lat: lieux[0].lat || 43.6045,
      lng: lieux[0].lng || 1.444,
    };

    if (!mapInstance.current) {
      mapInstance.current = new google.maps.Map(mapRef.current, {
        zoom: 15,
        center,
        scrollwheel: true,
        gestureHandling: 'greedy',
        styles: [
          { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
        ]
      });
    }

    lieux.forEach((lieu, i) => {
      if (typeof lieu.lat !== 'number' || typeof lieu.lng !== 'number') return;

      const id = i + 1;
      const marker = new google.maps.Marker({
        map: mapInstance.current!,
        position: { lat: lieu.lat, lng: lieu.lng },
        label: {
          text: `${id}`,
          color: "white",
          fontWeight: "bold"
        },
        title: `${lieu.numero} ${lieu.type_voie} ${lieu.nom_voie}`,
      });

      const infowindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; font-family: sans-serif;">
            <strong style="color: #1e293b;">${id}. ${lieu.nom_voie}</strong><br/>
            <a href="#lieu-item-${id}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 10px; font-weight: bold; margin-top: 8px;">Voir détails ↓</a>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infowindow.open(mapInstance.current!, marker);
        toggleDetails(id);
        
        setTimeout(() => {
          document.getElementById(`lieu-item-${id}`)?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);
      });
    });
  }, [isReady, lieux]);

  return (
    <div className="p-4 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <header className="mb-8">
        <h1 className="text-3xl font-black mb-2 text-slate-900 tracking-tight leading-tight uppercase">
          🗺️ Toulouse : Monuments Actuels & Disparus
        </h1>
        <p className="text-slate-500 font-medium italic">Parcours historique complet — ({lieux.length} Lieux)</p>
      </header>

      {/* Conteneur Carte Corrigé */}
      <div className="mb-10 h-[65vh] border-4 border-white rounded-[2.5rem] bg-slate-200 relative z-0 overflow-hidden shadow-2xl">
        {/* La div de la carte doit être nue */}
        <div ref={mapRef} className="h-full w-full" />
        
        {/* Le loader est en absolute par-dessus la div de la carte */}
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 z-10">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-indigo-600 font-bold text-xs uppercase tracking-widest">Chargement de la carte...</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-black mb-6 text-slate-800 flex items-center gap-3">
        <span className="h-1.5 w-12 bg-indigo-600 rounded-full"></span>
        DÉTAILS DU PARCOURS
      </h2>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lieux.map((l, i) => {
          const id = i + 1;
          const isDetailsOpen = openDetailsId === id;

          return (
            <li
              key={l.id}
              id={`lieu-item-${id}`}
              onClick={() => toggleDetails(id)}
              className={`p-6 border-2 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col scroll-mt-24 ${
                isDetailsOpen
                  ? "bg-white border-indigo-400 shadow-xl scale-[1.01]"
                  : "bg-white border-white shadow-sm hover:border-indigo-100 hover:shadow-md"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <p className="text-lg font-bold text-slate-900 leading-tight flex-grow pr-4">
                  <span className={`mr-2 transition-colors ${isDetailsOpen ? 'text-indigo-600' : 'text-slate-300'}`}>{id}.</span> 
                  {l.numero} {l.type_voie} {l.nom_voie}
                </p>
                {/* AJOUT DU TRIANGLE ICI */}
                <ChevronDown 
                    size={20} 
                    className={`transition-transform duration-300 ${isDetailsOpen ? "rotate-180 text-indigo-600" : "text-slate-300"}`} 
                />
              </div>

              {isDetailsOpen && (
                <div className="mt-2 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-50 text-sm text-slate-700 leading-relaxed italic">
                    <span className="font-black text-indigo-800 uppercase text-[10px] not-italic block mb-1">Description du site :</span>
                    {l.description}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <footer className="mt-20 py-10 border-t border-slate-200 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em]">
            Patrimoine Toulousain • 2026 • Exploration Urbaine
        </p>
      </footer>
    </div>
  );
}
