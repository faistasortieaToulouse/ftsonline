import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // path.join(process.cwd(), ...) pointe à la RACINE du projet (là où est ton package.json)
    const filePath = path.join(process.cwd(), 'data/statistiques/tri_pays_indice_inegalites.json');
    
    // Lecture du fichier sur le disque
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // Transformation du texte en objet JSON
    const data = JSON.parse(fileContents);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur API Inégalités:", error);
    return NextResponse.json(
      { error: "Impossible de charger le fichier JSON. Vérifiez que le chemin data/statistiques/tri_pays_indice_inegalites.json est correct." }, 
      { status: 500 }
    );
  }
}
