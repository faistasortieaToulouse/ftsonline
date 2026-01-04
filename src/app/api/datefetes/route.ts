import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // On construit le chemin absolu
    const filePath = path.join(process.cwd(), 'data', 'fetes', 'calendrier_complet.json');
    
    // On vérifie si le fichier existe avant de lire
    if (!fs.existsSync(filePath)) {
      console.error("Fichier non trouvé à :", filePath);
      return NextResponse.json([], { status: 404 });
    }

    const fileData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileData);
    
    // On s'assure de renvoyer un tableau vide si data n'est pas un tableau
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Erreur API DateFetes:", error);
    return NextResponse.json([], { status: 500 });
  }
}