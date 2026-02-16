import { NextResponse } from 'next/server';
// On utilise le même chemin relatif que pour votre fichier recherche qui fonctionne
import inequalityData from '../../../../data/statistiques/tri_pays_indice_inegalites.json';

export async function GET() {
  try {
    // On s'assure de renvoyer le contenu complet (metadata + data)
    // tel qu'il est défini dans votre fichier JSON
    return NextResponse.json(inequalityData);
  } catch (error) {
    console.error("Erreur API Paystest:", error);
    return NextResponse.json(
      { error: "Impossible de charger les données." },
      { status: 500 }
    );
  }
}
