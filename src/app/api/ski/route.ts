import { NextResponse } from 'next/server';
import skiData from '../../../../data/occitanie/ski.json';

export async function GET() {
  try {
    return NextResponse.json(skiData);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors du chargement des stations" }, { status: 500 });
  }
}
