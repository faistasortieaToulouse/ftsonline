import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // 1. Définir le chemin vers le nouveau fichier JSON
    const jsonDirectory = path.join(process.cwd(), 'data', 'france');
    const fileContents = await fs.readFile(jsonDirectory + '/Liste_Colonies_France.json', 'utf8');
    
    // 2. Parser le contenu
    const data = JSON.parse(fileContents);

    // 3. Traiter les données
    // Si votre JSON est directement une liste [], on l'utilise telle quelle.
    // Si c'est un objet avec une clé { "colonies": [] }, remplacez 'data' par 'data.colonies'
    const colonies = Array.isArray(data) ? data : data.colonies;

    // On s'assure que les données sont bien formées pour le frontend
    const formattedData = colonies.map((c: any) => ({
      ...c,
      // On garde grande_entite, territoire et periode tels quels
      // On s'assure que lat et lng sont bien présents
      lat: c.lat,
      lng: c.lng
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Erreur API ColonieFrance:", error);
    return NextResponse.json({ error: 'Erreur lors de la lecture des données' }, { status: 500 });
  }
}