import { NextResponse } from 'next/server';
import ppaData from '../../../../data/statistiques/tri_pays_pouvoir_achat.json';

export async function GET() {
  return NextResponse.json(ppaData);
}
