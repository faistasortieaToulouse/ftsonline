import { NextResponse } from 'next/server';

export async function GET() {
  try {
    /**
     * SOLUTION VERCEL : L'import dynamique.
     * En important le JSON ainsi, Next.js comprend qu'il doit inclure ce fichier 
     * dans le bundle de déploiement. Plus besoin de s'inquiéter de 'fs' ou de 'path'.
     * * Le chemin remonte depuis : src/app/api/histoireinternet/route.ts
     * vers la racine pour atteindre /data/mondecategories/
     */
    const histoireModule = await import('../../../../data/mondecategories/histoireinternet.json');
    
    // Les imports de JSON renvoient un objet avec une propriété 'default'
    const histoireData = histoireModule.default;

    return NextResponse.json(histoireData);

  } catch (error) {
    console.error("Erreur API Histoire Internet:", error);
    
    return NextResponse.json(
      { 
        error: "Impossible de charger les données historiques",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}
