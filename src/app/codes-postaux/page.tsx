"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface GeoPoint { lat: number; lon: number }
interface GeoShape { geometry: { coordinates: any; type: string } }

interface CodePostal {
  id: string;
  code_postal: string;
  communes: string[];
  geo_point_2d: GeoPoint | null;
  geo_shape: GeoShape | null;
  numero?: number;
}

const COLORS = ["#2563eb","#16a34a","#dc2626","#7c3aed","#ea580c","#0891b2"];

export default function CodesPostauxPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [codes, setCodes] = useState<CodePostal[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch et Traitement des données
  useEffect(() => {
    fetch("/api/codes-postaux")
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const sorted = data.sort((a,b) => a.code_postal.localeCompare(b.code_postal,"fr",{numeric:true}));

        let num = 0;
        const processed: CodePostal[] = sorted.map(code => {
          if (code.code_postal === "31820") return { ...code, numero: 20 };
          num++;
          const numero = num < 20 ? num : num + 1;
          return { ...code, numero };
        });

        setCodes(processed);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // 2. Initialisation de Leaflet (Méthode OTAN)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || codes.length === 0) return;

    let L: any;

    const initMap = async () => {
      L = (await import("leaflet")).default;

      if (mapInstance.current) return;

      // Création de la carte
      const map = L.map(mapRef.current).setView([43.6045, 1.444], 11);
      mapInstance.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      // Ajout des données (Marqueurs et Polygones)
      codes.forEach((code, index) => {
        const color = COLORS[index % COLORS.length];
        const numero = code.numero ?? index + 1;

        // A. Ajout du Marqueur Numéroté
        if (code.geo_point_2d) {
          const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${numero}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          L.marker([code.geo_point_2d.lat, code.geo_point_2d.lon], { icon: customIcon })
            .addTo(map)
            .bindPopup(`<strong>#${numero} – ${code.code_postal}</strong><br/>${code.communes.join(", ")}`);
        }

        // B. Ajout du Polygone (GeoShape)
        if (code.geo_shape?.geometry?.coordinates) {
          const type = code.geo_shape.geometry.type;
          const coords = code.geo_shape.geometry.coordinates;

          // Fonction pour inverser [lng, lat] en [lat, lng] pour Leaflet
          const formatCoords = (c: any[]) => c.map(pt => [pt[1], pt[0]]);

          if (type === "Polygon") {
            L.polygon(formatCoords(coords[0]), {
              color: color, fillOpacity: 0.2, weight: 2
            }).addTo(map);
          } else if (type === "MultiPolygon") {
            coords.forEach((poly: any) => {
              L.polygon(formatCoords(poly[0]), {
                color: color, fillOpacity: 0.2, weight: 2
              }).addTo(map);
            });
          }
        }
      });
    };

    initMap();

    // NETTOYAGE : Détruit la carte pour éviter le bug "Map container already initialized"
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [codes]);

  return (
    <div className="p-4 max-w-7xl mx-auto min-h-screen bg-slate-50">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 font-bold group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-4 text-blue-700">
        📮 Codes postaux de Toulouse Métropole ({codes.length > 0 ? codes[codes.length-1].numero : "..."})
      </h1>

      {/* Conteneur de la Carte */}
      <div className="relative mb-8 border-4 border-white shadow-xl rounded-2xl overflow-hidden h-[70vh] bg-slate-200">
        <div ref={mapRef} className="h-full w-full z-0" />
        
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100/60 backdrop-blur-sm">
            <Loader2 className="animate-spin text-blue-600" size={48} />
          </div>
        )}
      </div>

      {/* Tableau des données */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 font-bold border-b">#</th>
              <th className="p-4 font-bold border-b">Code postal</th>
              <th className="p-4 font-bold border-b">Communes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {codes.map((code) => (
              <tr key={code.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-black text-blue-600">{code.numero}</td>
                <td className="p-4 font-bold text-slate-700">{code.code_postal}</td>
                <td className="p-4 text-slate-600">{code.communes.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}