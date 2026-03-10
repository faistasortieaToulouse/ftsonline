import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // On utilise exactement la même méthode que pour tes autres catégories
    const filePath = path.join(
      process.cwd(),
      "data",
      "mondecategories",
      "immigration.json"
    );

    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(fileContents);
      return NextResponse.json(data);
    } else {
      // Debug pour voir où Vercel cherche réellement le fichier en cas d'erreur 404
      console.error("Fichier immigration.json manquant au chemin :", filePath);
      return NextResponse.json(
        { error: "Fichier introuvable", debugPath: filePath },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Erreur lecture json immigration :", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement des données" },
      { status: 500 }
    );
  }
}
