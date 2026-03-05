import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Construction du chemin absolu depuis la racine du projet
    const filePath = path.join(process.cwd(), 'data', 'mondecategories', 'jsontest.json');
    
    // Vérification de l'existence du fichier
    if (!fs.existsSync(filePath)) {
      console.error(`[API Error] Fichier introuvable au chemin : ${filePath}`);
      return NextResponse.json({ error: "Fichier de données manquant" }, { status: 404 });
    }

    // Lecture du contenu texte
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // Transformation du texte en objet JSON
    const data = JSON.parse(fileContents);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API Error] Erreur critique :", error);
    return NextResponse.json(
      { 
        error: "Erreur lors du traitement des données",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      }, 
      { status: 500 }
    );
  }
}
