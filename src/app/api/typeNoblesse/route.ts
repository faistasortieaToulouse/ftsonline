import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "hierarchie", "typeNoblesse.json");
    console.log("Lecture du fichier :", filePath); // pour déboguer
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(fileContents);

    // On renvoie uniquement le tableau des castes de la noblesse
    const castes = data.hierarchie_noblesse_francaise.castes_de_la_noblesse;
    return NextResponse.json(castes);
  } catch (error) {
    console.error("Erreur dans route.ts:", error);
    return NextResponse.json(
      { error: "Impossible de charger les données de la noblesse." },
      { status: 500 }
    );
  }
}
