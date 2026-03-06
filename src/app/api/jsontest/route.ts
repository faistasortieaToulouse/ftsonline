import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Construction du chemin vers le fichier JSON
    const filePath = path.join(process.cwd(), "data", "mondecategories", "jsontest.json");
    
    // Lecture du fichier
    const fileContent = fs.readFileSync(filePath, "utf8");
    
    // Transformation en objet JS pour le renvoyer proprement
    const data = JSON.parse(fileContent);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur lecture JSON:", error);
    return NextResponse.json({ error: "Impossible de lire le fichier JSON" }, { status: 500 });
  }
}
