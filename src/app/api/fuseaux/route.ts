import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // On remonte d'un niveau si nécessaire pour trouver le dossier 'data' à la racine
    const filePath = path.join(process.cwd(), 'data/mapmonde/ne_10m_time_zones.geojson');
    
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur API Fuseaux:", error);
    return NextResponse.json({ error: "Fichier introuvable dans data/mapmonde/" }, { status: 500 });
  }
}
