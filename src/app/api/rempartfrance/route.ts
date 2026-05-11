import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

/**
 * Nettoie les données pour s'assurer que chaque ville a une description 
 * et gère les valeurs par défaut pour la conservation.
 */
function cleanData(data: any) {
  if (data && Array.isArray(data.villes)) {
    data.villes.forEach((v: any) => {
      // Valeur par défaut si la description est absente
      if (!v.description) v.description = "Aucune description disponible.";
      // S'assure que conservation_totale est un booléen (false par défaut)
      v.conservation_totale = !!v.conservation_totale;
    });
  }
  return data;
}

export async function GET() {
  try {
    // Chemin mis à jour pour pointer vers data/architecture/rempartfrance.json
    const filePath = path.join(process.cwd(), 'data', 'architecture', 'rempartfrance.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const json = JSON.parse(data);

    // Application du nettoyage
    const cleaned = cleanData(json);

    // Renvoie le JSON complet
    return NextResponse.json(cleaned);
  } catch (error) {
    console.error('Erreur API rempartfrance:', error);
    return NextResponse.json(
      { error: 'Impossible de lire le fichier des remparts' }, 
      { status: 500 }
    );
  }
}
