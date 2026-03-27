import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // On utilise exactement la même méthode que pour tes autres catégories
    const filePath = path.join(
      process.cwd(),
      "data",
      "toulouseain", // Ton dossier spécifique
      "evenementsToulouse.json" // Ton fichier d'événements
    );

    // Vérification de l'existence du fichier
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(fileContents);
      return NextResponse.json(data);
    } else {
      // Ce log est crucial pour débugger dans la console Vercel si le fichier n'est pas trouvé
      console.error("Fichier Toulouse manquant au chemin :", filePath);
      return NextResponse.json(
        { error: "Fichier introuvable", debugPath: filePath },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Erreur lecture json toulouse :", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement des données" },
      { status: 500 }
    );
  }
}
