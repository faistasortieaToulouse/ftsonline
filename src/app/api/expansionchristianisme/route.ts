import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      'data', // Dossier à la racine
      'histoire',
      'expansion_christianisme.json'
    );

    const fileContents = await fs.readFile(filePath, 'utf8');
    const rawData = JSON.parse(fileContents);

    // On extrait la clé principale de votre JSON
    const sourceData = rawData.diffusion_hebraisme_mondiale;

    // Pas de transformation complexe nécessaire ici car la structure 
    // { "Afrique": [...], "Asie": [...] } est déjà celle attendue par le tableau
    return NextResponse.json(sourceData);

  } catch (error) {
    console.error("Erreur de lecture du fichier JSON:", error);
    return NextResponse.json(
      { error: "Fichier expansion_christianisme.json non trouvé" },
      { status: 500 }
    );
  }
}