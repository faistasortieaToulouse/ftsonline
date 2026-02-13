import { NextResponse } from 'next/server';
// Utilisation de l'import relatif pour éviter les erreurs de build
import researchData from '../../../../data/statistiques/tri_pays_recherche.json';

export async function GET() {
  return NextResponse.json(researchData);
}
