"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

// --- Imports dynamiques pour Leaflet ---
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const Polygon = dynamic(() => import("react-leaflet").then((mod) => mod.Polygon), { ssr: false });

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

const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#7c3aed", "#ea580c", "#0891b2"];

// Coordonnées manuelles pour Plaisance-du-Touch (format Leaflet: [lat, lng])
const PATH_PLAISANCE: [number, number][] = [
  [43.536668, 1.310472], [43.535392, 1.299290], [43.525987, 1.289615],
  [43.535792, 1.260179], [43.545511, 1.255054], [43.552350, 1.237904],
  [43.559138, 1.246428], [43.566990, 1.248595], [43.569306, 1.253111],
  [43.566337, 1.271520], [43.572060, 1.292281], [43.577740, 1.288407],
  [43.587319, 1.273441], [43.598155, 1.282156], [43.599208, 1.284129],
  [43.594740, 1.304914], [43.584621, 1.292621], [43.577197, 1.293548],
  [43.566939, 1.323687], [43.559157, 1.328584], [43.550705, 1.314868],
  [43.538340, 1.311065], [43.536668, 1.310472]
];

export default function CodesPostauxPage() {
  const [codes, setCodes] = useState<CodePostal[]>([]);
  const [loading, setLoading] = useState(true);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    // Importation de Leaflet pour les icônes
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
    });

    fetch("/api/codes-postaux")
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const sorted = data.sort((a, b) => a.code_postal.localeCompare(b.code_postal, "fr", { numeric: true }));

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
      .catch(console.error);
  }, []);

  // Définition de la couleur pour Pibrac
  const colorPibrac = useMemo(() => {
    const indexPibrac = codes.findIndex(c => c.code_postal === "31820");
    return indexPibrac >= 0 ? COLORS[indexPibrac % COLORS.length] : "#2563eb";
  }, [codes]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-4 text-blue-700">
        📮 Codes postaux de Toulouse Métropole ({codes[codes.length - 1]?.numero ?? codes.length})
      </h1>

      {/* --- CARTE LEAFLET --- */}
      <div className="mb-8 border rounded-lg bg-gray-100 h-[70vh] relative overflow-hidden shadow-inner">
        {loading || !L ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-[1000]">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : (
          <MapContainer center={[43.6045, 1.444]} zoom={11} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            
            {codes.map((code, index) => {
              const color = code.code_postal === "31820" ? colorPibrac : COLORS[index % COLORS.length];
              const numero = code.numero ?? index + 1;

              // 1. Rendu des Polygones (GeoShape)
              const polygons = [];
              if (code.geo_shape?.geometry?.coordinates) {
                const coords = code.geo_shape.geometry.coordinates;
                const type = code.geo_shape.geometry.type;

                // Leaflet utilise [lat, lng] alors que GeoJSON utilise [lng, lat]
                if (type === "Polygon") {
                  coords.forEach((ring: any) => {
                    polygons.push(ring.map((c: any) => [c[1], c[0]]));
                  });
                } else if (type === "MultiPolygon") {
                  coords.forEach((poly: any) => {
                    poly.forEach((ring: any) => {
                      polygons.push(ring.map((c: any) => [c[1], c[0]]));
                    });
                  });
                }
              }

              // 2. Icône personnalisée pour le Marker
              const customIcon = L.divIcon({
                className: "custom-marker",
                html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 10px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${numero}</div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              });

              return (
                <div key={code.id}>
                  {/* Tracé des contours */}
                  {polygons.map((path, pIdx) => (
                    <Polygon 
                      key={`${code.id}-poly-${pIdx}`} 
                      positions={path} 
                      pathOptions={{ fillColor: color, fillOpacity: 0.25, color: color, weight: 2 }} 
                    />
                  ))}

                  {/* Polygone manuel Plaisance */}
                  {code.communes.includes("Plaisance-du-Touch") && (
                    <Polygon positions={PATH_PLAISANCE} pathOptions={{ fillColor: color, fillOpacity: 0.25, color: color, weight: 2 }} />
                  )}

                  {/* Marqueur au centre */}
                  {code.geo_point_2d && (
                    <Marker position={[code.geo_point_2d.lat, code.geo_point_2d.lon]} icon={customIcon}>
                      <Popup>
                        <strong>#${numero} – ${code.code_postal}</strong><br/>
                        ${code.communes.join(", ")}
                      </Popup>
                    </Marker>
                  )}
                </div>
              );
            })}
          </MapContainer>
        )}
      </div>

      {/* --- TABLEAU (CONSERVÉ À L'IDENTIQUE) --- */}
      <table className="w-full border border-collapse shadow-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">#</th>
            <th className="border p-2">Code postal</th>
            <th className="border p-2">Communes</th>
          </tr>
        </thead>
        <tbody>
          {codes.map(code => (
            <tr key={code.id} className="hover:bg-blue-50 transition-colors">
              <td className="border p-2 font-bold text-center">{code.numero}</td>
              <td className="border p-2 font-bold">{code.code_postal}</td>
              <td className="border p-2">{code.communes.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
