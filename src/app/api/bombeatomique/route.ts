import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Chemin dynamique pointant vers ton nouveau fichier bombeatomique.json
    const filePath = path.join(
      process.cwd(),
      "data",
      "mondecategories",
      "bombeatomique.json"
    );

    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(fileContents);
      return NextResponse.json(data);
    } else {
      // Log utile pour le débuggage en production (Vercel)
      console.error("Fichier JSON introuvable :", filePath);
      return NextResponse.json(
        { error: "Archive atomique introuvable", path: filePath },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Erreur critique API Atome :", error);
    return NextResponse.json(
      { error: "Erreur lors du déchiffrement des données" },
      { status: 500 }
    );
  }
}
