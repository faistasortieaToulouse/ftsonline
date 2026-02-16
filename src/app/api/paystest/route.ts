import { NextResponse } from 'next/server';
/**
 * On utilise "../../../" pour remonter depuis :
 * src/app/api/paystest/ -> src/app/api/ -> src/app/ -> src/ -> RACINE
 * Puis on redescend dans /data
 */
import inequalityData from '../../../../data/statistiques/tri_pays_indice_inegalites.json';

export async function GET() {
  try {
    // Les données sont intégrées au bundle lors du build
    return NextResponse.json(inequalityData);
  } catch (error) {
    console.error("Erreur lors de la distribution du JSON :", error);
    return NextResponse.json(
      { error: "Impossible de charger les données." },
      { status: 500 }
    );
  }
}
