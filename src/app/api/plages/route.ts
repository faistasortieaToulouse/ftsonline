import { NextResponse } from 'next/server';
import plagesData from '../../../../data/occitanie/plages.json';

export async function GET() {
  try {
    return NextResponse.json(plagesData);
  } catch (error) {
    return NextResponse.json({ error: "Erreur data" }, { status: 500 });
  }
}
