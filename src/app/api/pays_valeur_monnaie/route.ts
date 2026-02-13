import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Chemin vers ton fichier JSON de valeur de monnaie
    const filePath = path.join(process.cwd(), 'data', 'statistiques', 'tri_pays_valeur_monnaie.json');
    
    // Lecture du fichier
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Parsing des données
    const data = JSON.parse(fileContent);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur lors de la lecture des données monétaires:", error);
    return NextResponse.json(
      { error: "Impossible de charger les données monétaires" },
      { status: 500 }
    );
  }
}
