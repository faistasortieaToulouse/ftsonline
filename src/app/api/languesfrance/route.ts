import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Chemin vers ton nouveau fichier JSON contenant les 131 langues
    const filePath = path.join(process.cwd(), 'data', 'toulousain', 'languesfrance.json');
    
    // Lecture asynchrone pour de meilleures performances
    const fileContents = await fs.readFile(filePath, 'utf8');
    
    // Parsing du JSON
    const data = JSON.parse(fileContents);

    // Validation de la structure
    if (!data || !Array.isArray(data.langues)) {
      return NextResponse.json(
        { error: "Structure de données 'langues' introuvable ou invalide" }, 
        { status: 400 }
      );
    }

    // On renvoie le tableau des langues avec un header de cache (optionnel)
    // Cela évite de relire le disque à chaque mouvement de carte
    return NextResponse.json(data.langues, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error("Erreur API LanguesFrance:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des 131 langues" }, 
      { status: 500 }
    );
  }
}
