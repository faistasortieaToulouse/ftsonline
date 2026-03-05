import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // 1. Définition du chemin absolu (part de la racine du projet)
    // Cela remplace avantageusement le ../../../../../ qui cassait le build
    const filePath = path.join(process.cwd(), 'data', 'mondecategories', 'espionnage.json');
    
    // 2. Vérification de sécurité (évite le crash si le fichier est déplacé)
    if (!fs.existsSync(filePath)) {
      console.error(`[API Espionnage] Fichier introuvable : ${filePath}`);
      return NextResponse.json(
        { error: "Le fichier de données espionnage.json est introuvable." }, 
        { status: 404 }
      );
    }

    // 3. Lecture du fichier en UTF-8
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // 4. Conversion du texte en JSON et envoi
    const data = JSON.parse(fileContents);
    
    return NextResponse.json(data);

  } catch (error) {
    console.error("Erreur API Espionnage Industriel:", error);
    
    return NextResponse.json(
      { 
        error: "Impossible de charger les données sur l'espionnage", 
        details: error instanceof Error ? error.message : "Erreur de lecture système"
      },
      { status: 500 }
    );
  }
}
