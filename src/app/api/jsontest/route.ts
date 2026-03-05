import { NextResponse } from 'next/server';

export async function GET() {
  try {
    /**
     * SOLUTION VERCEL : L'import dynamique.
     * Le chemin remonte depuis : src/app/api/mondecategories/espionnage/route.ts
     * (4 niveaux) pour atteindre /data/mondecategories/espionnage.json
     */
    const espionnageModule = await import('../../../../../data/mondecategories/jsontest.json');
    
    // Les imports de JSON renvoient un objet avec une propriété 'default'
    const espionnageData = espionnageModule.default;

    return NextResponse.json(espionnageData);

  } catch (error) {
    console.error("Erreur API Espionnage Industriel:", error);
    
    return NextResponse.json(
      { 
        error: "Impossible de charger les données sur l'espionnage", 
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}
