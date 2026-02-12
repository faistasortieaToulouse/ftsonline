// src/app/api/tisseotia/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const GITHUB_JSON_URL = "https://raw.githubusercontent.com/faistasortieaToulouse/ftsonline/vercel-deploy/data/tisseo/tia.json";

  try {
    const response = await fetch(GITHUB_JSON_URL);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des données');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Impossible de charger les données" }, { status: 500 });
  }
}
