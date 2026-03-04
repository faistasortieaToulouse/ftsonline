import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // On construit le chemin de manière robuste
    const filePath = path.join(
      process.cwd(), 
      'data', 
      'mondecategories', 
      'histoireinternet.json'
    );

    // On vérifie si le fichier existe physiquement
    if (!fs.existsSync(filePath)) {
      console.error(`Fichier non trouvé au chemin : ${filePath}`);
      return NextResponse.json(
        { error: "Le fichier de données est introuvable" },
        { status: 404 }
      );
    }

    // On lit le fichier
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // On parse le JSON
    const histoireData = JSON.parse(fileContent);

    return NextResponse.json(histoireData);
  } catch (error) {
    console.error("Erreur API Histoire:", error);
    return NextResponse.json(
      { error: "Impossible de charger les données historiques" },
      { status: 500 }
    );
  }
}
