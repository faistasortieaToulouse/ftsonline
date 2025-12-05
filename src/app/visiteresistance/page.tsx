"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface ResistancePlace {
  nom: string;
  num: string;
  type_rue: string;
  nom_rue: string;
  appartient: string;
  site: string;
  quartier: string;
  etablissement: string;
  sigles: string;
  signification: string;
}

export default function VisiteResistancePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [places, setPlaces] = useState<ResistancePlace[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetch("/api/visiteresistance")
      .then((res) => res.json())
      .then((data: ResistancePlace[]) => setPlaces(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 14,
      center: { lat: 43.6045, lng: 1.444 }, // Toulouse
      scrollwheel: true,
      gestureHandling: "greedy",
    });

    const geocoder = new google.maps.Geocoder();

    places.forEach((place, i) => {
      const adresse = `Toulouse ${place.num} ${place.type_rue} ${place.nom_rue}`;
      geocoder.geocode({ address: adresse }, (results, status) => {
        if (status !== "OK" || !results?.[0]) return;

        const marker = new google.maps.Marker({
          map: mapInstance.current!,
          position: results[0].geometry.location,
          label: `${i + 1}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: place.appartient === "résistance" ? "green" : "red",
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: "black",
          },
          title: place.nom, // TITRE = nom
        });

        const infowindow = new google.maps.InfoWindow({
          content: `
            <strong>${i + 1}. ${place.nom}</strong><br>
            Établissement : ${place.etablissement}<br>
            Adresse : ${place.num} ${place.type_rue} ${place.nom_rue}<br>
            Quartier : ${place.quartier}<br>
            Site : ${place.site}<br>
            Sigles : ${place.sigles || ""}<br>
            Signification : ${place.signification || ""}<br>
            Appartient : ${place.appartient}
          `,
        });

        marker.addListener("click", () => infowindow.open(mapInstance.current, marker));
      });
    });
  }, [isReady, places]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <h1 className="text-3xl font-extrabold mb-6">
        🏛️ Visite Résistance — Toulouse
      </h1>

      <div
        ref={mapRef}
        style={{ height: "70vh", width: "100%" }}
        className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center"
      >
        {!isReady && <p>Chargement de la carte…</p>}
      </div>

      <h2 className="text-2xl font-semibold mb-4">
        Liste des lieux ({places.length})
      </h2>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {places.map((place, i) => (
          <li key={i} className="p-4 border rounded bg-white shadow">
            <p className="text-lg font-bold">
              {i + 1}. {place.nom} {/* NOM affiché en titre */}
            </p>
            <p>Établissement : {place.etablissement}</p>
            <p>Adresse : {place.num} {place.type_rue} {place.nom_rue}</p>
            <p>Quartier : {place.quartier}</p>
            <p>Site : {place.site}</p>
            <p>État : {place.sigles || "-"}</p>
            <p>Signification : {place.signification || "-"}</p>
            <p>Appartient : {place.appartient}</p>
          </li>
        ))}
      </ul>
       <h2 className="text-2xl font-semibold mt-10 mb-4">
    📑 Sigles et significations
  </h2>

  <table className="table-auto border-collapse border border-gray-400 w-full text-sm">
    <thead>
      <tr className="bg-gray-200">
        <th className="border border-gray-400 px-2 py-1">Sigles</th>
        <th className="border border-gray-400 px-2 py-1">Signification</th>
      </tr>
    </thead>
    <tbody>
      <tr><td className="border px-2 py-1">CNT</td><td className="border px-2 py-1">Comité national des Travailleurs</td></tr>
      <tr><td className="border px-2 py-1">UGT</td><td className="border px-2 py-1">Union générale des travailleurs</td></tr>
      <tr><td className="border px-2 py-1">AIT</td><td className="border px-2 py-1">Association internationale des travailleurs</td></tr>
      <tr><td className="border px-2 py-1">SI</td><td className="border px-2 py-1">Secrétariat International</td></tr>
      <tr><td className="border px-2 py-1">CGQJ</td><td className="border px-2 py-1">Commissariat général aux questions juives</td></tr>
      <tr><td className="border px-2 py-1">CAS</td><td className="border px-2 py-1">Comité Action Socialiste</td></tr>
      <tr><td className="border px-2 py-1">RA-DCA</td><td className="border px-2 py-1">Régiment d'Artillerie de Défense contre Aéronefs</td></tr>
      <tr><td className="border px-2 py-1">MMR</td><td className="border px-2 py-1">Mouvement Militaire de la Résistance</td></tr>
      <tr><td className="border px-2 py-1">SOL</td><td className="border px-2 py-1">Service d'ordre légionnaire</td></tr>
      <tr><td className="border px-2 py-1">CCA</td><td className="border px-2 py-1">Commission du contrôle de l'Armistice</td></tr>
      <tr><td className="border px-2 py-1">SS</td><td className="border px-2 py-1">SchutzStaffel</td></tr>
      <tr><td className="border px-2 py-1">SIPO-SD</td><td className="border px-2 py-1">Kommando der sicherheitspolizei</td></tr>
      <tr><td className="border px-2 py-1">GTE</td><td className="border px-2 py-1">Groupement de Travail des Etrangers</td></tr>
      <tr><td className="border px-2 py-1">RFA</td><td className="border px-2 py-1">Allemagne</td></tr>
      <tr><td className="border px-2 py-1">PSO</td><td className="border px-2 py-1">Parti Social Ouvrier</td></tr>
      <tr><td className="border px-2 py-1">CGMEA</td><td className="border px-2 py-1">Commissariat Général de la Main d'Œuvre en Allemagne</td></tr>
      <tr><td className="border px-2 py-1">PSOE</td><td className="border px-2 py-1">Parti socialiste Ouvrier Espagnol</td></tr>
      <tr><td className="border px-2 py-1">MLE</td><td className="border px-2 py-1">Mouvement Libertaire Espagnol</td></tr>
      <tr><td className="border px-2 py-1">FIJL</td><td className="border px-2 py-1">Fédération Ibérique de la Jeunesse Libertaire</td></tr>
      <tr><td className="border px-2 py-1">SIA</td><td className="border px-2 py-1">Solidarité Internationale Antifaciste</td></tr>
      <tr><td className="border px-2 py-1">FNDIR</td><td className="border px-2 py-1">Fédération Nationale des Déportés et Internés de la Résistance</td></tr>
      <tr><td className="border px-2 py-1">NAP</td><td className="border px-2 py-1">Noyautage des Administrations Publiques</td></tr>
      <tr><td className="border px-2 py-1">CDR</td><td className="border px-2 py-1">Conseil Départemental de la Résistance</td></tr>
      <tr><td className="border px-2 py-1">GIF</td><td className="border px-2 py-1">Groupe International Français</td></tr>
      <tr><td className="border px-2 py-1">AS</td><td className="border px-2 py-1">Armée Secrète</td></tr>
      <tr><td className="border px-2 py-1">CDL</td><td className="border px-2 py-1">Comité Départemental de Libération</td></tr>
      <tr><td className="border px-2 py-1">FFI</td><td className="border px-2 py-1">Forces Françaises de l'Intérieur</td></tr>
      <tr><td className="border px-2 py-1">ORA</td><td className="border px-2 py-1">Organisation de résistance de l'Armée</td></tr>
      <tr><td className="border px-2 py-1">FTPF</td><td className="border px-2 py-1">Francs-tireurs et Partisans français</td></tr>
      <tr><td className="border px-2 py-1">CFL</td><td className="border px-2 py-1">Corps Francs de Libération</td></tr>
      <tr><td className="border px-2 py-1">AG</td><td className="border px-2 py-1">Assemblée Générale</td></tr>
    </tbody>
  </table>
    </div>
  );
}
