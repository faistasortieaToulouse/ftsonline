import { NextResponse } from 'next/server';

export async function GET() {
  const URL = "https://raw.githubusercontent.com/faistasortieaToulouse/ftsonline/vercel-deploy/data/tisseo/tia_iti.json";

  try {
    const response = await fetch(URL, {
      next: { revalidate: 3600 } // Cache d'une heure
    });

    if (!response.ok) throw new Error('Erreur réseau');
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erreur de chargement des tracés" }, { status: 500 });
  }
}
