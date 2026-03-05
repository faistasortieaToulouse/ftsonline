import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // process.cwd() part de la racine du projet, c'est beaucoup plus propre
    const filePath = path.join(process.cwd(), 'data/mondecategories/jsontest.json');
    
    // Lecture du fichier de manière synchrone
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // Analyse du JSON et renvoi de la réponse
    const data = JSON.parse(fileContents);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur lors de la lecture du fichier JSON d'espionnage :", error);
    
    return NextResponse.json(
      { 
        error: "Erreur lors de la lecture des données d'espionnage",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      }, 
      { status: 500 }
    );
  }
}
