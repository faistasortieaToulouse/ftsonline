'use client';

import { useEffect, useRef, useState, CSSProperties } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp, Car, Gauge } from "lucide-react";

interface TraficPoint {
  id: string;
  voie: string;
  vitesse: number | string;
  debit: number;
  coords: [number, number];
  derniere_maj: string;
}

const TOULOUSE_CENTER: [number, number] = [43.6047, 1.4442];

export default function TraficToulousePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const [traficData, setTraficData] = useState<TraficPoint[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/voitures');
        const data = await res.json();
        
        // 1. Filtrage des coordonnées
        // 2. TRI DÉCROISSANT par Trafic Journalier (Moyen)
        const sortedData = data
          .filter((p: any) => p.coords && p.coords.length === 2)
          .sort((a: TraficPoint, b: TraficPoint) => b.debit - a.debit);

        setTraficData(sortedData);
      } catch (err) {
        console.error("Erreur de récupération:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || traficData.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      
      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current!).setView(TOULOUSE_CENTER, 12);
        L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap France'
        }).addTo(mapInstance.current);
        markersLayerRef.current = L.layerGroup().addTo(mapInstance.current);
      }

      markersLayerRef.current.clearLayers();

      traficData.forEach((point, i) => {
        const count = i + 1;
        // Couleur BLEU CIEL (Sky Blue)
        const skyBlueColor = "#0ea5e9"; 

        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${skyBlueColor}; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${count}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const popupContent = `
          <div style="font-family: sans-serif; min-width: 150px; padding: 5px;">
            <strong style="display:block; border-bottom:1px solid #eee; margin-bottom:5px; color: #334155;">${point.voie}</strong>
            <div style="font-size: 12px;">
              <b>Trafic (TMJO) :</b> ${point.debit} véhicules/j<br/>
              <b>Vitesse V85 :</b> ${point.vitesse} km/h
            </div>
          </div>
        `;

        L.marker(point.coords, { icon: customIcon })
          .addTo(markersLayerRef.current)
          .bindPopup(popupContent);
      });
      setIsMapReady(true);
    };

    initMap();
  }, [traficData]);

  return (
    <div className="p-4 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-800 font-bold transition-all">
          <ArrowLeft size={20} /> Retour
        </Link>
      </nav>

      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 italic uppercase tracking-tighter">
          <Car className="text-sky-600" size={36} /> Trafic <span className="text-sky-600">Toulouse</span>
        </h1>
        <p className="text-slate-500 font-medium italic underline decoration-sky-200">
          Classement par débit journalier décroissant
        </p>
      </div>

      <div style={{ height: "55vh" }} className="mb-8 border-4 border-white rounded-3xl shadow-2xl relative overflow-hidden bg-slate-200">
        <div ref={mapRef} className="h-full w-full z-0" />
        {(isLoading || !isMapReady) && (
          <div className="absolute inset-0 bg-slate-100/90 flex flex-col items-center justify-center z-50">
            <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="font-bold text-slate-600">Chargement des données...</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="p-4 text-center w-16">#</th>
              <th className="p-4 uppercase text-xs font-black tracking-widest">Voie de circulation</th>
              <th className="p-4 uppercase text-xs font-black tracking-widest">Trafic Journalier (Moyen) ↓</th>
              <th className="p-4 hidden md:table-cell uppercase text-xs font-black tracking-widest">Vitesse V85</th>
            </tr>
          </thead>
          <tbody>
            {traficData.length > 0 ? (
              traficData.map((point, i) => (
                <TraficRow key={point.id || i} point={point} index={i} />
              ))
            ) : (
              !isLoading && (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-slate-400">Aucune donnée reçue.</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TraficRow({ point, index }: { point: TraficPoint; index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  // Badge bleu ciel si trafic important
  const isBusy = (point.debit > 2000);

  return (
    <>
      <tr 
        className={`border-b border-slate-100 cursor-pointer md:cursor-default transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-sky-50/50`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <td className="p-4 text-center font-bold text-sky-600">{index + 1}</td>
        <td className="p-4 font-bold text-slate-800">{point.voie}</td>
        <td className="p-4">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${isBusy ? 'bg-sky-600 text-white' : 'bg-sky-100 text-sky-700'}`}>
            {point.debit.toLocaleString()} véh/j
          </span>
        </td>
        <td className="p-4 hidden md:table-cell text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <Gauge size={14} className="text-sky-400" /> {point.vitesse} km/h
          </div>
        </td>
      </tr>
      {isOpen && (
        <tr className="md:hidden bg-sky-50/30">
          <td colSpan={3} className="p-4 text-sm text-slate-600 border-b border-sky-100">
            <div className="space-y-1">
              <p>📍 <b>Vitesse V85 :</b> {point.vitesse} km/h</p>
              <p>📅 <b>Mise à jour :</b> {new Date(point.derniere_maj).toLocaleDateString()}</p>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
