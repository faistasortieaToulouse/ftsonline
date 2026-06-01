import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Ciblage du bon dossier et du bon fichier JSON
    const filePath = path.join(
      process.cwd(),
      "data",
      "territoire",
      "hoteldeville.json"
    );

    // Lecture synchrone du fichier
    const jsonData = fs.readFileSync(filePath, "utf-8");
    const mairies = JSON.parse(jsonData);

    // Sécurité : filtrer pour s'assurer que les coordonnées ou les champs essentiels existent
    const filtered = mairies.filter(
      (m: any) =>
        m?.nom &&
        m?.url &&
        m?.coordonnees &&
        typeof m.coordonnees.latitude === "number" &&
        typeof m.coordonnees.longitude === "number"
    );

    // Optionnel mais recommandé : trier par ordre alphabétique pour l'affichage de ta grille
    filtered.sort((a: any, b: any) => 
      a.nom.localeCompare(b.nom, "fr", { sensitivity: "base" })
    );

    return NextResponse.json(filtered);
  } catch (err) {
    console.error("❌ Erreur lecture hoteldeville.json :", err);
    return NextResponse.json(
      { error: "Impossible de charger les hôtels de ville." },
      { status: 500 }
    );
  }
}
