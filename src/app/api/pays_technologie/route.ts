import { NextResponse } from 'next/server';
import techData from '../../../../data/statistiques/tri_pays_technologie.json';

export async function GET() {
  return NextResponse.json(techData);
}
