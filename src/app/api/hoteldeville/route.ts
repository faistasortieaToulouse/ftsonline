import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface Mairie {
  nom: string;
  ville: string;
  url: string;
  coordonnees: {
    latitude: number;
    longitude: number;
  };
}

export async function GET() {
  try {
    // Utilisation stricte de process.cwd() et de la structure qui fonctionne
    const filePath = path.join(
      process.cwd(),
      "data",
      "territoire",
      "hoteldeville.json"
    );

    // Lecture sécurisée
    const jsonData = fs.readFileSync(filePath, "utf-8");
    const mairies = JSON.parse(jsonData);

    // 1. Sécurité absolue : On filtre pour ne garder QUE les mairies qui ont des coordonnées valides
    // Cela évite que Leaflet ou l'API ne plantent si un élément est incomplet
    const filteredMairies = mairies.filter(
      (m: any) =>
        m?.coordonnees &&
        typeof m.coordonnees.latitude === "number" &&
        typeof m.coordonnees.longitude === "number"
    );

    // 2. Tri par ordre alphabétique sur les données filtrées
    filteredMairies.sort((a: Mairie, b: Mairie) => {
      const nomA = a?.nom || "";
      const nomB = b?.nom || "";
      return nomA.localeCompare(nomB, "fr", { sensitivity: "base" });
    });

    return NextResponse.json(filteredMairies);
  } catch (err) {
    console.error("❌ Erreur lecture hoteldeville.json :", err);
    return NextResponse.json(
      { error: "Impossible de charger les hôtels de ville." },
      { status: 500 }
    );
  }
}
