"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

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
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [codes, setCodes] = useState<CodePostal[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Fetch et tri
  useEffect(() => {
    fetch("/api/codes-postaux")
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const sorted = data.sort((a,b)=>a.code_postal.localeCompare(b.code_postal,"fr",{numeric:true}));

        // Numérotation
        let num = 0;
        const processed: CodePostal[] = sorted.map(code => {
          if (code.code_postal === "31820") return { ...code, numero: 20 };
          num++;
          const numero = num < 20 ? num : num + 1;
          return { ...code, numero };
        });

        setCodes(processed);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!isReady || !mapRef.current || codes.length === 0) return;

    const map = new google.maps.Map(mapRef.current, {
      zoom: 11,
      center: { lat: 43.6045, lng: 1.444 },
      gestureHandling: "greedy"
    });
    mapInstance.current = map;
    const infoWindow = new google.maps.InfoWindow();
    const polygons: google.maps.Polygon[] = [];

    // Index de Pibrac pour couleur
    const indexPibrac = codes.findIndex(c => c.code_postal === "31820" && c.communes.includes("Pibrac"));
    const colorPibrac = indexPibrac >= 0 ? COLORS[indexPibrac % COLORS.length] : "#2563eb";

    codes.forEach((code, index) => {
      const color = code.code_postal === "31820" ? colorPibrac : COLORS[index % COLORS.length];
      const numero = code.numero ?? index + 1;

      // Marker
      if (code.geo_point_2d) {
        const marker = new google.maps.Marker({
          map,
          position: { lat: code.geo_point_2d.lat, lng: code.geo_point_2d.lon },
          label: String(numero),
          title: `#${numero} – ${code.code_postal}`
        });
        marker.addListener("click", () => {
          polygons.forEach(p => p.setOptions({ fillOpacity: 0.25 }));
          const poly = polygons[index]; if (poly) poly.setOptions({ fillOpacity: 0.55 });
          infoWindow.setContent(`<strong>#${numero} – ${code.code_postal}</strong><br/>${code.communes.join(", ")}`);
          infoWindow.open(map, marker);
        });
      }

      // Polygon depuis JSON avec sécurité
      if (code.geo_shape?.geometry?.coordinates) {
        const coords = code.geo_shape.geometry.coordinates;
        (Array.isArray(coords) ? coords : []).forEach((multi: any) => {
          if (!Array.isArray(multi)) return;
          multi.forEach((ring: any) => {
            if (!Array.isArray(ring)) return;
            const path = ring.map((coord: any) => {
              if (!Array.isArray(coord) || coord.length < 2) return { lat: 0, lng: 0 };
              const [lng, lat] = coord;
              return { lat, lng };
            });
            const polygon = new google.maps.Polygon({
              map,
              paths: path,
              strokeColor: color,
              strokeOpacity: 0.9,
              strokeWeight: 2,
              fillColor: color,
              fillOpacity: 0.25
            });
            polygons.push(polygon);
          });
        });
      }

      // Polygon manuel pour Plaisance-du-Touch si nécessaire
      if (code.communes.includes("Plaisance-du-Touch")) {
        const path = [
          { lat: 43.536668191723, lng: 1.3104729777505 },
          { lat: 43.535392912206, lng: 1.299290995075 },
          { lat: 43.525987758073, lng: 1.2896157438668 },
          { lat: 43.535792549921, lng: 1.2601798552868 },
          { lat: 43.545511565693, lng: 1.2550540493933 },
          { lat: 43.552350442615, lng: 1.2379040886319 },
          { lat: 43.559138282872, lng: 1.2464289596589 },
          { lat: 43.566990322517, lng: 1.24859517653 },
          { lat: 43.569306691334, lng: 1.2531115639794 },
          { lat: 43.566337149566, lng: 1.2715206897709 },
          { lat: 43.572060902268, lng: 1.2922817977817 },
          { lat: 43.577740748936, lng: 1.28840775057 },
          { lat: 43.587319788355, lng: 1.2734417028742 },
          { lat: 43.598155947613, lng: 1.2821568320575 },
          { lat: 43.599208588125, lng: 1.2841290027456 },
          { lat: 43.594740762403, lng: 1.3049145097859 },
          { lat: 43.584621590669, lng: 1.2926211572073 },
          { lat: 43.577197083679, lng: 1.293548848081 },
          { lat: 43.566939997447, lng: 1.3236877266691 },
          { lat: 43.559157183116, lng: 1.3285840219722 },
          { lat: 43.550705296115, lng: 1.3148681827284 },
          { lat: 43.538340491075, lng: 1.3110658142251 },
          { lat: 43.536668191723, lng: 1.3104729777505 }
        ];
        const polygon = new google.maps.Polygon({
          map,
          paths: path,
          strokeColor: color,
          strokeOpacity: 0.9,
          strokeWeight: 2,
          fillColor: color,
          fillOpacity: 0.25
        });
        polygons.push(polygon);
      }
    });
  }, [isReady, codes]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <h1 className="text-3xl font-extrabold mb-4 text-blue-700">
        📮 Codes postaux de Toulouse Métropole ({codes[codes.length-1]?.numero ?? codes.length})

      </h1>

      <div ref={mapRef} style={{ height: "70vh", width: "100%" }} className="mb-8 border rounded-lg bg-gray-100" />

      <table className="w-full border border-collapse">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">#</th>
            <th className="border p-2">Code postal</th>
            <th className="border p-2">Communes</th>
          </tr>
        </thead>
        <tbody>
          {codes.map(code => (
            <tr key={code.id}>
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
