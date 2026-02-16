import { NextResponse } from 'next/server';
// Importation directe du fichier JSON
import inequalityData from '../../../../data/statistiques/tri_pays_indice_inegalites.json';

export async function GET() {
  try {
    // On retourne directement les données importées
    return NextResponse.json(inequalityData);
  } catch (error) {
    return NextResponse.json(
      { error: "Impossible de charger les données statistiques" },
      { status: 500 }
    );
  }
}
