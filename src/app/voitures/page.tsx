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
        setTraficData(data);
      } catch (err) {
        console.error(err);
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
        const color = point.debit > 500 ? "#ef4444" : "#22c55e"; // Rouge si débit élevé

        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${color}; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${count}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const popupContent = `
          <div style="font-family: sans-serif; min-width: 150px;">
            <strong style="display:block; border-bottom:1px solid #ccc; margin-bottom:5px;">${point.voie}</strong>
            <b>Débit :</b> ${point.debit} véh/h<br/>
            <b>Vitesse moy :</b> ${point.vitesse} km/h
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
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold transition-all">
          <ArrowLeft size={20} /> Retour
        </Link>
      </nav>

      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <Car className="text-indigo-600" size={36} /> Trafic en Temps Réel
        </h1>
        <p className="text-slate-500 italic">Analyse des points de comptage de Toulouse Métropole</p>
      </div>

      <div style={{ height: "50vh" }} className="mb-8 border-4 border-white rounded-2xl shadow-xl relative overflow-hidden">
        <div ref={mapRef} className="h-full w-full" />
        {(isLoading || !isMapReady) && (
          <div className="absolute inset-0 bg-slate-100/80 flex items-center justify-center z-[1000]">
            <p className="animate-bounce font-bold text-indigo-600">Chargement du trafic...</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="p-4 text-center w-16">#</th>
              <th className="p-4">Voie de circulation</th>
              <th className="p-4">Débit (véh/h)</th>
              <th className="p-4 hidden md:table-cell">Vitesse Moyenne</th>
            </tr>
          </thead>
          <tbody>
            {traficData.map((point, i) => (
              <TraficRow key={point.id} point={point} index={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TraficRow({ point, index }: { point: TraficPoint; index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const isHeavy = (point.debit > 500);

  return (
    <>
      <tr 
        className={`border-b border-slate-100 cursor-pointer md:cursor-default hover:bg-indigo-50/30 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <td className="p-4 text-center font-bold text-indigo-600">{index + 1}</td>
        <td className="p-4 font-semibold text-slate-800">{point.voie}</td>
        <td className="p-4">
          <span className={`px-2 py-1 rounded text-xs font-bold ${isHeavy ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            {point.debit}
          </span>
        </td>
        <td className="p-4 hidden md:table-cell">
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <Gauge size={14} /> {point.vitesse} km/h
          </div>
        </td>
      </tr>
      {isOpen && (
        <tr className="md:hidden bg-indigo-50/50">
          <td colSpan={3} className="p-4 text-sm text-slate-600 italic">
            Vitesse moyenne enregistrée : <strong>{point.vitesse} km/h</strong><br/>
            Dernière mise à jour : {new Date(point.derniere_maj).toLocaleTimeString()}
          </td>
        </tr>
      )}
    </>
  );
}
