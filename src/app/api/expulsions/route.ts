import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // On construit le chemin vers le nouveau dossier 'mondecategories'
    const filePath = path.join(process.cwd(), 'data/mondecategories/expulsions.json');
    
    // Lecture du fichier sur le disque
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // Parsing et renvoi des données
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur API Expulsions:", error);
    return NextResponse.json(
      { error: 'Erreur de chargement des données expulsions' }, 
      { status: 500 }
    );
  }
}
