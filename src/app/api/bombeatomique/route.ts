import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// On force la route à être dynamique pour éviter que Next.js ne mette le JSON en cache
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "mondecategories", "bombeatomique.json");
    
    // Vérification de l'existence du fichier
    if (!fs.existsSync(filePath)) {
      console.error("Fichier introuvable à :", filePath);
      return NextResponse.json({ error: "Fichier non trouvé" }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(fileContent);

    // LOG DE DÉBOGAGE : Vérifiez vos logs serveur (Vercel ou terminal)
    console.log("Clés trouvées dans le JSON :", Object.keys(data));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur lecture JSON:", error);
    return NextResponse.json({ 
      error: "Erreur lors de la lecture", 
      details: error instanceof Error ? error.message : "Inconnu" 
    }, { status: 500 });
  }
}
