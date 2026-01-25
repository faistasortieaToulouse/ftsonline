"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface TheatrePlace {
  name: string;
  address: string;
  catégorie: "Théâtre" | "Salle de spectacle";
  url: string;
}

// Nouvelle interface pour stocker les statistiques
interface Stats {
  total: number;
  Théâtre: number;
  "Salle de spectacle": number;
}

export default function TheatreMapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [places, setPlaces] = useState<TheatrePlace[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, Théâtre: 0, "Salle de spectacle": 0 }); // Nouvel état pour les stats
  const [isReady, setIsReady] = useState(false);
  const [filters, setFilters] = useState<Record<TheatrePlace["catégorie"], boolean>>({
    Théâtre: true,
    "Salle de spectacle": true,
  });

  const categorieColors: Record<TheatrePlace["catégorie"], string> = {
    Théâtre: "red",
    "Salle de spectacle": "orange",
  };

  useEffect(() => {
    fetch("/api/theatrespectacle")
      .then((res) => res.json())
      .then((data: TheatrePlace[]) => {
        setPlaces(data);

        // --- CALCUL DES STATS ---
        const total = data.length;
        const countTheatres = data.filter(p => p.catégorie === "Théâtre").length;
        const countSalles = data.filter(p => p.catégorie === "Salle de spectacle").length;
        
        setStats({
          total: total,
          Théâtre: countTheatres,
          "Salle de spectacle": countSalles,
        });
        // ------------------------

      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    const filtered = places.filter(p => filters[p.catégorie]);

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 12,
      center: { lat: 43.6045, lng: 1.444 },
      scrollwheel: true,
      gestureHandling: "greedy",
    });

    const geocoder = new google.maps.Geocoder();

    filtered.forEach((place, i) => {
      geocoder.geocode({ address: place.address }, (results, status) => {
        if (status !== "OK" || !results?.[0]) return;

        const color = categorieColors[place.catégorie];

        const marker = new google.maps.Marker({
          map: mapInstance.current!,
          position: results[0].geometry.location,
          label: `${i + 1}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: color,
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: "black",
          },
        });

        const infowindow = new google.maps.InfoWindow({
          content: `<strong>${i + 1}. ${place.name}</strong><br>${place.address}<br><a href="${place.url}" target="_blank">Site web</a>`,
        });

        marker.addListener("click", () => infowindow.open(mapInstance.current, marker));
      });
    });
  }, [isReady, places, filters]);

  const toggleFilter = (catégorie: TheatrePlace["catégorie"]) => {
    setFilters(prev => ({ ...prev, [catégorie]: !prev[catégorie] }));
  };

  const filteredPlaces = places.filter(p => filters[p.catégorie]);

  return (
    <div className="p-4 max-w-7xl mx-auto">

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <h1 className="text-3xl font-extrabold mb-2">🎭 Carte des Théâtres & Salles de spectacle — Toulouse et banlieue</h1>
      
      {/* --- BLOC DES STATISTIQUES AJOUTÉ ICI --- */}
      <div className="mb-6 text-lg text-gray-700">
        <p className="font-bold">Total des lieux : {stats.total}</p>
        <p>Répartition : 
          <span className="font-semibold" style={{ color: categorieColors["Théâtre"] }}> {stats.Théâtre} Théâtres</span>
          <span> et </span>
          <span className="font-semibold" style={{ color: categorieColors["Salle de spectacle"] }}> {stats["Salle de spectacle"]} Salles de spectacle</span>.
        </p>
      </div>
      {/* ---------------------------------------- */}


      <div className="mb-4 flex flex-wrap gap-4">
        {Object.keys(filters).map(categorie => (
          <label key={categorie} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters[categorie as TheatrePlace["catégorie"]]}
              onChange={() => toggleFilter(categorie as TheatrePlace["catégorie"])}
            />
            <span style={{ color: categorieColors[categorie as TheatrePlace["catégorie"]] }}>
              {categorie}
            </span>
          </label>
        ))}
      </div>

      <div
        ref={mapRef}
        style={{ height: "70vh", width: "100%" }}
        className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center"
      >
        {!isReady && <p>Chargement de la carte…</p>}
      </div>

      <h2 className="text-2xl font-semibold mb-4">Liste complète ({filteredPlaces.length})</h2>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPlaces.map((place, i) => {
          const color = categorieColors[place.catégorie];
          return (
            <li key={i} className="p-4 border rounded bg-white shadow">
              <p className="text-lg font-bold">
                {i + 1}. {place.name} <span style={{ color }}>({place.catégorie})</span>
              </p>
              <p>{place.address}</p>
              <a href={place.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                Site web
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}