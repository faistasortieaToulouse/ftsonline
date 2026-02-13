import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Utilisation de path.resolve pour une meilleure gestion des chemins en production
    const filePath = path.resolve(process.cwd(), 'data/statistiques/tri_pays_niveau_vie.json');
    
    // Utilisation de fs.promises (async) pour ne pas bloquer l'event loop
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // Retourne les données qui incluent désormais "score_spi_2026"
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Erreur API Niveau de Vie:", error);
    return NextResponse.json(
      { error: "Erreur de lecture des données niveau de vie" }, 
      { status: 500 }
    );
  }
}
