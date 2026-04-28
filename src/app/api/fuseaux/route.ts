import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // 1. Chemin absolu vers le fichier GeoJSON
    const filePath = path.join(process.cwd(), 'data', 'mapmonde', 'ne_10m_time_zones.geojson');
    
    // 2. Lecture du fichier
    const fileContent = await fs.readFile(filePath, 'utf8');
    
    // 3. Parsing JSON (on nettoie les éventuels espaces vides autour du texte)
    const data = JSON.parse(fileContent.trim());

    // 4. Retour avec succès
    return NextResponse.json(data);

  } catch (error: any) {
    // On log l'erreur précise en console pour le débuggage
    console.error("Erreur API Fuseaux:", error.message);
    
    return NextResponse.json(
      { error: "Impossible de charger les données cartographiques." }, 
      { status: 500 }
    );
  }
}
