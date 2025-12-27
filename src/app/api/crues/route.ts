import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const fileItineraire = path.join(
      process.cwd(),
      "data",
      "mairie",
      "itineraires-decouverte-des-reperes-de-crue.json"
    );

    const fileAdresses = path.join(
      process.cwd(),
      "data",
      "mairie",
      "itineraires-decouverte-des-reperes-de-crue-adresses.json"
    );

    if (!fs.existsSync(fileItineraire) || !fs.existsSync(fileAdresses)) {
      console.error("Fichiers crues introuvables !");
      return NextResponse.json([], { status: 200 });
    }

    const rawItineraire = JSON.parse(fs.readFileSync(fileItineraire, "utf-8"));
    const rawAdresses = JSON.parse(fs.readFileSync(fileAdresses, "utf-8"));

    if (!Array.isArray(rawItineraire) || !Array.isArray(rawAdresses)) {
      console.error("Les JSON ne sont pas des tableaux !");
      return NextResponse.json([], { status: 200 });
    }

    // On suppose que la correspondance est par index : 1er point de adresses -> 1er itinéraire
    const data = rawAdresses.map((item, index) => {
      const itineraire = rawItineraire[index] || {};

      return {
        id: index + 1,
        id_itineraire: itineraire.id_itineraire ?? index + 1,
        libelle_itineraire: itineraire.libelle_itineraire ?? "Repère de crue",
        adresse: item.adresse,
        geo_point_2d: { lat: item.lat, lon: item.lon },
        geo_shape: itineraire.geo_shape ?? null,
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur lecture crues :", error);
    return NextResponse.json({ error: "Impossible de charger les crues" }, { status: 500 });
  }
}
