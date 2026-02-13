import { NextResponse } from 'next/server';
// On utilise l'import relatif pour garantir le succès du build (vu l'erreur précédente)
import pollutionData from '../../../../data/statistiques/tri_pays_pollution.json';

export async function GET() {
  // Comme ton JSON contient déjà "metadata" et "data", 
  // on renvoie l'objet entier directement.
  return NextResponse.json(pollutionData);
}
