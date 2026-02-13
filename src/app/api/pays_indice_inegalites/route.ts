import { NextResponse } from 'next/server';
// On importe directement le fichier JSON
import inegalitesData from '../../../../data/statistiques/tri_pays_indice_inegalites.json';

export async function GET() {
  try {
    return NextResponse.json(inegalitesData);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors du chargement des données" }, { status: 500 });
  }
}
