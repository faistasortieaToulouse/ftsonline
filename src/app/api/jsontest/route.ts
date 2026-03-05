import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // On utilise exactement la même méthode que pour tes lacs
    const filePath = path.join(
      process.cwd(),
      "data",
      "mondecategories",
      "jsontest.json"
    );

    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(fileContents);
      return NextResponse.json(data);
    } else {
      // Debug pour voir où Vercel cherche réellement le fichier
      console.error("Fichier manquant au chemin :", filePath);
      return NextResponse.json(
        { error: "Fichier introuvable", debugPath: filePath },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Erreur lecture jsontest :", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement des données" },
      { status: 500 }
    );
  }
}
