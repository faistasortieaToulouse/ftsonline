import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "mondecategories", "connectes.json");

    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(fileContents);
      return NextResponse.json(data);
    } else {
      console.error("Fichier connectes.json manquant :", filePath);
      return NextResponse.json(
        { error: "Fichier introuvable", debugPath: filePath },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Erreur API Connectés :", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement des données" },
      { status: 500 }
    );
  }
}
