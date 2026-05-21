import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    // 1. Récupérer l'année depuis l'URL (ex: ?annee=2026)
    const { searchParams } = new URL(request.url);
    const anneeActuelle = new Date().getFullYear().toString();
    const annee = searchParams.get('annee') || anneeActuelle;

    // 2. Construire le chemin vers le fichier JSON de l'année demandée
    const filePath = path.join(process.cwd(), 'data', 'meteo', `vigilance${annee}.json`);

    // 3. Si le fichier n'existe pas encore (début d'année ou pas encore de données)
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ 
        annee, 
        historique: {}, 
        message: `Aucune donnée disponible pour l'année ${annee}.` 
      });
    }

    // 4. Lire et renvoyer le contenu du fichier JSON
    const contenu = fs.readFileSync(filePath, 'utf-8');
    const historique = contenu.trim() ? JSON.parse(contenu) : {};

    return NextResponse.json({ annee, historique });

  } catch (error: any) {
    console.error("Erreur API Historique Vigilance:", error);
    return NextResponse.json(
      { error: "Impossible de récupérer l'historique" }, 
      { status: 500 }
    );
  }
}
