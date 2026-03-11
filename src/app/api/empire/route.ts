import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Construction du chemin absolu vers le fichier JSON des empires
    const filePath = path.join(process.cwd(), 'data', 'histoire', 'empire.json');
    
    // Lecture synchrone du fichier
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // Parsing du JSON
    const data = JSON.parse(fileContents);

    // Sécurité : on vérifie que les données sont bien un tableau
    if (!Array.isArray(data)) {
        return NextResponse.json({ error: "Format de données invalide : un tableau est attendu" }, { status: 400 });
    }

    // On renvoie le tableau des empires
    return NextResponse.json(data);

  } catch (error) {
    console.error("Erreur API Empire:", error);
    return NextResponse.json({ error: "Impossible de charger le fichier JSON" }, { status: 500 });
  }
}
