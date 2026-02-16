import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // 1. On définit le chemin absolu à partir de la racine du projet (process.cwd())
    const jsonDirectory = path.join(process.cwd(), 'data', 'statistiques');
    const fileContents = await fs.readFile(jsonDirectory + '/tri_pays_indice_inegalites.json', 'utf8');
    
    // 2. On parse le contenu JSON
    const data = JSON.parse(fileContents);

    // 3. On retourne les données
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur lors de la lecture du JSON :", error);
    return NextResponse.json(
      { error: "Impossible de charger le fichier de données." },
      { status: 500 }
    );
  }
}
