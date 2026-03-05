import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // On calque exactement la structure qui fonctionne pour jsontest
    const filePath = path.join(
      process.cwd(),
      "data",
      "mondecategories",
      "espionnage.json"
    );

    // Vérification de l'existence du fichier
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(fileContents);
      return NextResponse.json(data);
    } else {
      // Debug identique pour voir le chemin exact dans les logs Vercel
      console.error("[API Espionnage] Fichier manquant au chemin :", filePath);
      return NextResponse.json(
        { error: "Fichier espionnage.json introuvable", debugPath: filePath },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Erreur lecture espionnage :", error);
    return NextResponse.json(
      { 
        error: "Erreur lors du traitement des données d'espionnage",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}
