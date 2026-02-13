import { NextResponse } from 'next/server';
import povertyData from '../../../../data/statistiques/tri_pays_taux_pauvrete.json';

export async function GET() {
  return NextResponse.json(povertyData);
}
